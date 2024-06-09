const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const passwordComplexity = require("joi-password-complexity");
const Joi = require("joi");

const userSchema = new mongoose.Schema(
  {
    name: { type: "String", required: true },
    email: { type: "String", unique: true, required: true },
    password: { type: "String", required: true },
    pic: {
      type: "String",
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestaps: true }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const validate = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().label("username"),
    email: Joi.string().email().required().label("email"),
    password: passwordComplexity().required().label("password"),
    pic: Joi.string().optional().label("pic"), // Make isSeller optional
    isAdmin: Joi.boolean().optional().label("isAdmin"), // Make isSeller optional
  });
  return schema.validate(data);
};
const User = mongoose.model("User", userSchema);

module.exports = { User, validate };
