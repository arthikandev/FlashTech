const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const validate = require("../middleware/validate");
const wrap = require("../utils/asyncWrapper");
const { registerSchema, loginSchema } = require("../validators/auth.validator");
const ctrl = require("../controllers/auth.controller");

router.post("/register", validate(registerSchema), wrap(ctrl.register));
router.post("/login", validate(loginSchema), wrap(ctrl.login));
router.get("/me", auth, wrap(ctrl.me));

module.exports = router;
