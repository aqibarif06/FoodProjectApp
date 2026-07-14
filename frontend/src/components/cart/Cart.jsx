import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchCartItems,
  removeItemFromCart,
  updateCartQuantity,
} from "../../redux/actions/cartActions";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faIndianRupee } from "@fortawesome/free-solid-svg-icons";

import { payment } from "../../redux/actions/orderActions";

import { toast } from "react-toastify";

const Cart = () => {
  const dispatch = useDispatch();

  const {
    cartItems = [],
    restaurant = {},
    loading,
    error,
  } = useSelector((state) => state.cart);

  // ======================================================
  // FETCH CART
  // ======================================================

  useEffect(() => {
    dispatch(fetchCartItems());
  }, [dispatch]);

  // ======================================================
  // REMOVE CART ITEM
  // ======================================================

  const removeCartItemHandler = async (id) => {
    await dispatch(removeItemFromCart(id));

    toast.success("Item removed from cart");
  };

  // ======================================================
  // INCREASE QUANTITY
  // ======================================================

  const increaseQty = (id, quantity, stock) => {
    const newQty = quantity + 1;

    if (
      typeof stock === "number" &&
      newQty > stock
    ) {
      toast.error("Exceeded stock limit");
      return;
    }

    dispatch(updateCartQuantity(id, newQty));
  };

  // ======================================================
  // DECREASE QUANTITY
  // ======================================================

  const decreaseQty = (id, quantity) => {
    if (quantity > 1) {
      const newQty = quantity - 1;

      dispatch(updateCartQuantity(id, newQty));
    } else {
      toast.error("Minimum quantity reached");
    }
  };

  // ======================================================
  // CHECKOUT
  // ======================================================

  const checkoutHandler = () => {
    dispatch(payment(cartItems, restaurant));
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <h2 className="mt-5">
        Loading cart...
      </h2>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (error) {
    return (
      <h2 className="mt-5 text-danger">
        {error}
      </h2>
    );
  }

  // ======================================================
  // EMPTY CART
  // ======================================================

  if (!cartItems || cartItems.length === 0) {
    return (
      <h2 className="mt-5">
        Your Cart is empty
      </h2>
    );
  }

  // ======================================================
  // CART
  // ======================================================

  return (
    <>
      <h2 className="mt-5">
        Your Cart:{" "}
        <b>{cartItems.length} items</b>
      </h2>

      <h3 className="mt-5">
        Restaurant:{" "}
        <b>{restaurant?.name || "Restaurant"}</b>
      </h3>

      <div className="row d-flex justify-content-between cartt">
        <div className="col-12 col-lg-8">
          {cartItems.map((item) => {
            const foodItem = item?.foodItem;

            // Skip invalid/deleted food items
            if (!foodItem) {
              return null;
            }

            const imageUrl =
              foodItem?.images?.[0]?.url ||
              foodItem?.imageUrl ||
              "/images/default-food.png";

            return (
              <div
                className="cart-item"
                key={item._id}
              >
                <div className="row">
                  {/* FOOD IMAGE */}

                  <div className="col-4 col-lg-3">
                    <img
                      src={imageUrl}
                      alt={foodItem.name || "Food item"}
                      height="90"
                      width="115"
                      onError={(event) => {
                        event.currentTarget.onerror = null;

                        event.currentTarget.src =
                          "/images/default-food.png";
                      }}
                    />
                  </div>

                  {/* FOOD NAME */}

                  <div className="col-5 col-lg-3">
                    {foodItem.name}
                  </div>

                  {/* PRICE */}

                  <div className="col-4 col-lg-2 mt-4 mt-lg-0">
                    <p id="card_item_price">
                      <FontAwesomeIcon
                        icon={faIndianRupee}
                        size="xs"
                      />

                      {foodItem.price}
                    </p>
                  </div>

                  {/* QUANTITY */}

                  <div className="col-4 col-lg-3 mt-4 mt-lg-0">
                    <div className="stockCounter d-inline">
                      <span
                        className="btn btn-danger minus"
                        onClick={() =>
                          decreaseQty(
                            foodItem._id,
                            item.quantity
                          )
                        }
                      >
                        -
                      </span>

                      <input
                        type="number"
                        className="form-control count d-inline"
                        value={item.quantity}
                        readOnly
                      />

                      <span
                        className="btn btn-primary plus"
                        onClick={() =>
                          increaseQty(
                            foodItem._id,
                            item.quantity,
                            foodItem.stock
                          )
                        }
                      >
                        +
                      </span>
                    </div>
                  </div>

                  {/* DELETE ITEM */}

                  <div className="col-4 col-lg-1 mt-4 mt-lg-0">
                    <i
                      id="delete_cart_item"
                      className="fa fa-trash btn btn-danger"
                      onClick={() =>
                        removeCartItemHandler(
                          foodItem._id
                        )
                      }
                    />
                  </div>
                </div>

                <hr />
              </div>
            );
          })}
        </div>

        {/* ==================================================
            ORDER SUMMARY
        ================================================== */}

        <div className="col-12 col-lg-3 my-4">
          <div id="order_summary">
            <h4>Order Summary</h4>

            <hr />

            <p>
              Subtotal:

              <span className="order-summary-values">
                {cartItems.reduce(
                  (accumulator, item) =>
                    accumulator +
                    Number(item?.quantity || 0),
                  0
                )}

                (Units)
              </span>
            </p>

            <p>
              Total:

              <span className="order-summary-values">
                <FontAwesomeIcon
                  icon={faIndianRupee}
                  size="xs"
                />

                {cartItems
                  .reduce(
                    (accumulator, item) =>
                      accumulator +
                      Number(item?.quantity || 0) *
                        Number(
                          item?.foodItem?.price || 0
                        ),
                    0
                  )
                  .toFixed(2)}
              </span>
            </p>

            <hr />

            <button
              id="checkout_btn"
              className="btn btn-primary btn-block"
              onClick={checkoutHandler}
            >
              Check Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;