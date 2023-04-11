const twitterClient = require("../config/twitterClient");
const moment = require("moment");
const { filter, uniq } = require("lodash");
const cron = require("node-cron");
const Tweet = require("../models/tweetModel");
const { trustedAccounts } = require("../config/constants");
const colors = require("colors");
const { nlpManager } = require("./nlpManager");

const trustedIds = trustedAccounts.map((el) => el.id);

const allowedDomains = [
  "30", //Entities [Entity Service]
  "131", //Unified Twitter Taxonomy
  "165", //Technology
  "171", //Local News
  "175", //Emergency Events
];

const allowedEntities = [
  "898650876658634752", //Cybersecurity
  "847543836330958848", //Global security & terrorism
  "848920371311001600", //Technology
  "1047123725525479425", //Information security
  "1088443224425807872", //Information Privacy Worldwide
  "1557697333571112960", //Technology business
];

const excludedHashtags = [
  "jobs",
  "ProjectMgmt",
  "UKJobs",
  "creative",
  "training",
  "LGBTQ",
  "LGBT",
];

const searchStrings = [
  "cyber breach",
  "cyber attack",
  "data leak",
  "ransomware ",
  "hackers",
];

const filterTweets = (tweet) => {
  let domainPass = false;
  let entityPass = false;
  let hashTagPass = true;
  let rtPass = false;

  if (tweet.context_annotations) {
    for (const el of tweet.context_annotations) {
      if (allowedEntities.some((k) => k === el.entity.id)) {
        entityPass = true;
        break;
      }
    }
    for (const el of tweet.context_annotations) {
      if (allowedDomains.some((k) => k === el.domain.id)) {
        domainPass = true;
        break;
      }
    }
  }

  if (tweet.entities?.hashtags) {
    for (const hashtag of tweet.entities.hashtags) {
      if (excludedHashtags.some((el) => hashtag.tag === el)) {
        hashTagPass = false;
        break;
      }
    }
  } else {
    hashTagPass = false;
  }

  if (!tweet.text.startsWith("RT ")) {
    rtPass = true;
  }

  return domainPass && entityPass && hashTagPass && rtPass;
};

const parseToDoc = (el) => {
  return {
    id: el.id,
    author_id: el.author_id,
    created_at: el.created_at,
    isTrusted: trustedIds.some((id) => id === el.author_id),
    text: el.text,
    lang: el.lang,
    public_metrics: el.public_metrics,
    hashtags: el.entities.hashtags.map((h) => h.tag.toLowerCase()),
    urls:
      el.entities?.urls?.map((u) => {
        return {
          description: u.description,
          images: u.images,
          title: u.title,
          url: u.unwound_url,
        };
      }) || [],
  };
};

const getUserFollowers = async (id) => {
  const metrics = await twitterClient.v2
    .get(`users/${id}`, {
      "user.fields": "public_metrics",
    })
    .catch((err) => console.log("ERR:", err));

  return metrics.data.public_metrics.followers_count;
};

const getTweetsByUserId = async (id) => {
  const tweets = await twitterClient.v2.get(`users/${id}/tweets`, {
    max_results: 100,
    "tweet.fields":
      "author_id,created_at,entities,lang,public_metrics,context_annotations",
  });

  const filtered = filter(tweets.data, filterTweets);
  const parsed = filtered.map(parseToDoc);

  return parsed;
};

const getTweetsRecent = async (searchString) => {
  const data = await twitterClient.v2.get("tweets/search/recent", {
    query: `${searchString} lang:en`,
    max_results: 100,
    "tweet.fields":
      "author_id,created_at,entities,lang,public_metrics,context_annotations",
  });

  console.log(data);

  const filtered = filter(data.data, filterTweets);
  const parsed = filtered.map(parseToDoc);

  return parsed;
};

const tweetsQueryService = () => {
  cron.schedule("0 0 */2 * * *", async () => {
    // cron.schedule("*/5 * * * * *", async () => {
    for await (const id of trustedIds) {
      const tweets = await getTweetsByUserId(id).catch((err) =>
        console.log(err)
      );

      for await (const tweet of tweets) {
        const entities = await nlpManager(tweet.text);
        const entityList = uniq(entities.map((el) => el.entity));

        Tweet.create({ ...tweet, entityList }).catch((err) => {
          // check if duplicate and update
          if (err.code === 11000) {
            Tweet.findOneAndUpdate({ id: tweet.id }, tweet).catch((err) =>
              console.log(colors.red(`ERR - update: ${err.message}`))
            );
          }
        });
      }
    }
  });

  cron.schedule("0 0 */2 * * *", async () => {
    // cron.schedule("*/10 * * * * *", async () => {
    for await (const searchString of searchStrings) {
      const tweets = await getTweetsRecent(searchString).catch((err) =>
        console.log(err)
      );

      for await (const tweet of tweets) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        const followers = await getUserFollowers(tweet.author_id);

        // console.log(followers, followers > 10000);

        if (followers > 100000) {
          const entities = await nlpManager(tweet.text);
          const entityList = uniq(entities.map((el) => el.entity));

          Tweet.create({ ...tweet, entityList }).catch((err) => {
            // check if duplicate and update
            if (err.code === 11000) {
              Tweet.findOneAndUpdate({ id: tweet.id }, tweet).catch((err) =>
                console.log(colors.red(`ERR - update: ${err.message}`))
              );
            }
          });
        }
      }
    }
  });
};

module.exports = tweetsQueryService;
