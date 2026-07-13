import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  error: null,
  order: null,
  orders: [],
  totalAmount: 0,
};

const orderSlice = createSlice({
  name: "order",

  initialState,

  reducers: {
    // ==================================================
    // CLEAR ERRORS
    // ==================================================

    clearErrors: (state) => {
      state.error = null;
    },

    // ==================================================
    // CREATE ORDER
    // ==================================================

    createOrderRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.order = null;
    },

    createOrderSuccess: (state, action) => {
      state.loading = false;
      state.order = action.payload;
      state.error = null;
    },

    createOrderFail: (state, action) => {
      state.loading = false;
      state.order = null;
      state.error = action.payload;
    },

    // ==================================================
    // PAYMENT
    // ==================================================

    paymentRequest: (state) => {
      state.loading = true;
      state.error = null;
    },

    paymentSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },

    paymentFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ==================================================
    // MY ORDERS
    // ==================================================

    myOrdersRequest: (state) => {
      state.loading = true;
      state.error = null;
    },

    myOrdersSuccess: (state, action) => {
      state.loading = false;
      state.orders = action.payload;
      state.error = null;
    },

    myOrdersFail: (state, action) => {
      state.loading = false;
      state.orders = [];
      state.error = action.payload;
    },

    // ==================================================
    // ORDER DETAILS
    // ==================================================

    orderDetailsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },

    orderDetailsSuccess: (state, action) => {
      state.loading = false;
      state.order = action.payload;
      state.error = null;
    },

    orderDetailsFail: (state, action) => {
      state.loading = false;
      state.order = null;
      state.error = action.payload;
    },

    // ==================================================
    // ALL ORDERS - ADMIN
    // ==================================================

    allOrdersRequest: (state) => {
      state.loading = true;
      state.error = null;
    },

    allOrdersSuccess: (state, action) => {
      state.loading = false;

      state.orders =
        action.payload.orders || [];

      state.totalAmount =
        action.payload.totalAmount || 0;

      state.error = null;
    },

    allOrdersFail: (state, action) => {
      state.loading = false;
      state.orders = [];
      state.totalAmount = 0;
      state.error = action.payload;
    },
  },
});

export const {
  clearErrors,

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
} = orderSlice.actions;

export default orderSlice.reducer;