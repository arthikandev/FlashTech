const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const validate = require("../middleware/validate");
const wrap = require("../utils/asyncWrapper");
const { createNoteSchema, updateNoteSchema } = require("../validators/notes.validator");
const ctrl = require("../controllers/notes.controller");

router.use(auth);

router.get("/", wrap(ctrl.list));
router.post("/", validate(createNoteSchema), wrap(ctrl.create));
router.get("/:id", wrap(ctrl.get));
router.put("/:id", validate(updateNoteSchema), wrap(ctrl.update));
router.delete("/:id", wrap(ctrl.remove));

module.exports = router;
