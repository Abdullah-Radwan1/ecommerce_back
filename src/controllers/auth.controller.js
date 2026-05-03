import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const register = async (req, res) => {
  const user = await User.create(req.body);
  res.json({
    user,
    token: generateToken(user._id),
  });
};

export const login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user || !(await user.comparePassword(req.body.password))) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  res.json({
    user,
    token: generateToken(user._id),
  });
};
