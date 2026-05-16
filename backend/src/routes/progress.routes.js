const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const wrap = require("../utils/asyncWrapper");
const ctrl = require("../controllers/progress.controller");

router.use(auth);
router.post("/save", wrap(ctrl.save));
router.get("/", wrap(ctrl.list));

module.exports = router;
