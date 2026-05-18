import User from "../models/User.model.js";
import jwt from "jsonwebtoken";
import { catchAsync } from "../utilities/catchAsync.ut.js";
import { AppError } from "../utilities/appError.ut.js";

// 🔐 generate token
export const generateToken = (res, user) => {
  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};

export const register = catchAsync(async (req, res, next) => {
  const { name, email, phone, password } = req.body;

  if (!name || !password || (!email && !phone)) {
    return next(
      new AppError(
        "Name, password, and either email or phone are required",
        400,
      ),
    );
  }

  let existingUser;

  if (email) {
    existingUser = await User.findOne({
      email: email.toLowerCase(),
    });
  }

  if (!existingUser && phone) {
    existingUser = await User.findOne({ phone });
  }

  if (existingUser) {
    return next(new AppError("User already exists", 400));
  }

  const user = await User.create({
    name,
    email: email ? email.toLowerCase() : undefined,
    phone,
    password,
  });

  const token = generateToken(res, user);

  const userObj = user.toObject();
  delete userObj.password;

  res.status(201).json({
    token,
    user: userObj,
  });
});

/**
 * LOGIN
 */
export const login = catchAsync(async (req, res, next) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return next(new AppError("Please provide email/phone and password", 400));
  }

  const normalizedIdentifier = identifier.toLowerCase();

  const user = await User.findOne({
    $or: [{ email: normalizedIdentifier }, { phone: identifier }],
  });

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError("Invalid credentials", 401));
  }

  const token = generateToken(res, user);

  const userObj = user.toObject();
  delete userObj.password;
  res.status(200).json({
    token,
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
