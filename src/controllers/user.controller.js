import User from "../models/user.model.js";
import { catchAsync } from "../utilities/catchAsync.ut.js";
import { AppError } from "../utilities/appError.ut.js";
import { getPagination } from "../middleware/pagination.middleware.js";

// 👑 ADMIN: GET ALL USERS
export const getAllUsers = catchAsync(async (req, res, next) => {
  const { search, role, status } = req.query;

  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  if (role && role !== "all") {
    filter.role = role;
  }

  if (status === "deleted") {
    filter.isDeleted = true;
  } else if (status === "active") {
    filter.isDeleted = false;
  }

  const results = await getPagination(User, req, filter);

  // Remove passwords from results
  if (results.data) {
    results.data = results.data.map((user) => {
      const obj = user.toObject();
      delete obj.password;
      return obj;
    });
  }

  res.json(results);
});

// 👑 ADMIN: UPDATE USER ROLE
export const updateUserRole = catchAsync(async (req, res, next) => {
  const { role } = req.body;

  if (!["admin", "user"].includes(role)) {
    return next(new AppError("Invalid role", 400));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true },
  ).select("-password");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.json({ success: true, user });
});

// 👑 ADMIN: SOFT DELETE USER
export const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Toggle isDeleted status
  user.isDeleted = !user.isDeleted;
  await user.save();

  res.json({
    success: true,
    message: `User ${user.isDeleted ? "deleted" : "restored"} successfully`,
  });
});
