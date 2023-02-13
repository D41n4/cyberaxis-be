const { compare } = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const { trustedAccounts } = require("../config/constants");
const User = require("../models/userModel");
const { generate } = require("../util/bcrypt");
const { passwordRegex } = require("../util/misc");

const userNameRegex = /^[a-zA-Z]{2,30}$/;

// ------------------------------------------------------------------
// @route PUT /api/user/change-name
// @access Private
const changeName = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const { name } = req.body;

  if (!userNameRegex.test(name)) {
    res.status(400);
    throw new Error("Invalid user details");
  }

  const user = await User.findById(userId);

  if (!user) {
    res.status(401);
    throw new Error("Not authorized");
  }

  user.name = name;

  await user.save();

  res.sendStatus(204);
});

// ------------------------------------------------------------------
// @route GET /api/user/trusted-accounts
// @access Private
const getTrustedAccounts = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const user = await User.findById(userId);

  const myAccounts = user.trustedAccounts;

  const accounts = trustedAccounts.map((el) => {
    return { ...el, isDefault: true };
  });

  const combined = [...accounts, ...myAccounts];

  res.status(200).json({ data: combined });
});

// ------------------------------------------------------------------
// @route POST /api/user/trusted-accounts
// @access Private
const addTrustedAccount = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { id, name } = req.body;

  const user = await User.findById(userId);

  const accAlreadyAdded = user.trustedAccounts.some((el) => el.id === id);

  if (accAlreadyAdded) {
    res.status(400);
    throw new Error("Account already added");
  }

  user.trustedAccounts.push({ id, name });

  await user.save();

  res.sendStatus(201);
});

// ------------------------------------------------------------------
// @route DELETE /api/user/trusted-accounts/:id
// @access Private
const deleteTrustedAccount = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const id = req.params.id;

  const user = await User.findById(userId);

  const idx = user.trustedAccounts.findIndex((el) => el.id === id);

  if (idx === -1) {
    res.status(404);
    throw new Error("Not found");
  }

  user.trustedAccounts.splice(idx, 1);

  await user.save();

  res.sendStatus(204);
});

// ------------------------------------------------------------------
// @route PUT /api/user/change-password
// @access Private
const changePassword = asyncHandler(async (req, res) => {
  const { existingPassword, newPassword } = req.body;
  const userId = req.userId;

  const user = await User.findById(userId);

  const passwordsMatch = await compare(existingPassword, user.password);

  if (!passwordsMatch) {
    res.status(400);
    throw new Error("Invalid password");
  }

  if (!passwordRegex.test(newPassword)) {
    res.status(400);
    throw new Error("Invalid password");
  }

  const hashedPassword = await generate(newPassword);

  user.password = hashedPassword;

  await user.save();
  res.sendStatus(204);
});

// ------------------------------------------------------------------
// @route DELETE /api/user/delete-account
// @access Private
const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.userId;

  try {
    await User.deleteById(userId);
    res.sendStatus(204);
  } catch (error) {
    res.status(400);
    throw new Error("Error deleting account");
  }
});

module.exports = {
  changeName,
  getTrustedAccounts,
  addTrustedAccount,
  deleteTrustedAccount,
  changePassword,
  deleteAccount,
};
