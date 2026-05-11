import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { catchAsync } from "../utilities/catchAsync.ut.js";
import { AppError } from "../utilities/appError.ut.js";

// ------------------------------------------------------
// PROTECT ROUTES
// ------------------------------------------------------
export const protect = catchAsync(async (req, res, next) => {
  // 🔥 Read token from cookie
  const token = req.cookies.token;

  if (!token) {
    return next(new AppError("Not authorized, no token", 401));
  }

  // 🔥 Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 🔥 Find user
  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    return next(new AppError("User not found", 401));
  }

  // 🔥 Attach user to request
  req.user = user;

  next();
});

// ------------------------------------------------------
// ADMIN ONLY
// ------------------------------------------------------
export const adminOnly = (req, res, next) => {
  // 🔥 protect should run before this
  if (!req.user) {
    return next(new AppError("Not authenticated", 401));
  }

  // 🔥 Check role
  if (req.user.role !== "admin") {
    return next(new AppError("Admin access only", 403));
  }

  next();
};
