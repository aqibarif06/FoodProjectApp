import api from "../../utils/api";
import { toast } from "react-toastify";

import {
  createOrderRequest,
  createOrderSuccess,
  createOrderFail,
  paymentRequest,
  paymentSuccess,
  paymentFail,
  myOrdersRequest,
  myOrdersSuccess,
  myOrdersFail,
  orderDetailsRequest,
  orderDetailsSuccess,
  orderDetailsFail,
  allOrdersRequest,
  allOrdersSuccess,
  allOrdersFail,
} from "../slices/orderSlice";

// ======================================================
// CREATE ORDER
// ======================================================

export const createOrder =
  (session_id) => async (dispatch) => {
    try {
      dispatch(createOrderRequest());

      const { data } = await api.post(
        "/v1/eats/orders/new",
        { session_id },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      dispatch(createOrderSuccess(data.order));

      return {
        success: true,
        order: data.order,
      };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Unable to create order";

      dispatch(createOrderFail(message));

      return {
        success: false,
        message,
      };
    }
  };

// ======================================================
// PAYMENT
// ======================================================

export const payment =
  (items, restaurant) => async (dispatch) => {
    try {
      dispatch(paymentRequest());

      const { data } = await api.post(
        "/v1/payment/process",
        {
          items,
          restaurant,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (data.url) {
        window.location.assign(data.url);
      }

      dispatch(paymentSuccess());
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Payment failed";

      dispatch(paymentFail(message));
    }
  };

// ======================================================
// MY ORDERS
// ======================================================

export const myOrders = () => async (dispatch) => {
  try {
    dispatch(myOrdersRequest());

    const { data } = await api.get(
      "/v1/eats/orders/me/myOrders"
    );

    dispatch(myOrdersSuccess(data.orders));
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Unable to get orders";

    dispatch(myOrdersFail(message));
  }
};

// ======================================================
// ORDER DETAILS
// ======================================================

export const getOrderDetails =
  (id) => async (dispatch) => {
    try {
      dispatch(orderDetailsRequest());

      const { data } = await api.get(
        `/v1/eats/orders/${id}`
      );

      dispatch(orderDetailsSuccess(data.order));
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Unable to get order details";

      dispatch(orderDetailsFail(message));
    }
  };

// ======================================================
// ALL ORDERS - ADMIN
// ======================================================

export const allOrders = () => async (dispatch) => {
  try {
    dispatch(allOrdersRequest());

    const { data } = await api.get(
      "/v1/eats/orders/admin/orders"
    );

    dispatch(
      allOrdersSuccess({
        orders: data.orders,
        totalAmount: data.totalAmount,
      })
    );
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Unable to get all orders";

    dispatch(allOrdersFail(message));
  }
};

// ======================================================
// UPDATE ORDER STATUS - ADMIN
// ======================================================

export const updateOrder = (id, status) => async (dispatch) => {
  try {
    await api.patch(
      `/v1/eats/orders/admin/orders/${id}`,
      { status },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Refresh orders after updating
    dispatch(allOrders());
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Unable to update order";

    toast.error(message);
  }
};