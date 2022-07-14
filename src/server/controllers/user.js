import { contractInit } from "../../utils/contractInit.js";
import User from "../models/UserModel.js";
import { BAD_REQUEST, SERVER_ERROR, SUCCESS } from "../types/statusCode.js";

export async function createUser(req, res, next) {
  try {
    let { walletAddress, balance, ...rest } = req.body;

    walletAddress = walletAddress.toLowerCase();

    if (!walletAddress || !balance) {
      return res.status(BAD_REQUEST).json({
        message: "Please provide all field values",
      });
    }

    const walletAddressExist = await User.findOne({ walletAddress });

    if (walletAddressExist) {
      return res.status(BAD_REQUEST).json({ message: "wallet address exist" });
    }

    // Create user
    const user = await User.create({
      walletAddress,
      balance,
      ...rest,
    });

    return res.status(SUCCESS).json({
      message: "Created",
      user,
    });
  } catch (error) {
    return res.status(SERVER_ERROR).json({ message: error.message });
  }
}
export async function getUser(req, res, next) {
  try {
    let { id } = req.params;

    const user = await User.findOne({ walletAddress: id.toLowerCase() });

    if (!user) {
      return res.status(BAD_REQUEST).json({ message: "wallet address exist" });
    }

    return res.status(SUCCESS).json({
      message: "Created",
      user,
    });
  } catch (error) {
    return res.status(SERVER_ERROR).json({ message: error.message });
  }
}

export async function updateUser(req, res, next) {
  try {
    let { walletAddress, amount } = req.body;

    if (!walletAddress || !amount) {
      return res.status(BAD_REQUEST).json({
        message: "Please provide all field values",
      });
    }

    const user = await User.findOne({
      walletAddress: walletAddress.toLowerCase(),
    });

    if (!user) {
      return res.status(BAD_REQUEST).json({ message: "No user" });
    }

    user.balance += Number(amount);
    await user.save();

    // Create user
    return res.status(SUCCESS).json({
      message: "Updated",
      user,
    });
  } catch (error) {
    return res.status(SERVER_ERROR).json({ message: error.message });
  }
}

export async function withdraw(req, res, next) {
  try {
    let { walletAddress, amount } = req.body;

    let intAmount = amount;

    if (!walletAddress || !amount) {
      return res.status(BAD_REQUEST).json({
        message: "Please provide all field values",
      });
    }

    const user = await User.findOne({
      walletAddress: walletAddress.toLowerCase(),
    });

    if (!user) {
      return res.status(BAD_REQUEST).json({ message: "No user" });
    }

    if (user.balance < Number(amount)) {
      return res.status(BAD_REQUEST).json({ message: "Not enough amount" });
    }

    const { myContract, web3, provider, address } = contractInit();

    amount = web3.utils.toWei(amount.toString());

    const receipt = await myContract.methods
      .withdraw(amount, walletAddress)
      .send({ from: address.address });

    if (receipt.status === false) {
      return res
        .status(BAD_REQUEST)
        .json({ message: "Transaction unsuccessful" });
    }

    if (receipt.status === true) {
      user.balance -= Number(intAmount);
      await user.save();
    }

    // Create user
    return res.status(SUCCESS).json({
      message: "Updated",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(SERVER_ERROR).json({ message: error.message });
  }
}
