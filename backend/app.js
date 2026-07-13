const express = require("express");
const app = express();

const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const request = require("request");

const errorMiddleware = require("./middlewares/errors");

// Routes
const aiRoutes = require("./routes/ai.routes");
const foodRouter = require("./routes/foodItem");
const restaurant = require("./routes/restaurant");
const menuRouter = require("./routes/menu");
const coupon = require("./routes/couponRoutes");
const order = require("./routes/order");
const auth = require("./routes/auth");
const payment = require("./routes/payment");
const cart = require("./routes/cart");

// ------------------- Middlewares -------------------

const allowedOrigins = [
  "http://localhost:5173",
  "https://food-project-app.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, mobile apps, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "30kb" }));
app.use(express.urlencoded({ extended: true, limit: "30kb" }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(fileUpload());

// ------------------- Stripe Proxy -------------------

app.use("/proxy", (req, res) => {
  const url = "https://checkout.stripe.com" + req.url;
  req.pipe(request(url)).pipe(res);
});

// ------------------- API Routes -------------------

app.use("/api/v1/eats", foodRouter);
app.use("/api/v1/eats/menus", menuRouter);
app.use("/api/v1/eats/stores", restaurant);
app.use("/api/v1/eats/orders", order);
app.use("/api/v1/eats/cart", cart);

app.use("/api/v1/users", auth);
app.use("/api/v1", payment);

app.use("/api/v1/coupon", coupon);
app.use("/api/v1/ai", aiRoutes);

// ------------------- View Engine -------------------

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// ------------------- 404 Handler -------------------

app.all("*", (req, res) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// ------------------- Global Error Handler -------------------

app.use(errorMiddleware);

module.exports = app;