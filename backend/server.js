const dotenv = require("dotenv");

// ======================================================
// LOAD ENVIRONMENT VARIABLES FIRST
// ======================================================

dotenv.config({
  path: "./config/config.env",
});

// ======================================================
// HANDLE UNCAUGHT EXCEPTIONS
// ======================================================

process.on("uncaughtException", (err) => {
  console.log(`ERROR: ${err.message}`);
  console.log(err.stack);

  console.log(
    "Shutting down server due to uncaught exception"
  );

  process.exit(1);
});

// ======================================================
// IMPORT APP AND DATABASE AFTER ENV CONFIG
// ======================================================

const app = require("./app");
const connectDatabase = require("./config/database");

// ======================================================
// CONNECT TO DATABASE
// ======================================================

connectDatabase();

// ======================================================
// START SERVER
// ======================================================

const server = app.listen(process.env.PORT, () => {
  console.log(
    `Server started on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode.`
  );
});

// ======================================================
// HANDLE UNHANDLED PROMISE REJECTIONS
// ======================================================

process.on("unhandledRejection", (err) => {
  console.log(`ERROR: ${err.message}`);

  console.log(
    "Shutting down the server due to unhandled promise rejection"
  );

  server.close(() => {
    process.exit(1);
  });
});