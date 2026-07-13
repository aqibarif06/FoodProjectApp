// We are creating a Global Error Handling Middleware in Express.

// We write:
// To handle all application errors in one place and send meaningful error messages to the client.

// We use:
// Whenever any error occurs in the application and next(error) is called.

// It handle:
// Invalid MongoDB Object IDs
// Mongoose Validation Errors
// Duplicate Key Errors (e.g., same email registered twice)
// Invalid JWT Tokens
// Expired JWT Tokens
// Unexpected Server Errors

// Development vs Production
// Development: Shows detailed error information (message + stack trace) to help developers debug.
// Production: Shows only user-friendly messages without exposing sensitive details.

// This middleware acts as the central error manager of the application, catching all errors and sending appropriate responses based on the environment. 

// Think of it as the hospital's emergency department — no matter what type of emergency comes in, it decides how to handle it and what information should be shared with the patient.


const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === "development") {
    return res.status(err.statusCode).json({
      success: false,
      error: err,
      errMessage: err.message,
      stack: err.stack,
    });
  }

  let error = { ...err };
  error.message = err.message;

  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    error = new ErrorHandler(message, 400);
  }

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map(
      (value) => value.message
    );

    error = new ErrorHandler(message, 400);
  }

  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(
      err.keyValue
    )} entered`;

    error = new ErrorHandler(message, 400);
  }

  if (err.name === "JsonWebTokenError") {
    error = new ErrorHandler(
      "JSON Web Token is invalid. Try Again!",
      401
    );
  }

  if (err.name === "TokenExpiredError") {
    error = new ErrorHandler(
      "JSON Web Token is expired. Try Again!",
      401
    );
  }

  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal Server Error",
  });
};
