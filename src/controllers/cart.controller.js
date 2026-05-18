import Cart from "../models/cart.model.js";
import Product from "../models/Product.model.js";
import { catchAsync } from "../utilities/catchAsync.ut.js";

// GET CART
export const getCart = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
  );

  if (!cart) {
    return res.json({ items: [], totalResult: 0 });
  }

  // Paginate the items array manually
  const totalResult = cart.items.length;
  const paginatedItems = cart.items.slice(skip, skip + limit);

  res.json({
    _id: cart._id,
    user: cart.user,
    items: paginatedItems,
    pagination: {
      page,
      limit,
      totalResult,
      totalPages: Math.ceil(totalResult / limit),
    },
  });
});

// ADD TO CART
export const addToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const product = await Product.findById(productId);

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId,
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      product: productId,
      quantity,
      priceAtAdd: product.price,
    });
  }

  await cart.save();

  res.json(cart);
});

// 🔥 CHECK PRICE CHANGES
export const syncCartPrices = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });

  for (let item of cart.items) {
    const product = await Product.findById(item.product);

    if (!product) continue;

    if (product.price !== item.priceAtAdd) {
      item.isPriceChanged = true;
    } else {
      item.isPriceChanged = false;
    }
  }

  await cart.save();

  res.json(cart);
});

// REMOVE ITEM
export const removeFromCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== req.params.productId,
  );

  await cart.save();

  res.json(cart);
});

// CLEAR CART
export const clearCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (cart) {
    cart.items = [];
    await cart.save();
  }

  res.json(cart || { items: [] });
});
