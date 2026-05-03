import express from "express";
import {
  getCart,
  addToCart,
  removeFromCart,
  syncCartPrices,
} from "../controllers/cart.controller.js";
import { protect } from "../middleware.js";

const router = express.Router();

router.get("/", protect, getCart);
router.post("/", protect, addToCart);
router.delete("/:productId", protect, removeFromCart);

// 🔥 مهم
router.put("/sync", protect, syncCartPrices);

export default router;
