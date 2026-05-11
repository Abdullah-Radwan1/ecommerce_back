import express from "express";
import { getStats } from "../controllers/admin/admin.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/stats", protect, adminOnly, getStats);

export default router;
