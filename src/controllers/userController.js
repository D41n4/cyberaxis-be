const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const { generate, compare } = require("../util/bcrypt");
const { generateToken } = require("../util/jwt");

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

module.exports = { changeName };
