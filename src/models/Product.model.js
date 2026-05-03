import mongoose from "mongoose";
const productSchema = new mongoose.Schema(
  {
    name: {
      ar: { type: String, required: true },
      en: { type: String, required: true },
    },
    description: {
      ar: String,
      en: String,
    },

    imageUrl: { type: String, required: true },

    price: { type: Number, required: true },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    gender: {
      type: String,
      enum: ["men", "women"],
      required: true,
    },

    sizes: [
      {
        size: { type: String }, // S, M, L, XL
        stock: { type: Number, default: 0 },
      },
    ],

    colors: [String],

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Product", productSchema);
