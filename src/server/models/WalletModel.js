import mongoose from "mongoose";

var WalletSchema = mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true,
    index: true,
    required: true,
  },
  balance: {
    type: Currency,
    min: 0,
    default: 0,
  },
});

WalletSchema.methods.updateBalance = async function (type, amount) {
  let balance = this.balance;
  if (type === DEBIT) {
    if (amount > this.balance) {
      throw new Error(MSG_INSUFFICIENT_BALANCE);
    }
    this.balance = balance - amount;
    await this.save();
  } else if (type === CREDIT) {
    balance = balance + amount;
    this.balance = balance;
    await this.save();
  } else {
    return;
  }
};

const Wallet = mongoose.model("Wallet", WalletSchema);
export default Wallet;
