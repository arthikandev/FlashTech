const env = require("./config/env");
const app = require("./app");

app.listen(env.PORT, () => {
  console.log(`StudyMate backend listening on :${env.PORT}`);
});
