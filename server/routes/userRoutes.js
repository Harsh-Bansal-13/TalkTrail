const router = require("express").Router();
const {
  registerUser,
  authUser,
  allUsers,
} = require("../controllers.js/userControllers");
const { protect } = require("../middleware/authMiddleware");
// const { UserModel } = require("../models/UserModel");
// const Token = require("../models/token");
// const crypto = require("crypto");
// const cookieParser = require("cookie-parser");
// const sendEmail = require("../utils/sendEmail");
// const bcrypt = require("bcrypt");
// const Joi = require("joi");
// const jwt = require("jsonwebtoken");
// router.use(cookieParser());
router.route("/users").get(protect, allUsers);
router.route("/register").post(registerUser);
router.route("/login").post(authUser);
// router.post("/", async (req, res) => {
//   try {
//     const { error } = validate(req.body);
//     if (error) return res.json(error.details[0].message);
//     const { email, password, isSeller } = req.body;
//     const user = await UserModel.findOne({ email: email });
//     if (!user) {
//       return res.json("Invalid Email or Password");
//     }
//     const response = await bcrypt.compare(password, user.password);
//     if (response) {
//       if (!user.verified) {
//         let token = await Token.findOne({ userId: user._id });
//         if (!token) {
//           token = await new Token({
//             userId: user._id,
//             token: crypto.randomBytes(32).toString("hex"),
//           }).save();
//           const url = `https://fruits-wala.vercel.app/register/${user.id}/verify/${token.token}`;
//           // const url = `http://localhost:3000/register/${user.id}/verify/${token.token}`;
//           sendEmail(user.email, "Verify Email", url);
//         }
//         const url = `https://fruits-wala.vercel.app/register/${user.id}/verify/${token.token}`;
//         // const url = `http://localhost:3000/register/${user.id}/verify/${token.token}`;
//         sendEmail(user.email, "Verify Email", url);
//         return res.status(200).json("An Email Send Successfully");
//       }
//       const token = user.generateAuthToken();
//       res.cookie("fwa_auth_token", token, {
//         expires: new Date(Date.now() + 25892000000),
//         secure: true,
//         httpOnly: true,
//         sameSite: "none",
//       });
//       return res.json("Success");
//     } else {
//       return res.json("Password is incorrect");
//     }
//   } catch (error) {
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });
// const validate = (data) => {
//   const schema = Joi.object({
//     email: Joi.string().email().required().label("Email"),
//     password: Joi.string().required().label("Password"),
//   });
//   return schema.validate(data);
// };

module.exports = router;
