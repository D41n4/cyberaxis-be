const asyncHandler = require("express-async-handler");
const Tweet = require("../models/tweetModel");
const moment = require("moment");
const User = require("../models/userModel");

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

  res.status(200).json({ data: hashtags });
});

// ------------------------------------------------------------------
// @route GET /api/tweets
// @access Private
const getTweets = asyncHandler(async (req, res) => {
  const tweets = await Tweet.find({})
    .lean()
    .limit(200)
    .sort({ created_at: -1 });

  const userId = req.userId;

  const user = await User.findById(userId);

  const favouriteTweets = user.favouriteTweets;

  const tweetsWithFavourite = tweets.map((el) => {
    const isFavourite = favouriteTweets.includes(el._id);

    return { ...el, isFavourite };
  });

  res.status(200).json({ data: tweetsWithFavourite });
});

// ------------------------------------------------------------------
// @route GET /api/tweets/saved
// @access Private
const getSavedTweets = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const user = await User.findById(userId).lean().populate("favouriteTweets");

  const tweets = user.favouriteTweets.map((el) => {
    return { ...el, isFavourite: true };
  });

  res.status(200).json({ data: tweets });
});

// TODO
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

module.exports = { topHashtags, getTweets, testQueryTweets, getSavedTweets };
