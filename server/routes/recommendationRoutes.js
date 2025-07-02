const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { recommendMessage } = require("../controllers.js/recommendControllers");

router.route("/:chatId").post(recommendMessage);

module.exports = router;
