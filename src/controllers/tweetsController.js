const asyncHandler = require("express-async-handler");
const Tweet = require("../models/tweetModel");
const moment = require("moment");

// ------------------------------------------------------------------
// @route GET /api/tweets/top-hashtags
// @access Private
const topHashtags = asyncHandler(async (req, res) => {
  const pipeline = [
    {
      $match: {
        created_at: {
          $gte: new Date(moment().subtract(100000, "hours").toISOString()),
          $lte: new Date(moment().subtract(0, "hours").toISOString()),
        },
      },
    },
    {
      $unwind: "$hashtags",
    },
    {
      $group: {
        _id: "$hashtags",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 30 },
  ];

  const hashtags = await Tweet.aggregate(pipeline);

  res.status(200).json({ hashtags: hashtags });
});

// ------------------------------------------------------------------
// @route GET /api/tweets/test/tweets/search
// @access Private
// @query searchString: string
// DEPRECATED!!
const testSearchTweets = asyncHandler(async (req, res) => {
  res.status(200).json({ tweets: [] });
});

// ------------------------------------------------------------------
// @route GET /api/tweets/test/tweets/query
// @access Private
// @query searchString: string
const testQueryTweets = asyncHandler(async (req, res) => {
  const searchString = req.query.searchString;

  const pipeline = [
    {
      $match: {
        $expr: { $in: [searchString, "$hashtags"] },
      },
    },
    { $sort: { "public_metrics.like_count": -1 } },
    { $limit: 100 },
  ];

  const hPipe = [
    {
      $match: {
        created_at: {
          $gte: new Date(moment().subtract(1000, "hours").toISOString()),
          $lte: new Date(moment().subtract(0, "hours").toISOString()),
        },
      },
    },
    {
      $unwind: "$hashtags",
    },
    {
      $group: {
        _id: "$hashtags",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 100 },
  ];

  const data = await Tweet.aggregate(hPipe);

  res.status(200).json({ tweets: data });
});

module.exports = { topHashtags, testSearchTweets, testQueryTweets };
