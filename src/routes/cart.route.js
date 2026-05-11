import express from "express";
import {
  getCart,
  addToCart,
  removeFromCart,
  syncCartPrices,
  clearCart,
} from "../controllers/cart.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();
router.get("/", protect, getCart);
// router.get("/:id", protect, getCart); todo
router.post("/add", protect, addToCart);
router.delete("/clear", protect, clearCart);
router.delete("/:productId", protect, removeFromCart);

// 🔥 Important
router.put("/sync", protect, syncCartPrices);

export default router;
