import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // Added trim to clean up accidental whitespaces
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // Forces slugs to be lowercase
      index: true, // Added index for faster queries
    },
    // ✅ Self-referencing field for subcategories
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null, // If null, it is a top-level main category
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
);

// Fallback check to prevent compiling the model twice in frameworks like Next.js
const Category =
  mongoose.models.Category || mongoose.model("Category", categorySchema);

export default Category;
