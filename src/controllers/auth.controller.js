import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { catchAsync } from "../utilities/catchAsync.ut.js";
import { AppError } from "../utilities/appError.ut.js";

// 🔐 generate token
export const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  // Now 'res' will be the actual Express response object
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Use true in production
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token; // Optional: return it if you want to send it in JSON too
};

export const register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new AppError("All fields are required", 400));
  }

  const normalizedEmail = email.toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    return next(new AppError("User already exists", 400));
  }

  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
  });

  const token = generateToken(res, user._id);

  const userObj = user.toObject();
  delete userObj.password;

  res.status(201).json({
    user: userObj,
    token: token,
  });
});

/**
 * LOGIN
 */
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  const normalizedEmail = email.toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  });

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError("Invalid credentials", 401));
  }

  // 🔥 set cookie
  generateToken(res, user._id);

  const userObj = user.toObject();
  delete userObj.password;

  res.json({
    user: userObj,
  });
});

/**
 * LOGOUT
 */
export const logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logged out successfully" });
};

/**
 * GET PROFILE
 */
export const getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  res.json({ user });
});
