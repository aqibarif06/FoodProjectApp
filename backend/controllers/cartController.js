const Cart = require("../models/cartModel");
const FoodItem = require("../models/foodItem");
const Restaurant = require("../models/restaurant");

const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

// ======================================================
// ADD ITEM TO CART
// ======================================================

exports.addItemToCart = catchAsyncErrors(
  async (req, res, next) => {
    const userId = req.user._id;

    const {
      foodItemId,
      restaurantId,
      quantity,
    } = req.body;

    // Validate required fields
    if (!foodItemId || !restaurantId) {
      return next(
        new ErrorHandler(
          "Food item ID and restaurant ID are required",
          400
        )
      );
    }

    // Convert quantity to number
    const itemQuantity = Number(quantity);

    // Validate quantity
    if (
      !Number.isInteger(itemQuantity) ||
      itemQuantity < 1
    ) {
      return next(
        new ErrorHandler(
          "Quantity must be a positive integer",
          400
        )
      );
    }

    // Check food item
    const foodItem = await FoodItem.findById(foodItemId);

    if (!foodItem) {
      return next(
        new ErrorHandler("Food item not found", 404)
      );
    }

    // Check restaurant
    const restaurant = await Restaurant.findById(
      restaurantId
    );

    if (!restaurant) {
      return next(
        new ErrorHandler("Restaurant not found", 404)
      );
    }

    // Find user's cart
    let cart = await Cart.findOne({
      user: userId,
    });

    if (cart) {
      // If restaurant is different,
      // remove old cart and create a new cart
      if (
        cart.restaurant.toString() !==
        restaurantId.toString()
      ) {
        await Cart.deleteOne({
          _id: cart._id,
        });

        cart = new Cart({
          user: userId,
          restaurant: restaurantId,
          items: [
            {
              foodItem: foodItemId,
              quantity: itemQuantity,
            },
          ],
        });
      } else {
        // Check if food item already exists
        const itemIndex = cart.items.findIndex(
          (item) =>
            item.foodItem.toString() ===
            foodItemId.toString()
        );

        if (itemIndex > -1) {
          // Increase existing item quantity
          cart.items[itemIndex].quantity +=
            itemQuantity;
        } else {
          // Add new food item
          cart.items.push({
            foodItem: foodItemId,
            quantity: itemQuantity,
          });
        }
      }
    } else {
      // Create new cart
      cart = new Cart({
        user: userId,
        restaurant: restaurantId,
        items: [
          {
            foodItem: foodItemId,
            quantity: itemQuantity,
          },
        ],
      });
    }

    await cart.save();

    // Fetch populated cart
    const updatedCart = await Cart.findOne({
      user: userId,
    })
      .populate({
        path: "items.foodItem",
        select: "name price images",
      })
      .populate({
        path: "restaurant",
        select: "name",
      });

    res.status(200).json({
      status: "success",
      message: "Cart updated successfully",
      cart: updatedCart,
    });
  }
);

// ======================================================
// UPDATE CART ITEM QUANTITY
// ======================================================

exports.updateCartItemQuantity = catchAsyncErrors(
  async (req, res, next) => {
    const userId = req.user._id;

    const {
      foodItemId,
      quantity,
    } = req.body;

    // Validate food item ID
    if (!foodItemId) {
      return next(
        new ErrorHandler(
          "Food item ID is required",
          400
        )
      );
    }

    // Convert quantity to number
    const itemQuantity = Number(quantity);

    // Validate quantity
    if (
      !Number.isInteger(itemQuantity) ||
      itemQuantity < 1
    ) {
      return next(
        new ErrorHandler(
          "Quantity must be a positive integer",
          400
        )
      );
    }

    // Find user's cart
    const cart = await Cart.findOne({
      user: userId,
    });

    if (!cart) {
      return next(
        new ErrorHandler("Cart not found", 404)
      );
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex(
      (item) =>
        item.foodItem.toString() ===
        foodItemId.toString()
    );

    if (itemIndex === -1) {
      return next(
        new ErrorHandler(
          "Food item not found in cart",
          404
        )
      );
    }

    // Update quantity
    cart.items[itemIndex].quantity = itemQuantity;

    await cart.save();

    // Fetch populated cart
    const updatedCart = await Cart.findOne({
      user: userId,
    })
      .populate({
        path: "items.foodItem",
        select: "name price images",
      })
      .populate({
        path: "restaurant",
        select: "name",
      });

    res.status(200).json({
      status: "success",
      message: "Cart item quantity updated",
      cart: updatedCart,
    });
  }
);

// ======================================================
// DELETE CART ITEM
// ======================================================

exports.deleteCartItem = catchAsyncErrors(
  async (req, res, next) => {
    const userId = req.user._id;

    const { foodItemId } = req.body;

    // Validate food item ID
    if (!foodItemId) {
      return next(
        new ErrorHandler(
          "Food item ID is required",
          400
        )
      );
    }

    // Find user's cart
    const cart = await Cart.findOne({
      user: userId,
    });

    if (!cart) {
      return next(
        new ErrorHandler("Cart not found", 404)
      );
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex(
      (item) =>
        item.foodItem.toString() ===
        foodItemId.toString()
    );

    if (itemIndex === -1) {
      return next(
        new ErrorHandler(
          "Food item not found in cart",
          404
        )
      );
    }

    // Remove item
    cart.items.splice(itemIndex, 1);

    // Delete cart if empty
    if (cart.items.length === 0) {
      await Cart.deleteOne({
        _id: cart._id,
      });

      return res.status(200).json({
        status: "success",
        message: "Cart deleted because it is empty",
        cart: null,
      });
    }

    await cart.save();

    // Fetch populated cart
    const updatedCart = await Cart.findOne({
      user: userId,
    })
      .populate({
        path: "items.foodItem",
        select: "name price images",
      })
      .populate({
        path: "restaurant",
        select: "name",
      });

    res.status(200).json({
      status: "success",
      message: "Cart item deleted",
      cart: updatedCart,
    });
  }
);

// ======================================================
// GET LOGGED-IN USER CART
// ======================================================

exports.getCartItem = catchAsyncErrors(
  async (req, res, next) => {
    const userId = req.user._id;

    // Find user's cart
    const cart = await Cart.findOne({
      user: userId,
    })
      .populate({
        path: "items.foodItem",
        select: "name price images",
      })
      .populate({
        path: "restaurant",
        select: "name",
      });

    if (!cart) {
      return next(
        new ErrorHandler("No cart found", 404)
      );
    }

    res.status(200).json({
      status: "success",
      data: cart,
    });
  }
);