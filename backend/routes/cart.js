const express = require("express");

const authController = require("../controllers/authController");
const cartController = require("../controllers/cartController");

const router = express.Router();

// Add item to cart
router.post(
  "/add-to-cart",
  authController.protect,
  cartController.addItemToCart
);

// Update cart item quantity
router.post(
  "/update-cart-item",
  authController.protect,
  cartController.updateCartItemQuantity
);

// Delete cart item
router.delete(
  "/delete-cart-item",
  authController.protect,
  cartController.deleteCartItem
);

// Get logged-in user's cart
router.get(
  "/get-cart",
  authController.protect,
  cartController.getCartItem
);

module.exports = router;