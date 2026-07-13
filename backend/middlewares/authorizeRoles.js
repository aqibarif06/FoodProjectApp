const ErrorHandler = require(
  "../utils/errorHandler"
);

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new ErrorHandler(
          "Please login to access this resource",
          401
        )
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role (${req.user.role}) is not allowed to access this resource`,
          403
        )
      );
    }

    next();
  };
};

module.exports = authorizeRoles;