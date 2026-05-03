import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

// GET CART
export const getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
  );

  res.json(cart);
};

// ADD TO CART
export const addToCart = async (req, res) => {
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
};

// 🔥 CHECK PRICE CHANGES
export const syncCartPrices = async (req, res) => {
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
};

// REMOVE ITEM
export const removeFromCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== req.params.productId,
  );

  await cart.save();

  res.json(cart);
};
