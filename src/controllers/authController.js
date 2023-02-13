const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const { generate, compare } = require("../util/bcrypt");
const { generateToken } = require("../util/jwt");
const { passwordRegex, emailRegex, userNameRegex } = require("../util/misc");

// ------------------------------------------------------------------
// @route POST /api/auth/login
// @access Public
const logIn = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    email: email.toLowerCase(),
  });

  if (!user) {
    res.status(401);
    throw new Error("User not found or credentials are not valid");
  }

  const passwordsMatch = await compare(password, user.password);

  if (!passwordsMatch) {
    res.status(401);
    throw new Error("User not found or credentials are not valid");
  }

  res.status(200).json({
    user: { _id: user._id, name: user.name, email: user.email },
    token: generateToken(user._id),
  });
});

// ------------------------------------------------------------------
// @route POST /api/auth/signup
// @access Public
const signUp = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (
    !passwordRegex.test(password) ||
    !emailRegex.test(email) ||
    !userNameRegex.test(name)
  ) {
    res.status(400);
    throw new Error("Invalid user details");
  }

  const userExists = await User.findOne({
    email: email.toLowerCase(),
  });

  if (userExists) {
    res.status(409);
    throw new Error("User already exists");
  }

  const hashedPassword = await generate(password);

  const user = await User.create({
    name: name,
    email: email.toLowerCase(),
    password: hashedPassword,
  });

  res.status(201).json({
    user: { _id: user._id, name: user.name, email: user.email },
    token: generateToken(user._id),
  });
});

// ------------------------------------------------------------------
// @route GET /api/auth/user
// @access Private
const getUser = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const user = await User.findById(userId);

  if (!user) {
    res.status(401);
    throw new Error("Not authorized");
  }

  res
    .status(200)
    .json({ user: { _id: user._id, name: user.name, email: user.email } });
});

module.exports = { logIn, signUp, getUser };
