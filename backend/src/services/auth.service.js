const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const hashPassword = (plain) => bcrypt.hash(plain, 10);
const comparePassword = (plain, hash) => bcrypt.compare(plain, hash);

const signToken = ({ id, email }) =>
  jwt.sign({ id, email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

module.exports = { hashPassword, comparePassword, signToken };
