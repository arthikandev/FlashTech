const rateLimit = require("express-rate-limit");
const { apiResponse } = require("../utils/apiResponse");

module.exports = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: apiResponse.error("Too many AI requests, please wait 15 minutes."),
});
