const colors = require("colors");

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  const message = res.statusCode === 500 ? "Server error" : err.message;

  console.log(colors.red(err.message));

  res.status(statusCode).json({
    message,
  });
};

module.exports = errorHandler;
