require("dotenv").config();
require("./config/mongoClient")();
const colors = require("colors");
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const { errorHandler } = require("./middleware/error");

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/api/auth", authRoutes);

app.get("/health", (req, res) => {
  res.send("OK");
});

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(colors.cyan(`Server running at port ${PORT}`));
});
