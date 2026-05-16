const { apiResponse } = require("../utils/apiResponse");

module.exports = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const first = result.error.issues[0];
    const msg = `${first.path.join(".") || "body"}: ${first.message}`;
    return res.status(400).json(apiResponse.error(msg));
  }
  req.body = result.data;
  next();
};
