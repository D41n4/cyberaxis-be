const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const { decodeToken } = require("../util/jwt");

const protect = asyncHandler(async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = decodeToken(token);

      if (!decoded) {
        res.status(401);
        throw new Error("Not authorized");
      }

      const user = await User.findById(decoded.id);

      if (!user) {
        res.status(401);
        throw new Error("Not authorized");
      }

      req.userId = decoded.id;

      next();
    } catch (err) {
      res.status(500);
      throw new Error(err.message);
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

module.exports = protect;
