import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import Loader from "../layout/Loader";

import { login } from "../../redux/actions/userActions";

import {
  clearErrors,
} from "../../redux/slices/userSlice";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    isAuthenticated,
    loading,
    error,
  } = useSelector((state) => state.user);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
  }, [dispatch, error]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error(
        "Please enter email and password"
      );

      return;
    }

    const result = await dispatch(
      login(email, password)
    );

    if (result?.success) {
      toast.success("Login successful");
      navigate("/");
    }
  };

  if (isAuthenticated) {
    return (
      <div className="text-center mt-5">
        <h4>You are already logged in.</h4>

        <button
          type="button"
          className="btn btn-primary mt-3"
          onClick={() => navigate("/")}
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="row wrapper">
          <div className="col-10 col-lg-5">
            <form
              className="shadow-lg"
              onSubmit={submitHandler}
            >
              <h1 className="mb-3">Login</h1>

              <div className="form-group">
                <label htmlFor="login_email">
                  Email
                </label>

                <input
                  type="email"
                  id="login_email"
                  className="form-control"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="login_password">
                  Password
                </label>

                <input
                  type="password"
                  id="login_password"
                  className="form-control"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                />
              </div>

              <Link
                to="/users/forgetPassword"
                className="float-right mb-4"
              >
                Forgot Password
              </Link>

              <button
                type="submit"
                className="btn btn-block py-3"
                disabled={loading}
              >
                LOGIN
              </button>

              <Link
                to="/users/signup"
                className="float-right mt-3"
              >
                NEW USER?
              </Link>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;