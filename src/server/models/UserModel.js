import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const UserSchema = mongoose.Schema({
  player: {
    type: String,
    required: false,
  },
  sessionId: {
    type: String,
    required: false,
  },
  currency: {
    type: String,
    required: false,
  },
  game: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
    lowercase: true,
    validate: {
      validator: function (v) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: "Please enter a valid email",
    },
  },
  password: {
    type: String,
    required: true,
  },
  walletAddress: {
    type: String,
    required: false,
  },
  walletBalance: {
    type: String,
    required: false,
  },
  resetPasswordToken: String,
  resetPasswordExpire: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre(/^(save)/, function () {
  let self = this;
  self.referralLink = `?refId=${self._id}`;
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.getResetPasswordToken = function () {
  //Generate Token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set to resetPassword field
  this.resetPasswordToken = crypto
    .createHmac("sha256", process.env.JWT_SECRET)
    .update(resetToken)
    .digest("hex");

  // set expire
  this.resetPasswordExpire = Date.now() + 60 * 60 * 10000;

  return resetToken;
};

const User = mongoose.model("User", UserSchema);
export default User;
