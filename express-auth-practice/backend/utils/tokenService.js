const jwt = require("jsonwebtoken");

const generateToken = (data) => {
  return jwt.sign(data, "secret-key", {
    expiresIn: "1d",
  });
};

module.exports = { generateToken };
