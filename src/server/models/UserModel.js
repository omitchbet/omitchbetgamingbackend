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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", UserSchema);
export default User;
