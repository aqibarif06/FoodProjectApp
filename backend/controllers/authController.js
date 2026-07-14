// Import required packages

const User = require("../models/user");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const sendToken = require("../utils/sendToken");
const cloudinary = require("../config/cloudinary");
const Email = require("../utils/email");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { promisify } = require("util");

// ======================================================
// SIGNUP
// ======================================================

exports.signup = catchAsyncErrors(async (req, res, next) => {
  const {
    name,
    email,
    password,
    passwordConfirm,
    phoneNumber,
  } = req.body;

  let avatar = {
    public_id: "default",
    url: "/images/images.png",
  };

  // Upload avatar only if a valid Base64 image is provided
  if (
    req.body.avatar &&
    typeof req.body.avatar === "string" &&
    req.body.avatar.startsWith("data:image/")
  ) {
    const result = await cloudinary.uploader.upload(
      req.body.avatar,
      {
        folder: "avatars",
        width: 150,
        crop: "scale",
      }
    );

    avatar = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  }

  const user = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    phoneNumber,
    avatar,
  });

  sendToken(user, 200, res);
});

// ======================================================
// LOGIN
// ======================================================

exports.login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new ErrorHandler(
        "Please enter email and password",
        400
      )
    );
  }

  const user = await User.findOne({
    email,
  }).select("+password");

  if (!user) {
    return next(
      new ErrorHandler(
        "Invalid email or password",
        401
      )
    );
  }

  const isPasswordMatched = await user.correctPassword(
    password,
    user.password
  );

  if (!isPasswordMatched) {
    return next(
      new ErrorHandler(
        "Invalid email or password",
        401
      )
    );
  }

  sendToken(user, 200, res);
});

// ======================================================
// PROTECT ROUTE
// ======================================================

exports.protect = catchAsyncErrors(async (req, res, next) => {
  let token;

  // Token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  // Token from cookie
  else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new ErrorHandler(
        "You are not logged in! Please log in to get access.",
        401
      )
    );
  }

  // Verify JWT
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  // Check whether user still exists
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new ErrorHandler(
        "User no longer exists. Please login again.",
        401
      )
    );
  }

  // Check whether password changed after JWT was issued
  if (
    typeof currentUser.changedPasswordAfter === "function" &&
    currentUser.changedPasswordAfter(decoded.iat)
  ) {
    return next(
      new ErrorHandler(
        "User recently changed password! Please log in again.",
        401
      )
    );
  }

  req.user = currentUser;

  next();
});

// ======================================================
// GET USER PROFILE
// ======================================================

exports.getUserProfile = catchAsyncErrors(
  async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(
        new ErrorHandler("User not found", 404)
      );
    }

    res.status(200).json({
      success: true,
      user,
    });
  }
);

// ======================================================
// UPDATE PASSWORD
// ======================================================

exports.updatePassword = catchAsyncErrors(
  async (req, res, next) => {
    const {
      oldPassword,
      newPassword,
      newPasswordConfirm,
    } = req.body;

    if (
      !oldPassword ||
      !newPassword ||
      !newPasswordConfirm
    ) {
      return next(
        new ErrorHandler(
          "Please provide all password fields",
          400
        )
      );
    }

    if (newPassword !== newPasswordConfirm) {
      return next(
        new ErrorHandler(
          "New password and confirm password do not match",
          400
        )
      );
    }

    const user = await User.findById(
      req.user.id
    ).select("+password");

    if (!user) {
      return next(
        new ErrorHandler("User not found", 404)
      );
    }

    const isMatched = await user.correctPassword(
      oldPassword,
      user.password
    );

    if (!isMatched) {
      return next(
        new ErrorHandler(
          "Old password is incorrect",
          400
        )
      );
    }

    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;

    await user.save();

    sendToken(user, 200, res);
  }
);

// ======================================================
// UPDATE PROFILE
// ======================================================

exports.updateProfile = catchAsyncErrors(
  async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(
        new ErrorHandler("User not found", 404)
      );
    }

    const newUserData = {};

    // Update name only if provided
    if (req.body.name !== undefined) {
      newUserData.name = req.body.name;
    }

    // Update email only if provided
    if (req.body.email !== undefined) {
      newUserData.email = req.body.email;
    }

    const avatar = req.body.avatar;

    // Upload only a newly selected Base64 image
    if (
      avatar &&
      typeof avatar === "string" &&
      avatar.startsWith("data:image/")
    ) {
      // Upload new avatar first
      const result = await cloudinary.uploader.upload(
        avatar,
        {
          folder: "avatars",
          width: 150,
          crop: "scale",
        }
      );

      // Delete old Cloudinary avatar after new upload succeeds
      if (
        user.avatar?.public_id &&
        user.avatar.public_id !== "default"
      ) {
        await cloudinary.uploader.destroy(
          user.avatar.public_id
        );
      }

      newUserData.avatar = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      newUserData,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      user: updatedUser,
    });
  }
);

// ======================================================
// FORGOT PASSWORD
// ======================================================

exports.forgotPassword = catchAsyncErrors(
  async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
      return next(
        new ErrorHandler(
          "Please provide your email address",
          400
        )
      );
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return next(
        new ErrorHandler(
          "There is no user with that email address.",
          404
        )
      );
    }

    const resetToken = user.createPasswordResetToken();

    await user.save({
      validateBeforeSave: false,
    });

    try {
      const frontendURL = process.env.FRONTEND_URL.replace(
        /\/$/,
        ""
      );

      const resetURL =
        `${frontendURL}/users/resetPassword/${resetToken}`;

      await new Email(
        user,
        resetURL
      ).sendPasswordReset();

      res.status(200).json({
        status: "success",
        message: "Token sent to email!",
      });
    } catch (error) {
      console.error("EMAIL ERROR:", error.message);

      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;

      await user.save({
        validateBeforeSave: false,
      });

      return next(
        new ErrorHandler(
          "There was an error sending the email. Please try again later.",
          500
        )
      );
    }
  }
);

// ======================================================
// RESET PASSWORD
// ======================================================

exports.resetPassword = catchAsyncErrors(
  async (req, res, next) => {
    const { password, passwordConfirm } = req.body;

    if (!password || !passwordConfirm) {
      return next(
        new ErrorHandler(
          "Please provide password and confirm password",
          400
        )
      );
    }

    if (password !== passwordConfirm) {
      return next(
        new ErrorHandler(
          "Password and confirm password do not match",
          400
        )
      );
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return next(
        new ErrorHandler(
          "Token is invalid or has expired",
          400
        )
      );
    }

    user.password = password;
    user.passwordConfirm = passwordConfirm;

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    sendToken(user, 200, res);
  }
);

// ======================================================
// LOGOUT
// ======================================================

exports.logout = catchAsyncErrors(
  async (req, res, next) => {
    res.cookie("jwt", "", {
      expires: new Date(0),

      httpOnly: true,

      secure: process.env.NODE_ENV === "production",

      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  }
);