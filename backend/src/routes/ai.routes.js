const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const rateLimiter = require("../middleware/rateLimiter");
const validate = require("../middleware/validate");
const wrap = require("../utils/asyncWrapper");
const { aiBodySchema } = require("../validators/ai.validator");
const ctrl = require("../controllers/ai.controller");

router.use(auth, rateLimiter);

router.post("/summarize", validate(aiBodySchema), wrap(ctrl.summarize));
router.post("/flashcards", validate(aiBodySchema), wrap(ctrl.flashcards));
router.post("/quiz", validate(aiBodySchema), wrap(ctrl.quiz));

module.exports = router;
