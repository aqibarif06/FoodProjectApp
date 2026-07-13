const catchAsyncErrors = require(
    "../middlewares/catchAsyncErrors"
  );
  
  const dotenv = require("dotenv");
  
  dotenv.config({
    path: "./config/config.env",
  });
  
  const stripe = require("stripe")(
    process.env.STRIPE_SECRET_KEY
  );
  
  // ======================================================
  // PROCESS PAYMENT
  // ======================================================
  
  exports.processPayment = catchAsyncErrors(
    async (req, res, next) => {
      const { items } = req.body;
  
      if (!items || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Cart is empty",
        });
      }
  
      const frontendURL = process.env.FRONTEND_URL.replace(
        /\/$/,
        ""
      );
  
      const lineItems = items.map((item) => {
        const foodItem = item.foodItem;
  
        const productData = {
          name: foodItem.name,
        };
  
        // Add image only when it is a valid public URL
        const imageURL = foodItem.images?.[0]?.url;
  
        if (
          imageURL &&
          (imageURL.startsWith("http://") ||
            imageURL.startsWith("https://"))
        ) {
          productData.images = [imageURL];
        }
  
        return {
          price_data: {
            currency: "inr",
  
            product_data: productData,
  
            unit_amount: Math.round(
              Number(foodItem.price) * 100
            ),
          },
  
          quantity: Number(item.quantity),
        };
      });
  
      const session =
        await stripe.checkout.sessions.create({
          customer_email: req.user.email,
  
          phone_number_collection: {
            enabled: true,
          },
  
          line_items: lineItems,
  
          mode: "payment",
  
          shipping_address_collection: {
            allowed_countries: ["US", "IN"],
          },
  
          shipping_options: [
            {
              shipping_rate_data: {
                display_name: "Delivery charges",
  
                type: "fixed_amount",
  
                fixed_amount: {
                  amount: 5500,
                  currency: "inr",
                },
  
                delivery_estimate: {
                  minimum: {
                    unit: "hour",
                    value: 1,
                  },
  
                  maximum: {
                    unit: "hour",
                    value: 3,
                  },
                },
              },
            },
          ],
  
          success_url:
            `${frontendURL}/success?session_id={CHECKOUT_SESSION_ID}`,
  
          cancel_url: `${frontendURL}/cart`,
        });
  
      res.status(200).json({
        success: true,
        url: session.url,
      });
    }
  );
  
  // ======================================================
  // SEND STRIPE API KEY
  // ======================================================
  
  exports.sendStripeApi = catchAsyncErrors(
    async (req, res, next) => {
      res.status(200).json({
        stripeApiKey: process.env.STRIPE_API_KEY,
      });
    }
  );