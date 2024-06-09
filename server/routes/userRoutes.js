const router = require("express").Router();
const {
  registerUser,
  authUser,
  allUsers,
} = require("../controllers.js/userControllers");
const { protect } = require("../middleware/authMiddleware");

router.route("/users").get(protect, allUsers);
router.route("/register").post(registerUser);
router.route("/login").post(authUser);

module.exports = router;
