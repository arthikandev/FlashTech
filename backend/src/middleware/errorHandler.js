const { apiResponse } = require("../utils/apiResponse");

module.exports = (err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json(apiResponse.error(err.message || "Internal server error"));
};
