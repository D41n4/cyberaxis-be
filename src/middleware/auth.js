const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const { decodeToken } = require("../util/jwt");

const protect = asyncHandler(async (req, res, next) => {
  let decoded;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      decoded = decodeToken(token);

      if (!decoded) {
        res.status(401);
        throw new Error("Not authorized, no token");
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
  }
});

module.exports = { protect };
