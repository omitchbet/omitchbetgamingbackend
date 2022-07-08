import mongoose from "mongoose";

var ActionSchema = mongoose.Schema({
  action: {
    type: String,
    required: false,
  },
  amount: {
    type: String,
    required: false,
  },
  action_id: {
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

const Action = mongoose.model("Action", ActionSchema);
export default Action;
