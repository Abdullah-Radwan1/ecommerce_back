import express from "express";
import productRoutes from "./routes/product.route.js";
import authRoutes from "./routes/auth.route.js";
import orderRoutes from "./routes/order.route.js";
import cartRoutes from "./routes/cart.route.js";
import refundRoutes from "./routes/refund.route.js";

import { protect, adminOnly } from "./middleware.js";
import dotenv from "dotenv";
const app = express();
dotenv.config();

app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cartItems", cartRoutes);
app.use("/api/refund", refundRoutes);

export default app;
