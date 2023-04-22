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
      // TODO filter out hashtags with the provided timeframe using query params
      $match: {
        created_at: {
          $gte: new Date(moment().subtract(1000000, "days").toISOString()),
          $lte: new Date(moment().subtract(0, "days").toISOString()),
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
    {
      $project: {
        hashtag: "$_id",
        count: 1,
        _id: 0,
      },
    },
  ];

  const hashtags = await Tweet.aggregate(pipeline);

  res.status(200).json({ data: hashtags });
});

// ------------------------------------------------------------------
// @route GET /api/tweets
// @access Private
const getTweets = asyncHandler(async (req, res) => {
  const query = req.query;

  const dbQuery = {
    hashtags: { $all: query.selectedHashtags },
    entityList: { $all: query.selectedEntities },
    created_at: {
      $gte: moment().subtract(query.dateFilter, "days").toISOString(),
    },
    text: {
      $regex: query.searchString,
      $options: "i",
    },
  };

  if (query.sourceFilter === "1") {
    dbQuery.isTrusted = true;
  } else if (query.sourceFilter === "2") {
    dbQuery.isTrusted = false;
  }

  if (!query.selectedHashtags) delete dbQuery.hashtags;
  if (!query.selectedEntities) delete dbQuery.entityList;
  if (query.dateFilter === "0") delete dbQuery.created_at; //if dateFilter is 0, then we want to get all tweets

  const tweets = await Tweet.find(dbQuery)
    .lean()
    .limit(200)
    .sort({ created_at: -1 });

  const userId = req.userId;

  const user = await User.findById(userId);

  const favouriteTweets = user.favouriteTweets;

  const tweetsWithFavourite = tweets.map((el) => {
    const isFavourite = favouriteTweets.includes(el._id);

    // check if tweet auhor id matches one of the users trusted accounts
    const isUsersTrusted = user.trustedAccounts.some(
      (account) => account.id === el.author_id
    );

    return { ...el, isFavourite, isTrusted: el.isTrusted || isUsersTrusted };
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

// ------------------------------------------------------------------
// @route GET /api/tweets/test/tweets/query
// @access Private
// @query searchString: string
// deprecated,used for testing
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
