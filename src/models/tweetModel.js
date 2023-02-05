const mongoose = require("mongoose");

const tweetSchema = new mongoose.Schema(
  {
    searchString: { type: String },
    id: { type: String, required: true, unique: true },
    author_id: { type: String, required: true },
    isTrusted: { type: Boolean, default: false },
    text: { type: String, required: true, unique: true },
    created_at: { type: Date, required: true },
    lang: String,
    public_metrics: {
      retweet_count: Number,
      reply_count: Number,
      like_count: Number,
      quote_count: Number,
    },
    hashtags: [String],
    entities: [String],
    urls: [
      {
        url: String,
        title: String,
        description: String,
        images: [{ url: String, width: Number, height: Number }],
      },
    ],
  },
  { timestamps: true }
);

const Tweet = mongoose.model("Tweet", tweetSchema);

module.exports = Tweet;
