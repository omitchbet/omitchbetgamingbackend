import mongoose from "mongoose";

var EvenbetActionSchema = mongoose.Schema({
  method: {
    type: String,
    required: false,
  },
  walletAddress: {
    type: String,
    required: false,
  },
  amount: {
    type: Number,
    required: false,
  },
  balance: {
    type: Number,
    required: false,
  },
  transactionId: {
    type: String,
    required: false,
  },
  referenceTransactionId: {
    type: String,
    required: false,
  },
  jackpot_contribution: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const EvenbetAction = mongoose.model("EvenbetAction", EvenbetActionSchema);
export default EvenbetAction;
