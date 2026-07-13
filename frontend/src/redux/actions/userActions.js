// Dispatch => Call API => Update state based on success or failure

import api from "../../utils/api";

import {
  loginRequest,
  loginSuccess,
  loginFail,
  loadUserFail,
  logoutSuccess,
  logoutFail,
  updateRequest,
  updateSuccess,
  updateFail,
} from "../slices/userSlice";

// ======================================================
// LOGIN
// ======================================================

export const login = (email, password) => async (dispatch) => {
  try {
    dispatch(loginRequest());

    const { data } = await api.post("/v1/users/login", {
      email,
      password,
    });

    dispatch(loginSuccess(data.data.user));

    return {
      success: true,
    };
  } catch (error) {
    dispatch(
      loginFail(
        error.response?.data?.message ||
          error.response?.data?.errMessage ||
          "Login failed"
      )
    );

    return {
      success: false,
    };
  }
};

// ======================================================
// REGISTER
// ======================================================

export const register = (userData) => async (dispatch) => {
  try {
    dispatch(loginRequest());

    const { data } = await api.post(
      "/v1/users/signup",
      userData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    dispatch(loginSuccess(data.data.user));
  } catch (error) {
    dispatch(
      loginFail(
        error.response?.data?.message ||
          error.response?.data?.errMessage ||
          "Registration failed"
      )
    );
  }
};

// ======================================================
// LOAD LOGGED-IN USER
// ======================================================

export const loadUser = () => async (dispatch) => {
  try {
    dispatch(loginRequest());

    const { data } = await api.get("/v1/users/me");

    dispatch(loginSuccess(data.user));
  } catch (error) {
    dispatch(
      loadUserFail(
        error.response?.data?.message ||
          error.response?.data?.errMessage ||
          "Failed to load user"
      )
    );
  }
};

// ======================================================
// UPDATE PROFILE
// ======================================================

export const updateProfile = (userData) => async (dispatch) => {
  try {
    dispatch(updateRequest());

    const { data } = await api.put(
      "/v1/users/me/update",
      userData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    dispatch(updateSuccess(data.success));
  } catch (error) {
    dispatch(
      updateFail(
        error.response?.data?.message ||
          error.response?.data?.errMessage ||
          "Profile update failed"
      )
    );
  }
};

// ======================================================
// LOGOUT
// ======================================================

export const logout = () => async (dispatch) => {
  try {
    await api.get("/v1/users/logout");

    dispatch(logoutSuccess());

    return {
      success: true,
    };
  } catch (error) {
    dispatch(
      logoutFail(
        error.response?.data?.message ||
          error.response?.data?.errMessage ||
          "Logout failed"
      )
    );

    return {
      success: false,
    };
  }
};