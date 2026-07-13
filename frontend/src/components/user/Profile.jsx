import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../layout/Loader";

const Profile = () => {
  const { user, loading } = useSelector(
    (state) => state.user
  );

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return (
      <div className="text-center mt-5">
        <h4>Please login to view your profile.</h4>

        <Link
          to="/users/login"
          className="btn btn-primary mt-3"
        >
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="row justify-content-around mt-5 user-info">
      <div className="col-12 col-md-5 profile">
        <div className="d-flex align-items-center mb-4">
          <figure className="avatar avatar-profile text-center mr-3">
            <img
              className="rounded-circle figure-img img-fluid"
              src={
                user.avatar?.url ||
                "/images/images.png"
              }
              alt={user.name || "User"}
            />
          </figure>

          <span>
            Welcome {user.name}!
          </span>
        </div>

        <Link
          to="/users/me/update"
          id="edit_profile"
          className="btn btn-primary btn-block my-5"
        >
          Edit Profile
        </Link>

        <h4>Full Name:</h4>
        <p>{user.name}</p>

        <h4>Email Address</h4>
        <p>{user.email}</p>

        <h4>Joined On</h4>
        <p>
          {user.createdAt
            ? String(user.createdAt).substring(0, 10)
            : "N/A"}
        </p>
      </div>
    </div>
  );
};

export default Profile;