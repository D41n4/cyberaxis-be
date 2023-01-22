const express = require("express");
const { testSearchTweets } = require("../controllers/tweetsController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/test/tweets/search", protect, testSearchTweets);

module.exports = router;
