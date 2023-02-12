const express = require("express");
const { logIn, signUp, getUser } = require("../controllers/authController");
const protect = require("../middleware/protect");

const router = express.Router();

router.post("/login", logIn);
router.post("/signup", signUp);
router.get("/user", protect, getUser);

module.exports = router;
