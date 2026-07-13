import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faIndianRupeeSign } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  addItemToCart,
  updateCartQuantity,
  removeItemFromCart,
} from "../redux/actions/cartActions";

import { getMenus } from "../redux/actions/menuActions";

const Fooditem = ({ fooditem, restaurant }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux user state
  const { user } = useSelector((state) => state.user);

  const isAuthenticated = !!user;

  // Redux cart state
  const { cartItems } = useSelector((state) => state.cart);

  // Find this food item in the cart
  const cartItem = cartItems.find(
    (item) =>
      item.foodItem?._id === fooditem._id
  );

  // Derive quantity directly from Redux cart state
  const quantity = cartItem?.quantity ?? 1;

  // Show quantity buttons when item exists in cart
  const showButtons = Boolean(cartItem);

  // ======================================================
  // DECREASE QUANTITY
  // ======================================================

  const decreaseQty = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;

      dispatch(
        updateCartQuantity(
          fooditem._id,
          newQuantity
        )
      );
    } else {
      dispatch(
        removeItemFromCart(fooditem._id)
      );
    }
  };

  // ======================================================
  // INCREASE QUANTITY
  // ======================================================

  const increaseQty = () => {
    if (quantity < fooditem.stock) {
      const newQuantity = quantity + 1;

      dispatch(
        updateCartQuantity(
          fooditem._id,
          newQuantity
        )
      );
    } else {
      alert("Exceeded stock limit");
    }
  };

  // ======================================================
  // ADD TO CART
  // ======================================================

  const addToCartHandler = () => {
    if (!isAuthenticated) {
      navigate("/users/login");
      return;
    }

    dispatch(
      addItemToCart(
        fooditem._id,
        restaurant,
        1
      )
    );
  };

  // ======================================================
  // DELETE FOOD ITEM
  // ======================================================

  const deleteFoodItemHandler = async () => {
    const shouldDelete = window.confirm(
      "Delete this food item?"
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await axios.delete(
        `/api/v1/eats/item/${fooditem._id}`,
        {
          withCredentials: true,
        }
      );

      if (restaurant) {
        dispatch(getMenus(restaurant));
      }
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Unable to delete item"
      );
    }
  };

  return (
    <div className="col-sm-12 col-md-6 col-lg-3 my-3">
      <div className="card p-3 rounded">
        <img
          className="card-img-top mx-auto food-image"
          src={
            fooditem.images?.[0]?.url ||
            "/images/placeholder.png"
          }
          alt={fooditem.name}
        />

        <div className="card-body d-flex flex-column">
          <h5 className="card-title">
            {fooditem.name}
          </h5>

          <p className="fooditem_des">
  {fooditem.aiDescription || fooditem.description}
</p>

{/* AI Tags */}

{fooditem.aiTags?.length > 0 && (
  <div className="mb-2">
    <small>
      <strong>🏷 Tags:</strong>{" "}
      {fooditem.aiTags.join(" • ")}
    </small>
  </div>
)}

{/* AI Serves */}

{fooditem.aiServes && (
  <div className="mb-1">
    <small>
      <strong>🍽 Serves:</strong>{" "}
      {fooditem.aiServes}
    </small>
  </div>
)}

{/* AI Best For */}

{fooditem.aiBestFor?.length > 0 && (
  <div className="mb-1">
    <small>
      <strong>⏰ Best For:</strong>{" "}
      {fooditem.aiBestFor.join(" • ")}
    </small>
  </div>
)}

{/* AI Allergens */}

{fooditem.aiAllergens?.length > 0 && (
  <div className="mb-2">
    <small>
      <strong>⚠ Allergens:</strong>{" "}
      {fooditem.aiAllergens.join(" • ")}
    </small>
  </div>
)}

<p className="card-text mt-2">
  <FontAwesomeIcon
    icon={faIndianRupeeSign}
    size="xs"
  />{" "}
  {fooditem.price}
</p>

          {!showButtons ? (
            (!isAuthenticated ||
              user?.role !== "admin") && (
              <button
                id="cart_btn"
                className="btn btn-primary ml-4"
                disabled={fooditem.stock === 0}
                onClick={addToCartHandler}
              >
                Add to Cart
              </button>
            )
          ) : (
            <div className="stockCounter d-inline">
              <span
                className="btn btn-danger minus"
                onClick={decreaseQty}
              >
                -
              </span>

              <input
                type="number"
                className="form-control count d-inline"
                value={quantity}
                readOnly
              />

              <span
                className="btn btn-primary plus"
                onClick={increaseQty}
              >
                +
              </span>
            </div>
          )}

          <hr />

          <p>
            Status:
            <span
              className={
                fooditem.stock > 0
                  ? "greenColor"
                  : "redColor"
              }
            >
              {fooditem.stock > 0
                ? "In Stock"
                : "Out of Stock"}
            </span>
          </p>

          {/* ADMIN DELETE */}

          {isAuthenticated &&
            user?.role === "admin" && (
              <button
                className="btn btn-danger btn-sm mt-2"
                onClick={deleteFoodItemHandler}
              >
                Delete
              </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default Fooditem;