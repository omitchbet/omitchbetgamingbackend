import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const UserSchema = mongoose.Schema({
  player: {
    type: String,
    required: false,
  },
  balance: {
    type: Number,
    required: false,
  },
  walletAddress: {
    type: String,
    required: false,
    unique: true,
  },
  firstName: {
    type: String,
    required: false,
  },
  lastname: {
    type: String,
    required: false,
  },
  avatarurl: {
    type: String,
    required: false,
  },
  nickname: {
    type: String,
    required: false,
  },
  city: {
    type: String,
    required: false,
  },
  country: {
    type: String,
    required: false,
  },
  dateOfBirth: {
    type: String,
    required: false,
  },
  gender: {
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
  telegram: {
    type: String,
    require: false,
  },
  twitter: {
    type: String,
    require: false,
  },
  isFirstTime: {
    type: Boolean,
    default: true,
  },
  referralCount: {
    type: Number,
    default: 0,
    required: false,
  },
  referralUser: {
    type: String,
    require: false,
  },
  referralLink: {
    type: String,
    required: false,
  },
  referralBonus: {
    type: Number,
    default: 0,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre(/^(save)/, function () {
  let self = this;
  self.referralLink = `?refId=${self.walletAddress}`;
});

const User = mongoose.model("User", UserSchema);
export default User;
