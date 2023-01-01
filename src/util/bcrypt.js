const bcrypt = require("bcryptjs");

const generate = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  return hash;
};

const compare = async (str1, str2) => {
  return bcrypt.compare(str1, str2);
};

module.exports = { generate, compare };
