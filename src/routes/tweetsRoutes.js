const express = require("express");
const {
  topHashtags,
  testSearchTweets,
  testQueryTweets,
} = require("../controllers/tweetsController");
const protect = require("../middleware/protect");

const router = express.Router();

router.get("/top-hashtags", protect, topHashtags);
router.get("/test/tweets/search", protect, testSearchTweets);
router.get("/test/tweets/query", protect, testQueryTweets);

module.exports = router;
