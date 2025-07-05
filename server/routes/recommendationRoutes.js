const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const {
  recommendMessage,
  generateSummary,
} = require("../controllers.js/recommendControllers");

router.route("/:chatId").post(recommendMessage);
router.route("/summary/:chatId").get(generateSummary);

module.exports = router;
