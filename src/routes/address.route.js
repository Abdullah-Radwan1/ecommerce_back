import express from "express";
import {
  getMyAddresses,
  addAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
  getUserAddresses,
} from "../controllers/address.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect); // Protect all routes below

router.get("/user/:userId", adminOnly, getUserAddresses);
router.get("/", getMyAddresses);
router.post("/", addAddress);
router.patch("/:id", updateAddress);
router.patch("/:id/set-default", setDefaultAddress);
router.delete("/:id", deleteAddress);

export default router;
