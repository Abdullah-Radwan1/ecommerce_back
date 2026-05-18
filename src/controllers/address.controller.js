import Address from "../models/Address.model.js";
import { catchAsync } from "../utilities/catchAsync.ut.js";
import { AppError } from "../utilities/appError.ut.js";

// GET ALL ADDRESSES FOR LOGGED IN USER
export const getMyAddresses = catchAsync(async (req, res, next) => {
  const addresses = await Address.find({ user: req.user.id, isDeleted: false });
  res.status(200).json({
    status: "success",
    results: addresses.length,
    data: { addresses },
  });
});

// ADD NEW ADDRESS
export const addAddress = catchAsync(async (req, res, next) => {
  const { street, city, state, zipCode, country, phone, isDefault } = req.body;

  // Check if this is the first address for the user
  const count = await Address.countDocuments({
    user: req.user.id,
    isDeleted: false,
  });

  let makeDefault = isDefault || count === 0;

  if (makeDefault) {
    // Unset current default
    await Address.updateMany({ user: req.user.id }, { isDefault: false });
  }

  const newAddress = await Address.create({
    user: req.user.id,
    street,
    city,
    state,
    zipCode,
    country,
    phone,
    isDefault: makeDefault,
  });

  res.status(201).json({
    status: "success",
    data: { address: newAddress },
  });
});

// UPDATE ADDRESS
export const updateAddress = catchAsync(async (req, res, next) => {
  const { street, city, state, zipCode, country, phone, isDefault } = req.body;
  const addressId = req.params.id;

  const address = await Address.findOne({
    _id: addressId,
    user: req.user.id,
    isDeleted: false,
  });

  if (!address) {
    return next(new AppError("Address not found", 404));
  }

  if (isDefault && !address.isDefault) {
    // If setting to default, unset others
    await Address.updateMany({ user: req.user.id }, { isDefault: false });
  }

  // Update fields
  if (street) address.street = street;
  if (city) address.city = city;
  if (state) address.state = state;
  if (zipCode) address.zipCode = zipCode;
  if (country) address.country = country;
  if (phone) address.phone = phone;
  if (isDefault !== undefined) address.isDefault = isDefault;

  // If we unset default, we should check if any other is default.
  // If not, and there are others, we should probably keep one as default?
  // But the requirement says "setting a new default deselects the previous".
  // It doesn't explicitly say we can't have NO default, but usually one is expected.

  await address.save();

  res.status(200).json({
    status: "success",
    data: { address },
  });
});

// SET DEFAULT ADDRESS
export const setDefaultAddress = catchAsync(async (req, res, next) => {
  const addressId = req.params.id;

  const address = await Address.findOne({
    _id: addressId,
    user: req.user.id,
    isDeleted: false,
  });

  if (!address) {
    return next(new AppError("Address not found", 404));
  }

  // Unset current default
  await Address.updateMany({ user: req.user.id }, { isDefault: false });

  address.isDefault = true;
  await address.save();

  res.status(200).json({
    status: "success",
    data: { address },
  });
});

// DELETE ADDRESS (SOFT DELETE)
export const deleteAddress = catchAsync(async (req, res, next) => {
  const addressId = req.params.id;

  const address = await Address.findOne({
    _id: addressId,
    user: req.user.id,
    isDeleted: false,
  });

  if (!address) {
    return next(new AppError("Address not found", 404));
  }

  const wasDefault = address.isDefault;
  address.isDeleted = true;
  address.isDefault = false;
  await address.save();

  // If it was default, set another one as default if others exist
  if (wasDefault) {
    const anotherAddress = await Address.findOne({
      user: req.user.id,
      isDeleted: false,
    });
    if (anotherAddress) {
      anotherAddress.isDefault = true;
      await anotherAddress.save();
    }
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// 👑 ADMIN: GET ALL ADDRESSES FOR A SPECIFIC USER
export const getUserAddresses = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const addresses = await Address.find({ user: userId, isDeleted: false });
  res.status(200).json({
    status: "success",
    results: addresses.length,
    data: { addresses },
  });
});
