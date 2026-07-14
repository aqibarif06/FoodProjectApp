const sendToken = (user, statusCode, res) => {
  // Generate JWT token
  const token = user.getJWTToken();

  // Cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_EXPIRES_TIME) *
          24 *
          60 *
          60 *
          1000
    ),

    httpOnly: true,

    secure: process.env.NODE_ENV === "production",

    sameSite:
      process.env.NODE_ENV === "production"
        ? "none"
        : "lax",
  };

  // Store JWT in cookie
  res.cookie("jwt", token, cookieOptions);

  // Remove password from response
  user.password = undefined;

  // Send response
  res.status(statusCode).json({
    success: true,
    token,
    data: {
      user,
    },
  });
};

module.exports = sendToken;