import express from "express";
import {
  requestRefund,
  handleRefund,
  getMyRefunds,
  getAllRefunds,
} from "../controllers/refund.controller.js";

import { protect, adminOnly } from "../middleware.js";

const router = express.Router();

// 🧑‍💻 user
router.post("/", protect, requestRefund);
router.get("/my", protect, getMyRefunds);

// 👑 admin
router.get("/", protect, adminOnly, getAllRefunds);
router.put("/:id", protect, adminOnly, handleRefund);

export default router;
