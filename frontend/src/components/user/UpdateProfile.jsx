import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  updateProfile,
  loadUser,
} from "../../redux/actions/userActions";

import {
  clearErrors,
  updateReset,
} from "../../redux/slices/userSlice";

const UpdateProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, error, isUpdated, loading } = useSelector(
    (state) => state.user
  );

  const [name, setName] = useState(
    () => user?.name || ""
  );

  const [email, setEmail] = useState(
    () => user?.email || ""
  );

  const [avatar, setAvatar] = useState("");

  const [avatarPreview, setAvatarPreview] = useState(
    () => user?.avatar?.url || "/images/images.png"
  );

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }

    if (isUpdated) {
      toast.success("User updated successfully");

      dispatch(loadUser());
      dispatch(updateReset());

      navigate("/users/me");
    }
  }, [
    dispatch,
    error,
    isUpdated,
    navigate,
  ]);

  // ======================================================
  // UPDATE PROFILE
  // ======================================================

  const submitHandler = (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.set("name", name);
    formData.set("email", email);

    if (avatar) {
      formData.set("avatar", avatar);
    }

    dispatch(updateProfile(formData));
  };

  // ======================================================
  // AVATAR CHANGE
  // ======================================================

  const onChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (reader.readyState === 2) {
        setAvatarPreview(reader.result);
        setAvatar(reader.result);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="row wrapper">
      <div className="col-10 col-lg-5 updateprofile">
        <form
          className="shadow-lg"
          onSubmit={submitHandler}
          encType="multipart/form-data"
        >
          <h1 className="mt-2 mb-5">
            Update Profile
          </h1>

          <div className="form-group">
            <label htmlFor="name_field">
              Name
            </label>

            <input
              type="text"
              id="name_field"
              className="form-control"
              name="name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="email_field">
              Email
            </label>

            <input
              type="email"
              id="email_field"
              className="form-control"
              name="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="customFile">
              Avatar
            </label>

            <div className="d-flex align-items-center">
              <div>
                <figure className="avatar mr-3 item-rtl">
                  <img
                    src={avatarPreview}
                    className="rounded-circle"
                    alt="Avatar Preview"
                  />
                </figure>
              </div>

              <div className="custom-file">
                <input
                  type="file"
                  name="avatar"
                  className="custom-file-input"
                  id="customFile"
                  accept="image/*"
                  onChange={onChange}
                />

                <label
                  className="custom-file-label"
                  htmlFor="customFile"
                >
                  Choose Avatar
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-block py-3"
            disabled={loading}
          >
            {loading ? "UPDATING..." : "UPDATE"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfile;