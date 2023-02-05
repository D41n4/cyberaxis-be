const twitterClient = require("../config/twitterClient");
const moment = require("moment");
const { filter, uniq } = require("lodash");
const cron = require("node-cron");
const Tweet = require("../models/tweetModel");
const colors = require("colors");

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
]; // TODO use regxp

const filterFn = (tweet) => {
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

const parseFn = (el) => {
  const trustedIds = [
    "2778002300", //CPO Magazine
    "209811713", //The Hacker News
    "3819701", //ZDNET
    "29415843", //Infosecurity Magazine
    "621583", //BBCTech
    "5402612", //BBC Breaking News
    "22873424", //CIO Online
    "24682806", //CSO Online
    "18066440", //CISA Cyber
    "41258937", //Security Week
    "4210241608", //NCSC UK
    "713973", //IT Pro
  ];

  const allEntities = el.context_annotations.map((ca) => ca.entity.id);

  const filteredEntities = filter(allEntities, (en) =>
    allowedEntities.includes(en)
  );

  return {
    id: el.id,
    author_id: el.author_id,
    created_at: el.created_at,
    isTrusted: trustedIds.some((id) => id === el.author_id),
    text: el.text,
    lang: el.lang,
    public_metrics: el.public_metrics,
    hashtags: el.entities.hashtags.map((h) => h.tag.toLowerCase()),
    entities: uniq(filteredEntities),
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

const tweetSearcher = async (searchString) => {
  const data = await twitterClient.v2.get("tweets/search/recent", {
    query: searchString,
    max_results: 100,
    "tweet.fields":
      "author_id,created_at,entities,lang,public_metrics,context_annotations",
    end_time: moment().subtract(12, "hours").toISOString(),
  });

  const filtered = filter(data.data, filterFn);
  const parsed = filtered.map(parseFn);

  return parsed;
};

const runTweetSearcher = () => {
  console.log("HIT");
  const searchStrings = [
    "cyber breach",
    "cyber attack",
    "data leak",
    "ransomware ",
  ];

  cron.schedule("0 0 */1 * * *", async () => {
    // cron.schedule("*/5 * * * * *", async () => {
    console.log("---------------------------------------");
    console.log(moment().format("YYYY-MM-DD HH:mm:ss"));
    for await (const searchString of searchStrings) {
      const tweets = await tweetSearcher(searchString).catch((err) =>
        console.log(err)
      );

      console.log("searchString", searchString);

      tweets.forEach((el) => {
        Tweet.create({ ...el, searchString }).catch(() => {});
      });
    }
  });
};

module.exports = { tweetSearcher, runTweetSearcher };
