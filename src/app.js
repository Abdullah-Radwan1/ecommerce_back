import dotenv from "dotenv";
dotenv.config();

import express from "express";
import productRoutes from "./routes/product.route.js";
import authRoutes from "./routes/auth.route.js";
import orderRoutes from "./routes/order.route.js";
import cartRoutes from "./routes/cart.route.js";
import refundRoutes from "./routes/refund.route.js";
import categoriesRoutes from "./routes/category.route.js";

import testimonialRoutes from "./routes/testimonial.route.js";
import adminRoutes from "./routes/admin.route.js";
import adminProductsRoutes from "./routes/admin.products.routes.js";
import revenueRoutes from "./routes/revenue.route.js";
import userRoutes from "./routes/user.route.js";
import addressRoutes from "./routes/address.route.js";

import { AppError } from "./utilities/appError.ut.js";
import { errorHandler } from "./middleware/errorhandler.js";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(express.json());
const corsOptions = {
  origin: [
    "http://localhost:4200", // For local Angular development
    process.env.FRONTEND_URL, // Your dynamic production URL from Vercel
  ].filter(Boolean), // Replace with your actual deployed URL
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true, // Enable this if you are using cookies or sessions
};
app.use(cors(corsOptions));
app.use("/uploads", express.static("uploads"));
app.use(cookieParser());
app.use("/v1/products", productRoutes);
app.use("/v1/categories", categoriesRoutes);
app.use("/v1/auth", authRoutes);
app.use("/v1/orders", orderRoutes);
app.use("/v1/cart", cartRoutes);
app.use("/v1/refund", refundRoutes);
app.use("/v1/testimonials", testimonialRoutes);
app.use("/v1/admin", adminRoutes);
app.use("/v1/admin/products", adminProductsRoutes);
app.use("/v1/admin/revenue", revenueRoutes);
app.use("/v1/users", userRoutes);
app.use("/v1/addresses", addressRoutes);

app.all("{*path}", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

export default app;
