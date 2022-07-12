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
    console.log(user);

    return res.status(SUCCESS).json({
      message: "Created",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(SERVER_ERROR).json({ message: error.message });
  }
}
export async function getUser(req, res, next) {
  try {
    let { id } = req.params;

    const user = await User.findOne({ walletAddress: id });

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
    let { walletAddress, balance, ...rest } = req.body;

    if (!walletAddress || !balance) {
      return res.status(BAD_REQUEST).json({
        message: "Please provide all field values",
      });
    }

    const updatedUser = await User.findOneAndUpdate(
      { walletAddress },
      {
        $set: {
          balance,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(BAD_REQUEST).json({ message: "No user" });
    }

    // Create user

    return res.status(SUCCESS).json({
      message: "Created",
      updatedUser,
    });
  } catch (error) {
    return res.status(SERVER_ERROR).json({ message: error.message });
  }
}
