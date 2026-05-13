import express from "express";
import { createProduct, getProducts, getProduct, updateProduct, deleteProduct, fastSelling, featuredProducts } from "../controllers/product.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

// Admin CRUD routes with image upload
router.post("/", upload.single('image'), protect, adminOnly, createProduct);
router.put("/:id", upload.single('image'), protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

// Admin specific routes
router.get("/", protect, adminOnly, getProducts);
router.get("/fast-selling", fastSelling);
router.get("/featured", featuredProducts);
router.get("/:slug", getProduct);

export default router;
