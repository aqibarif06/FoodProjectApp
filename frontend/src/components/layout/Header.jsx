import React from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  useDispatch,
  useSelector,
} from "react-redux";
import { toast } from "react-toastify";

import Search from "./Search";
import { logout } from "../../redux/actions/userActions";

import "../../App.css";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, user } = useSelector(
    (state) => state.user
  );

  const { cartItems = [] } = useSelector(
    (state) => state.cart
  );

  const showSearch =
    location.pathname === "/" ||
    location.pathname.startsWith(
      "/eats/stores/search/"
    );

  const logoutHandler = async () => {
    const result = await dispatch(logout());

    if (result?.success) {
      toast.success("Logged out successfully");
      navigate("/");
    }
  };

  return (
    <nav className="navbar row sticky-top">
      {/* LOGO */}

      <div className="col-12 col-md-3">
        <Link to="/">
          <img
            src="/images/logo.webp"
            alt="logo"
            className="logo"
          />
        </Link>
      </div>

      {/* SEARCH */}

      <div className="col-12 col-md-5 mt-2 mt-md-0">
        {showSearch && <Search />}
      </div>

      {/* CART AND USER NAVIGATION */}

      <div className="col-12 col-md-4 mt-4 mt-md-0 text-center">
        {/* CART */}

        <Link
          to="/cart"
          style={{ textDecoration: "none" }}
        >
          <span className="ml-3" id="cart">
            Cart
          </span>

          <span className="ml-1" id="cart_count">
            {cartItems.length}
          </span>
        </Link>

        {/* LOGIN / USER */}

        {!isAuthenticated ? (
          <Link
            to="/users/login"
            className="material-symbols-outlined web_logo ml-3"
            title="Login"
          >
            account_circle
          </Link>
        ) : (
          <>
            {/* USER / ADMIN ORDERS */}

            {user?.role === "admin" ? (
              <Link
                to="/admin/orders"
                className="ml-3"
                style={{
                  textDecoration: "none",
                  color: "white",
                }}
              >
                All Orders
              </Link>
            ) : (
              <Link
                to="/eats/orders/me/myOrders"
                className="ml-3"
                style={{
                  textDecoration: "none",
                  color: "white",
                }}
              >
                My Orders
              </Link>
            )}

            {/* PROFILE */}

            <div className="d-inline-block ml-3">
              <Link
                to="/users/me"
                className="material-symbols-outlined web_logo mr-2"
                style={{
                  textDecoration: "none",
                  verticalAlign: "middle",
                }}
                title="Profile"
              >
                account_circle
              </Link>

              {/* LOGOUT */}

              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={logoutHandler}
              >
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Header;