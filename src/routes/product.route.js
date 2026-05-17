import express from "express";

const router = express.Router();

import {
  createProduct,
  getProducts,
  getProduct,
  getRelatedProducts,
  updateProduct,
  deleteProduct,
  fastSelling,
  featuredProducts,
} from "../controllers/product.controller.js";
import { upload } from "../middleware/upload.middleware.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";
router.get("/", getProducts);
router.get("/fast-selling", fastSelling);
router.get("/featured", featuredProducts);
router.get("/related/:slug", getRelatedProducts);

router.get("/:slug", getProduct);

router.post("/", upload.single("image"), protect, adminOnly, createProduct);
router.put("/:slug", upload.single("image"), protect, adminOnly, updateProduct);
router.delete("/:slug", protect, adminOnly, deleteProduct);

export default router;
