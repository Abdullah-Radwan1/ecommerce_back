import jwt from "jsonwebtoken";
import { AppError } from "../utilities/appError.ut.js";

// ------------------------------------------------------
// PROTECT ROUTES
// ------------------------------------------------------
export const protect = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return next(new AppError("Not authenticated", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded = { id, role, iat, exp }

    req.user = decoded;
    req.user._id = decoded.id; // Map id to _id so all endpoints work

    next();
  } catch (error) {
    return next(new AppError("Invalid token", 401));
  }
};

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
