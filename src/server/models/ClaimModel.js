import mongoose from "mongoose";

var ClaimSchema = mongoose.Schema({
  walletAddress: {
    type: String,
    required: false,
    unique: true,
  },
  amount: {
    type: Number,
    required: false,
  },
  telegram: {
    type: String,
    require: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Claim = mongoose.model("Claim", ClaimSchema);
export default Claim;
