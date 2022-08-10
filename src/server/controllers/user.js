import { contractInit } from "../../utils/contractInit.js";
import Claim from "../models/ClaimModel.js";
import User from "../models/UserModel.js";
import { BAD_REQUEST, SERVER_ERROR, SUCCESS } from "../types/statusCode.js";

export async function createUser(req, res, next) {
  try {
    let { walletAddress, ...rest } = req.body;

    walletAddress = walletAddress.toLowerCase();

    if (!walletAddress) {
      return res.status(BAD_REQUEST).json({
        message: "Please provide all field values",
      });
    }

    const connectedUser = await User.findOne({ walletAddress });

    if (connectedUser) {
      return res.status(SUCCESS).json({
        message: "Created",
        user: connectedUser,
      });
    }

    // Create user
    const user = await User.create({
      walletAddress,
      balance: 0,
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
    return res.status(SERVER_ERROR).json({ message: error.message });
  }
}

export async function createRefUser(req, res, next) {
  try {
    const query = req.query;
    const { refId } = query;

    let { walletAddress, telegram, ...rest } = req.body;

    if (!walletAddress || !telegram) {
      return res.status(BAD_REQUEST).json({
        message: "Please provide all field values",
      });
    }

    walletAddress = walletAddress.toLowerCase();

    const gamer = await User.findOne({
      walletAddress,
    });

    if (gamer) {
      return res.status(SUCCESS).json({
        message: "Created",
        user: gamer,
      });
    }

    const refUser = await User.findOne({
      walletAddress: refId.toLowerCase(),
    });

    // Create user
    const user = await User.create({
      walletAddress,
      telegram,
      referralUser: refUser ? refUser._id : "",
      balance: 0,
      ...rest,
    });

    if (refUser) {
      refUser.referralCount += 1;
      refUser.referralBonus += 0.2;
      await refUser.save();
    }

    return res.status(SUCCESS).json({
      message: "Created",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(SERVER_ERROR).json({ message: error.message });
  }
}

// export async function claimIncentive(req, res, next) {
//   try {
//     let { walletAddress, amount, telegram, ...rest } = req.body;

//     if (!walletAddress || !telegram) {
//       return res.status(BAD_REQUEST).json({
//         message: "Please provide all field values",
//       });
//     }

//     walletAddress = walletAddress.toLowerCase();

//     const gamer = await User.findOne({
//       walletAddress,
//     });

//     if (gamer.referralBonus > 0) {
//       gamer.referralBonus = 0;
//       await gamer.save();

//       // Create claim
//       const claim = await Claim.create({
//         walletAddress,
//         amount,
//         telegram,
//         ...rest,
//       });

//       return res.status(SUCCESS).json({
//         message:
//           "Claim Receive, BUSD with be deposited to wallet after confirmation",
//         claim,
//       });
//     }

//     return res.status(BAD_REQUEST).json({
//       message: "Cannot claim 0 BUSD",
//     });
//   } catch (error) {
//     return res.status(SERVER_ERROR).json({ message: error.message });
//   }
// }
