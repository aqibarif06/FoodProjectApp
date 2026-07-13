const express = require("express");

const router = express.Router();

const {
  newOrder,
  getSingleOrder,
  myOrders,
  allOrders,
  updateOrder,
} = require("../controllers/orderController");

const authController = require("../controllers/authController");

const authorizeRoles = require("../middlewares/authorizeRoles");

// ======================================================
// CREATE NEW ORDER
// POST /api/v1/eats/orders/new
// ======================================================

router
  .route("/new")
  .post(
    authController.protect,
    newOrder
  );

// ======================================================
// GET LOGGED-IN USER ORDERS
// GET /api/v1/eats/orders/me/myOrders
// ======================================================

router
  .route("/me/myOrders")
  .get(
    authController.protect,
    myOrders
  );

// ======================================================
// GET ALL ORDERS - ADMIN
// GET /api/v1/eats/orders/admin/orders
// ======================================================

router
  .route("/admin/orders")
  .get(
    authController.protect,
    authorizeRoles("admin"),
    allOrders
  );

// ======================================================
// UPDATE ORDER STATUS - ADMIN
// PATCH /api/v1/eats/orders/admin/orders/:id
// ======================================================

router
  .route("/admin/orders/:id")
  .patch(
    authController.protect,
    authorizeRoles("admin"),
    updateOrder
  );

// ======================================================
// GET SINGLE ORDER
// GET /api/v1/eats/orders/:id
// KEEP THIS ROUTE LAST
// ======================================================

router
  .route("/:id")
  .get(
    authController.protect,
    getSingleOrder
  );

module.exports = router;