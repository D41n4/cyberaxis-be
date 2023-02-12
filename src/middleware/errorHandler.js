const colors = require("colors");

const errorHandler = (err, req, res) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  const message = statusCode === 500 ? "Server error" : err.message;

  console.log(colors.red(err));

  res.status(statusCode).json({
    message,
    stack: err.stack,
  });
};

module.exports = errorHandler;
