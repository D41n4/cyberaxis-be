const { TwitterApi } = require("twitter-api-v2");

const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);

module.exports = client;
