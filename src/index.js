require("dotenv").config();
require("./config/mongoClient")();
const colors = require("colors");
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const tweetsRoutes = require("./routes/tweetsRoutes");
const { errorHandler } = require("./middleware/error");
require("./util/tweetSearcher").runTweetSearcher();

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tweets", tweetsRoutes);

app.get("/health", (req, res) => {
  res.sendStatus(200);
});

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(colors.cyan(`Server running at port ${PORT}`));
});
