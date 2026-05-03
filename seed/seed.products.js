import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "../src/models/category.model.js";
import Product from "../src/models/product.model.js";

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("DB connected");

    // clear DB (optional)
    await Category.deleteMany();
    await Product.deleteMany();

    // ✅ 1. create categories
    const categories = await Category.insertMany([
      { name: "Men Jalabiyas", slug: "men-jalabiyas" },
      { name: "Women Jalabiyas", slug: "women-jalabiyas" },
    ]);

    // ✅ 2. extract IDs INSIDE function
    const menCategory = categories.find((c) => c.slug === "men-jalabiyas");

    const womenCategory = categories.find((c) => c.slug === "women-jalabiyas");

    const menCategoryId = menCategory._id;
    const womenCategoryId = womenCategory._id;

    // ✅ 3. use them HERE (same scope)
    await Product.insertMany([
      // ===================== MEN (7 products)
      {
        name: {
          ar: "جلابية رجالي قطن كلاسيك",
          en: "Men Classic Cotton Jalabiya",
        },
        description: {
          ar: "جلابية يومية مريحة من القطن",
          en: "Comfortable daily cotton jalabiya",
        },
        imageUrl: "/products/men1.png",
        price: 320,
        category: menCategoryId,
        gender: "men",
        sizes: [
          { size: "M", stock: 10 },
          { size: "L", stock: 12 },
          { size: "XL", stock: 8 },
        ],
        colors: ["white", "beige"],
      },
      {
        name: {
          ar: "جلابية رجالي مطرزة فاخرة",
          en: "Men Luxury Embroidered Jalabiya",
        },
        description: {
          ar: "تصميم فاخر للمناسبات",
          en: "Luxury design for occasions",
        },
        imageUrl: "/products/men2.png",
        price: 550,
        category: menCategoryId,
        gender: "men",
        sizes: [
          { size: "L", stock: 6 },
          { size: "XL", stock: 5 },
        ],
        colors: ["black", "navy"],
      },
      {
        name: { ar: "جلابية رجالي صيفي خفيف", en: "Men Summer Light Jalabiya" },
        description: { ar: "خفيفة ومناسبة للحر", en: "Light and breathable" },
        imageUrl: "/products/men3.png",
        price: 280,
        category: menCategoryId,
        gender: "men",
        sizes: [
          { size: "M", stock: 14 },
          { size: "L", stock: 10 },
        ],
        colors: ["white", "gray"],
      },
      {
        name: { ar: "جلابية رجالي خليجي", en: "Men Gulf Style Jalabiya" },
        description: { ar: "ستايل خليجي أنيق", en: "Elegant Gulf style" },
        imageUrl: "/products/men4.png",
        price: 430,
        category: menCategoryId,
        gender: "men",
        sizes: [
          { size: "M", stock: 8 },
          { size: "L", stock: 9 },
        ],
        colors: ["white", "cream"],
      },
      {
        name: { ar: "جلابية رجالي قطن فاخر", en: "Premium Cotton Jalabiya" },
        description: { ar: "قطن عالي الجودة", en: "High quality cotton" },
        imageUrl: "/products/men5.png",
        price: 390,
        category: menCategoryId,
        gender: "men",
        sizes: [
          { size: "L", stock: 10 },
          { size: "XL", stock: 7 },
        ],
        colors: ["beige", "brown"],
      },
      {
        name: { ar: "جلابية رجالي بسيطة", en: "Simple Men Jalabiya" },
        description: { ar: "تصميم بسيط يومي", en: "Simple daily wear" },
        imageUrl: "/products/men6.png",
        price: 250,
        category: menCategoryId,
        gender: "men",
        sizes: [
          { size: "M", stock: 15 },
          { size: "L", stock: 12 },
        ],
        colors: ["white"],
      },
      {
        name: { ar: "جلابية رجالي رسمية", en: "Formal Men Jalabiya" },
        description: { ar: "للمناسبات الرسمية", en: "For formal occasions" },
        imageUrl: "/products/men7.png",
        price: 600,
        category: menCategoryId,
        gender: "men",
        sizes: [
          { size: "L", stock: 5 },
          { size: "XL", stock: 4 },
        ],
        colors: ["black"],
      },

      // ===================== WOMEN (7 products)
      {
        name: { ar: "جلابية حريمي أنيقة", en: "Women Elegant Jalabiya" },
        description: { ar: "تصميم عصري مريح", en: "Modern comfortable design" },
        imageUrl: "/products/women1.png",
        price: 420,
        category: womenCategoryId,
        gender: "women",
        sizes: [
          { size: "S", stock: 10 },
          { size: "M", stock: 12 },
        ],
        colors: ["pink", "cream"],
      },
      {
        name: { ar: "جلابية حريمي مطرزة", en: "Women Embroidered Jalabiya" },
        description: {
          ar: "تطريز فاخر للمناسبات",
          en: "Luxury embroidery for events",
        },
        imageUrl: "/products/women2.png",
        price: 650,
        category: womenCategoryId,
        gender: "women",
        sizes: [
          { size: "M", stock: 8 },
          { size: "L", stock: 6 },
        ],
        colors: ["black", "gold"],
      },
      {
        name: { ar: "جلابية حريمي يومية", en: "Women Casual Jalabiya" },
        description: {
          ar: "مريحة للاستخدام اليومي",
          en: "Comfortable daily wear",
        },
        imageUrl: "/products/women3.png",
        price: 300,
        category: womenCategoryId,
        gender: "women",
        sizes: [
          { size: "S", stock: 14 },
          { size: "M", stock: 10 },
        ],
        colors: ["blue", "gray"],
      },
      {
        name: { ar: "جلابية حريمي واسعة", en: "Women Loose Jalabiya" },
        description: {
          ar: "تصميم واسع ومريح",
          en: "Loose and comfortable design",
        },
        imageUrl: "/products/women4.png",
        price: 380,
        category: womenCategoryId,
        gender: "women",
        sizes: [
          { size: "M", stock: 11 },
          { size: "L", stock: 9 },
        ],
        colors: ["white", "beige"],
      },
      {
        name: { ar: "جلابية حريمي فاخرة", en: "Women Luxury Jalabiya" },
        description: { ar: "تصميم راقي للمناسبات", en: "Luxury occasion wear" },
        imageUrl: "/products/women5.png",
        price: 720,
        category: womenCategoryId,
        gender: "women",
        sizes: [
          { size: "S", stock: 6 },
          { size: "M", stock: 5 },
        ],
        colors: ["black", "red"],
      },
      {
        name: { ar: "جلابية حريمي بسيطة", en: "Simple Women Jalabiya" },
        description: { ar: "ستايل بسيط يومي", en: "Simple daily style" },
        imageUrl: "/products/women6.png",
        price: 260,
        category: womenCategoryId,
        gender: "women",
        sizes: [
          { size: "S", stock: 13 },
          { size: "M", stock: 10 },
        ],
        colors: ["white", "light blue"],
      },
      {
        name: { ar: "جلابية حريمي شتوية", en: "Women Winter Jalabiya" },
        description: { ar: "قماش دافئ لفصل الشتاء", en: "Warm winter fabric" },
        imageUrl: "/products/women7.png",
        price: 500,
        category: womenCategoryId,
        gender: "women",
        sizes: [
          { size: "M", stock: 8 },
          { size: "L", stock: 7 },
        ],
        colors: ["brown", "dark green"],
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
