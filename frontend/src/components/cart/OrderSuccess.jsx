import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { createOrder } from "../../redux/actions/orderActions";
import { clearErrors } from "../../redux/slices/orderSlice";

import { toast } from "react-toastify";
import Loader from "../layout/Loader";

const OrderSuccess = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  const hasCalled = useRef(false);

  const { error, order, loading } = useSelector(
    (state) => state.order
  );

  const searchParams = new URLSearchParams(location.search);
  const sessionId = searchParams.get("session_id");

  // ======================================================
  // CREATE ORDER
  // ======================================================

  useEffect(() => {
    if (!sessionId || hasCalled.current) {
      return;
    }

    hasCalled.current = true;

    console.log(
      "Creating order with Stripe session:",
      sessionId
    );

    dispatch(createOrder(sessionId));
  }, [dispatch, sessionId]);

  // ======================================================
  // HANDLE SUCCESS / ERROR
  // ======================================================

  useEffect(() => {
    if (order) {
      console.log("ORDER CREATED:", order);

      toast.success("Order placed successfully 🎉", {
        position: "bottom-right",
      });
    }

    if (error) {
      console.error("ORDER CREATION ERROR:", error);

      toast.error(error, {
        position: "bottom-right",
      });

      dispatch(clearErrors());
    }
  }, [order, error, dispatch]);

  // ======================================================
  // INVALID STRIPE SESSION
  // ======================================================

  if (!sessionId) {
    return (
      <div className="row justify-content-center">
        <div className="col-6 mt-5 text-center">
          <h2>Invalid payment session</h2>

          <Link to="/cart">
            Return to Cart
          </Link>
        </div>
      </div>
    );
  }

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return <Loader />;
  }

  // ======================================================
  // ORDER CREATION FAILED
  // ======================================================

  if (error || !order) {
    return (
      <div className="row justify-content-center">
        <div className="col-6 mt-5 text-center">
          <h2>Unable to create your order</h2>

          <p>
            Your payment session was received, but the
            order could not be created.
          </p>

          <Link to="/">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  // ======================================================
  // ORDER CREATED SUCCESSFULLY
  // ======================================================

  return (
    <div className="row justify-content-center">
      <div className="col-6 mt-5 text-center">
        <svg
          className="checkmark"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 52 52"
        >
          <circle
            className="checkmark__circle"
            cx="26"
            cy="26"
            r="25"
            fill="none"
          />

          <path
            className="checkmark__check"
            fill="none"
            d="M14.1 27.2l7.1 7.2 16.7-16.8"
          />
        </svg>

        <h2>
          Your Order has been placed successfully.
        </h2>

        <Link to="/eats/orders/me/myOrders">
          Go to Orders
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;