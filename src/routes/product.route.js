import express from "express";

const router = express.Router();

import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  fastSelling,
  featuredProducts,
} from "../controllers/product.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

router.get("/", getProducts);
router.get("/fast-selling", fastSelling);
router.get("/featured", featuredProducts);

router.get("/:slug", getProduct);

router.post("/", protect, adminOnly, createProduct);
router.put("/:slug", protect, adminOnly, updateProduct);
router.delete("/:slug", protect, adminOnly, deleteProduct);

export default router;
