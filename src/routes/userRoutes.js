const express = require("express");
const { changeName } = require("../controllers/userController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.put("/change-name", protect, changeName);

module.exports = router;
