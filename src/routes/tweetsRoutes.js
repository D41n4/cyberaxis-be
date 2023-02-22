const express = require("express");
const {
  topHashtags,
  testQueryTweets,
  getTweets,
  getSavedTweets,
} = require("../controllers/tweetsController");
const protect = require("../middleware/protect");

const router = express.Router();

router.get("/", protect, getTweets);
router.get("/saved", protect, getSavedTweets);
router.get("/top-hashtags", protect, topHashtags);
router.get("/test/tweets/query", protect, testQueryTweets);

module.exports = router;
