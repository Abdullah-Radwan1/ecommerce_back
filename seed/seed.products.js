import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "../src/models/category.model.js";
import Product from "../src/models/product.model.js";

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("DB connected");

    // Clear DB
    await Category.deleteMany();
    await Product.deleteMany();

    // =====================================================
    // MAIN CATEGORIES
    // =====================================================

    const furniture = await Category.create({
      name: "Furniture",
      slug: "furniture",
    });

    const decor = await Category.create({
      name: "Decor",
      slug: "decor",
    });

    const lighting = await Category.create({
      name: "Lighting",
      slug: "lighting",
    });

    const kitchen = await Category.create({
      name: "Kitchen",
      slug: "kitchen",
    });

    // =====================================================
    // SUBCATEGORIES
    // =====================================================

    const chairs = await Category.create({
      name: "Chairs",
      slug: "chairs",
      parentId: furniture._id,
    });

    const clocks = await Category.create({
      name: "Clocks",
      slug: "clocks",
      parentId: decor._id,
    });

    const lamps = await Category.create({
      name: "Lamps",
      slug: "lamps",
      parentId: lighting._id,
    });

    const drinkware = await Category.create({
      name: "Drinkware",
      slug: "drinkware",
      parentId: kitchen._id,
    });

    // =====================================================
    // PRODUCTS
    // =====================================================

    await Product.insertMany([
      {
        name: "Basket",
        slug: "basket",
        description: "Eco-friendly handwoven storage basket",
        imageUrl: "/products/basket.jpg",
        category: decor._id,
        subcategory: clocks._id,
        price: 50,
        stock: 20,
        tags: ["storage", "handmade", "eco-friendly"],
      },

      {
        name: "Black Chair",
        slug: "black-chair",
        description: "Modern ergonomic chair",
        imageUrl: "/products/black-chair.jpg",
        category: furniture._id,
        subcategory: chairs._id,
        price: 120,
        stock: 20,
        tags: ["modern", "ergonomic"],
      },

      {
        name: "Black Clock",
        slug: "black-clock",
        description: "Minimalist silent wall clock",
        imageUrl: "/products/black-clock.jpg",
        category: decor._id,
        subcategory: clocks._id,
        price: 70,
        stock: 0,
        tags: ["minimalist", "silent"],
      },

      {
        name: "Cup",
        slug: "cup",
        description: "Ceramic drinkware cup",
        imageUrl: "/products/cup.webp",
        category: kitchen._id,
        subcategory: drinkware._id,
        price: 15,
        stock: 13,
        tags: ["ceramic", "kitchen"],
      },

      {
        name: "Dark Lamp",
        slug: "dark-lamp",
        description: "Adjustable ambient lamp",
        imageUrl: "/products/dark-lamp.jpg",
        category: lighting._id,
        subcategory: lamps._id,
        price: 80,
        stock: 15,
        tags: ["ambient", "adjustable"],
        isFeatured: true,
      },

      {
        name: "Drawer",
        slug: "drawer",
        description: "Wooden storage drawer unit",
        imageUrl: "/products/drawer.webp",
        category: furniture._id,
        subcategory: chairs._id,
        price: 150,
        stock: 7,
        tags: ["storage", "wood"],
      },

      {
        name: "Golden Clock",
        slug: "golden-clock",
        description: "Luxury decorative clock",
        imageUrl: "/products/golden-clock.webp",
        category: decor._id,
        subcategory: clocks._id,
        price: 200,
        stock: 3,
        tags: ["luxury", "decor"],
      },

      {
        name: "Gray Chair",
        slug: "gray-chair",
        description: "Comfortable fabric chair",
        imageUrl: "/products/gray-chair.jpg",
        category: furniture._id,
        subcategory: chairs._id,
        price: 130,
        stock: 14,
        tags: ["comfortable", "modern"],
        isFeatured: true,
      },

      {
        name: "Grey Clock",
        slug: "grey-clock",
        description: "Modern silent wall clock",
        imageUrl: "/products/grey-clock.jpg",
        category: decor._id,
        subcategory: clocks._id,
        price: 75,
        stock: 14,
        tags: ["wall-clock", "modern"],
      },

      {
        name: "White Chair",
        slug: "white-chair",
        description: "Minimal white chair",
        imageUrl: "/products/white-chair.jpg",
        category: furniture._id,
        subcategory: chairs._id,
        price: 140,
        stock: 15,
        tags: ["minimal", "dining"],
        isFeatured: true,
      },

      {
        name: "Wooden Table",
        slug: "wooden-table",
        description: "Natural wooden table",
        imageUrl: "/products/wooden-table.jpg",
        category: furniture._id,
        subcategory: chairs._id,
        price: 300,
        stock: 22,
        tags: ["wood", "natural"],
        isFeatured: true,
      },

      {
        name: "Lamp",
        slug: "lamp",
        description: "Minimal ambient lamp",
        imageUrl: "/products/lamp.jpg",
        category: lighting._id,
        subcategory: lamps._id,
        price: 90,
        stock: 27,
        tags: ["minimal", "lighting"],
      },

      {
        name: "Table",
        slug: "table",
        description: "Multi-purpose table",
        imageUrl: "/products/table.jpg",
        category: furniture._id,
        subcategory: chairs._id,
        price: 250,
        stock: 18,
        tags: ["multi-purpose", "modern"],
      },

      {
        name: "Teapot",
        slug: "teapot",
        description: "Ceramic heat-retaining teapot",
        imageUrl: "/products/teapot.webp",
        category: kitchen._id,
        subcategory: drinkware._id,
        price: 60,
        stock: 10,
        tags: ["tea", "kitchen"],
      },

      {
        name: "Vase",
        slug: "vase",
        description: "Decorative ceramic vase",
        imageUrl: "/products/vase.jpg",
        category: decor._id,
        subcategory: clocks._id,
        price: 70,
        stock: 0,
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
