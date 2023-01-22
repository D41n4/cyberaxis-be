const asyncHandler = require("express-async-handler");
const Tweet = require("../models/tweetModel");
const { tweetSearcher } = require("../util/tweetSearcher");
const colors = require("colors");
const moment = require("moment");
const cron = require("node-cron");

// ------------------------------------------------------------------
// @route GET /api/tweets/test/tweets/search
// @access Private
// @query searchString: string
const testSearchTweets = asyncHandler(async (req, res) => {
  const searchString = req.query.searchString;

  const tweets = await tweetSearcher(searchString);

  for await (const tweet of tweets) {
    await Tweet.create({ ...tweet, searchString }).catch(() =>
      console.log(colors.yellow(`Tweet exists: ${tweet.id} (${searchString})`))
    );
  }

  res.status(200).json({ tweets: tweets });
});

module.exports = { testSearchTweets };
