import express from "express";

import { protect, adminOnly } from "../middleware/auth.middleware.js";
import { getsSalesReport } from "../controllers/report.controller.js";

const router = express.Router();

router.get("/", protect, adminOnly, getsSalesReport);

export default router;
