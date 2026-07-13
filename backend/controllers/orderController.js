const Order = require("../models/order");
const Cart = require("../models/cartModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// ======================================================
// CREATE NEW ORDER
// ======================================================

exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  const { session_id } = req.body;

  if (!session_id) {
    return next(
      new ErrorHandler("Stripe session ID is required", 400)
    );
  }

  const session = await stripe.checkout.sessions.retrieve(session_id);

  if (session.payment_status !== "paid") {
    return next(
      new ErrorHandler("Payment has not been completed", 400)
    );
  }

  // Prevent duplicate orders
  const existingOrder = await Order.findOne({
    "paymentInfo.id": session.payment_intent,
  });

  if (existingOrder) {
    return res.status(200).json({
      success: true,
      order: existingOrder,
    });
  }

  const cart = await Cart.findOne({
    user: req.user._id,
  })
    .populate({
      path: "items.foodItem",
      select: "name price images stock",
    })
    .populate({
      path: "restaurant",
      select: "name",
    });

  if (!cart) {
    return next(new ErrorHandler("Cart not found", 404));
  }

  if (!cart.items.length) {
    return next(new ErrorHandler("Cart is empty", 400));
  }

  const shippingDetails =
    session.collected_information?.shipping_details ||
    session.shipping_details;

  if (!shippingDetails || !shippingDetails.address) {
    return next(
      new ErrorHandler("Shipping information not found", 400)
    );
  }

  const address = shippingDetails.address;

  const deliveryInfo = {
    address: [address.line1, address.line2]
      .filter(Boolean)
      .join(" "),
    city: address.city,
    phoneNo:
      session.customer_details?.phone || "Not provided",
    postalCode: address.postal_code,
    country: address.country,
  };

  const orderItems = cart.items.map((item) => ({
    name: item.foodItem.name,
    quantity: item.quantity,
    image:
      item.foodItem.images?.[0]?.url ||
      "/images/default-food.png",
    price: item.foodItem.price,
    fooditem: item.foodItem._id,
  }));

  const paymentInfo = {
    id: session.payment_intent,
    status: session.payment_status,
  };

  const order = await Order.create({
    orderItems,
    deliveryInfo,
    paymentInfo,
    deliveryCharge:
      Number(session.shipping_cost?.amount_total || 0) / 100,
    itemsPrice:
      Number(session.amount_subtotal || 0) / 100,
    finalTotal:
      Number(session.amount_total || 0) / 100,
    user: req.user._id,
    restaurant: cart.restaurant._id,
    paidAt: Date.now(),
  });

  await Cart.findOneAndDelete({
    user: req.user._id,
  });

  res.status(201).json({
    success: true,
    order,
  });
});

// ======================================================
// GET SINGLE ORDER
// ======================================================

exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("restaurant");

  if (!order) {
    return next(
      new ErrorHandler("No order found with this ID", 404)
    );
  }

  if (
    req.user.role !== "admin" &&
    order.user._id.toString() !== req.user._id.toString()
  ) {
    return next(
      new ErrorHandler(
        "You are not allowed to view this order",
        403
      )
    );
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// ======================================================
// GET LOGGED-IN USER ORDERS
// ======================================================

exports.myOrders = catchAsyncErrors(async (req, res) => {
  const orders = await Order.find({
    user: req.user._id,
  })
    .populate("user", "name email")
    .populate("restaurant")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    orders,
  });
});

// ======================================================
// GET ALL ORDERS - ADMIN
// ======================================================

exports.allOrders = catchAsyncErrors(async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .populate("restaurant")
    .sort({ createdAt: -1 });

  const totalAmount = orders.reduce(
    (total, order) =>
      total + Number(order.finalTotal || 0),
    0
  );

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

// ======================================================
// UPDATE ORDER STATUS - ADMIN
// ======================================================

exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(
      new ErrorHandler("Order not found", 404)
    );
  }

  if (order.orderStatus === "Delivered") {
    return next(
      new ErrorHandler(
        "This order has already been delivered",
        400
      )
    );
  }

  order.orderStatus = req.body.status;

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save();

  res.status(200).json({
    success: true,
    order,
  });
});