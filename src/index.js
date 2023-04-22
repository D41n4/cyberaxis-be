require("dotenv").config();
require("./config/mongoClient")();
const colors = require("colors");
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const tweetsRoutes = require("./routes/tweetsRoutes");
const errorHandler = require("./middleware/errorHandler");
require("./util/tweetsQueryService")();
require("./util/nlpManager");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 100 requests per windowMs
});

const origin = process.env.CORS_ORIGIN;

const app = express();

app.use(helmet());
app.use(limiter);
app.use(cors({ origin }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/tweets", tweetsRoutes);

app.get("/health", (req, res) => {
  res.sendStatus(200);
});

app.use(errorHandler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(colors.cyan(`Server running at port ${PORT}`));
});
