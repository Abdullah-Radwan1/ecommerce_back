import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "../src/models/category.model.js";
import Product from "../src/models/Product.model.js";

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB connected");

    // clear DB
    await Category.deleteMany();
    await Product.deleteMany();

    // ✅ Categories
    const categories = await Category.insertMany([
      { name: "Accessories", slug: "accessories" },
      { name: "Chairs", slug: "chairs" },
      { name: "Clocks", slug: "clocks" },
      { name: "Lamps", slug: "lamps" },
      { name: "Tables", slug: "tables" },
    ]);

    const accessoriesCategoryId = categories.find(
      (c) => c.slug === "accessories",
    )._id;
    const chairsCategoryId = categories.find((c) => c.slug === "chairs")._id;
    const clocksCategoryId = categories.find((c) => c.slug === "clocks")._id;
    const lampsCategoryId = categories.find((c) => c.slug === "lamps")._id;
    const tablesCategoryId = categories.find((c) => c.slug === "tables")._id;

    // ✅ Products
    await Product.insertMany([
      // 1
      {
        name: "Basket",
        slug: "basket",
        description: "Eco-friendly handwoven storage basket",
        imageUrl: "/products/basket.jpg",
        price: 50,
        category: accessoriesCategoryId,
        variants: [
          { color: "beige", stock: 12 },
          { color: "natural", stock: 8 },
        ],
        tags: ["storage", "handmade", "eco-friendly"],
      },

      // 2
      {
        name: "Black Chair",
        slug: "black-chair",
        description: "Modern ergonomic chair",
        imageUrl: "/products/black-chair.jpg",
        price: 120,
        category: chairsCategoryId,
        variants: [
          { color: "black", stock: 15 },
          { color: "gray", stock: 5 },
        ],
        tags: ["modern", "ergonomic"],
      },

      // 3 ❌ OUT OF STOCK
      {
        name: "Black Clock",
        slug: "black-clock",
        description: "Minimalist silent wall clock",
        imageUrl: "/products/black-clock.jpg",
        price: 70,
        category: clocksCategoryId,
        variants: [{ color: "black", stock: 0 }],
        tags: ["minimalist", "silent"],
      },

      // 4
      {
        name: "Cup",
        slug: "cup",
        description: "Ceramic drinkware cup",
        imageUrl: "/products/cup.webp",
        price: 15,
        category: accessoriesCategoryId,
        variants: [
          { color: "white", stock: 6 },
          { color: "beige", stock: 7 },
        ],
        tags: ["ceramic", "kitchen"],
      },

      // 5
      {
        name: "Dark Lamp",
        slug: "dark-lamp",
        description: "Adjustable ambient lamp",
        imageUrl: "/products/dark-lamp.jpg",
        price: 80,
        category: lampsCategoryId,
        variants: [
          { color: "black", stock: 10 },
          { color: "dark gray", stock: 5 },
        ],
        tags: ["ambient", "adjustable"],
        isFeatured: true,
      },

      // 6 ⚠️ LOW STOCK
      {
        name: "Drawer",
        slug: "drawer",
        description: "Wooden storage drawer unit",
        imageUrl: "/products/drawer.webp",
        price: 150,
        category: tablesCategoryId,
        variants: [
          { color: "wood", stock: 3 },
          { color: "brown", stock: 4 },
        ],
        tags: ["storage", "wood"],
      },

      // 7 ⚠️ LOW STOCK
      {
        name: "Golden Clock",
        slug: "golden-clock",
        description: "Luxury decorative clock",
        imageUrl: "/products/golden-clock.webp",
        price: 200,
        category: clocksCategoryId,
        variants: [
          { color: "gold", stock: 2 },
          { color: "black-gold", stock: 1 },
        ],
        tags: ["luxury", "decor"],
      },

      // 8
      {
        name: "Gray Chair",
        slug: "gray-chair",
        description: "Comfortable fabric chair",
        imageUrl: "/products/gray-chair.jpg",
        price: 130,
        category: chairsCategoryId,
        variants: [
          { color: "gray", stock: 8 },
          { color: "dark gray", stock: 6 },
        ],
        tags: ["comfortable", "modern"],
        isFeatured: true,
      },

      // 9
      {
        name: "Grey Clock",
        slug: "grey-clock",
        description: "Modern silent wall clock",
        imageUrl: "/products/grey-clock.jpg",
        price: 75,
        category: clocksCategoryId,
        variants: [
          { color: "gray", stock: 9 },
          { color: "light gray", stock: 5 },
        ],
        tags: ["wall-clock", "modern"],
      },

      // 10
      {
        name: "White Chair",
        slug: "white-chair",
        description: "Minimal white chair",
        imageUrl: "/products/white-chair.jpg",
        price: 140,
        category: chairsCategoryId,
        variants: [
          { color: "white", stock: 7 },
          { color: "cream", stock: 8 },
        ],
        tags: ["minimal", "dining"],
        isFeatured: true,
      },

      // 11
      {
        name: "Wooden Table",
        slug: "wooden-table",
        description: "Natural wooden table",
        imageUrl: "/products/wooden-table.jpg",
        price: 300,
        category: tablesCategoryId,
        variants: [
          { color: "wood", stock: 13 },
          { color: "dark wood", stock: 9 },
        ],
        tags: ["wood", "natural"],
        isFeatured: true,
      },

      // 12
      {
        name: "Lamp",
        slug: "lamp",
        description: "Minimal ambient lamp",
        imageUrl: "/products/lamp.jpg",
        price: 90,
        category: lampsCategoryId,
        variants: [
          { color: "white", stock: 12 },
          { color: "black", stock: 15 },
        ],
        tags: ["minimal", "lighting"],
      },

      // 13
      {
        name: "Table",
        slug: "table",
        description: "Multi-purpose table",
        imageUrl: "/products/table.jpg",
        price: 250,
        category: tablesCategoryId,
        variants: [
          { color: "wood", stock: 11 },
          { color: "brown", stock: 7 },
        ],
        tags: ["multi-purpose", "modern"],
      },

      // 14
      {
        name: "Teapot",
        slug: "teapot",
        description: "Ceramic heat-retaining teapot",
        imageUrl: "/products/teapot.webp",
        price: 60,
        category: accessoriesCategoryId,
        variants: [
          { color: "white", stock: 5 },
          { color: "beige", stock: 5 },
        ],
        tags: ["tea", "kitchen"],
      },

      // 15 ❌ OUT OF STOCK
      {
        name: "Vase",
        slug: "vase",
        description: "Decorative ceramic vase",
        imageUrl: "/products/vase.jpg",
        price: 70,
        category: accessoriesCategoryId,
        variants: [
          { color: "white", stock: 0 },
          { color: "beige", stock: 0 },
        ],
        tags: ["decor", "ceramic"],
      },
    ]);

    console.log("Seeding done ✅");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
