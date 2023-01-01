const mongoose = require("mongoose");
const colors = require("colors");

const MONGO_URI = process.env.MONGO_URI;

const mongoClient = async () => {
  try {
    mongoose.set("strictQuery", false);
    const conn = await mongoose.connect(MONGO_URI);
    console.log(colors.cyan(`MongoDB Connected - ${conn.connection.host}`));
  } catch (err) {
    console.log(colors.red(err));
    process.exit(1);
  }
};

module.exports = mongoClient;
