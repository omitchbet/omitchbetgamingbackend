import {
  BAD_REQUEST,
  FORBIDEN,
  NOT_FOUND,
  SERVER_ERROR,
  SUCCESS,
} from "../types/statusCode.js";
import axios from "axios";
import {
  compareSignature,
  generateSignature,
} from "../../utils/jsonWebToken.js";
import { contractInit } from "../../utils/contractInit.js";
import Action from "../models/ActionModel.js";
import User from "../models/UserModel.js";
import { getUserBalance } from "../../utils/helper.js";

// const expectedSignature =
//   "e368dba16378d7e233512666bd0196e1fcc6c08394ab54fbc6a9390d68e878ee";
// const generatedSignature = generateSignature("SECRET", { a: 1 });

export async function demo(req, res, next) {
  try {
    let { casino_id, game, locale, ip, client_type, urls } = req.body;

    let demoLaunchData = {
      casino_id,
      game,
      locale,
      ip,
      client_type,
      urls,
    };

    const generatedSignature = generateSignature(
      "a3gb9zJrzVUwZve2BU5PXDpX",
      demoLaunchData
    );

    const config = {
      headers: {
        "X-REQUEST-SIGN": generatedSignature,
        "Content-Type": "application/json",
      },
    };

    const gameres = await axios.post(
      `https://int.bgaming-system.com/a8r/omitch-int/demo`,
      demoLaunchData,
      {
        config,
      }
    );

    return res.status(SUCCESS).json({ response: gameres.data });
  } catch (error) {
    return res.status(SERVER_ERROR).json({ message: error.message });
  }
}

export async function createSessions(req, res, next) {
  try {
    let {
      casino_id,
      game,
      currency,
      balance,
      locale,
      ip,
      client_type,
      urls,
      user,
    } = req.body;

    balance = Number(balance) * 100;

    const userGamingDetails = {
      casino_id,
      game,
      currency,
      locale,
      ip,
      balance,
      client_type,
      urls,
      user,
    };

    const generatedSignature = generateSignature(
      "a3gb9zJrzVUwZve2BU5PXDpX",
      userGamingDetails
    );

    let reqInstance = axios.create({
      headers: {
        "X-REQUEST-SIGN": generatedSignature,
      },
    });

    const gameres = await reqInstance.post(
      `https://int.bgaming-system.com/a8r/omitch-int/sessions`,
      userGamingDetails
    );

    const connectedUser = await User.findOne({
      walletAddress: user.id.toLowerCase(),
    });

    if (connectedUser.isFirstTime) {
      connectedUser.isFirstTime = false;
      await connectedUser.save();
    }

    return res.status(SUCCESS).json({ response: gameres.data });
  } catch (error) {
    console.log(error);
    return res.status(SERVER_ERROR).json({ message: error.message });
  }
}

export async function getBalance(req, res, next) {
  try {
    const { myContract, web3, provider, walletAddress } = contractInit();

    // let balance = await myContract.methods.bettingBalance(user_id).call();
    // balance = Number(web3.utils.fromWei(balance, "ether"));

    // let balance = await getUserBalance(web3, myContract, user_id);
    // console.log(`Betting balance: ${web3.utils.fromWei(balance, "ether")}`);
    // // const receipt = await myContract.methods.setData(3).send({ from: address });
    // // console.log(`Transaction hash: ${receipt.transactionHash}`);
    // // console.log(`New data value: ${await myContract.methods.data().call()}`);

    // res.status(200).json({ balance });
  } catch (error) {
    return res.status(SERVER_ERROR).json({ message: error.message });
  }
}

export async function play(req, res, next) {
  try {
    const token = req.headers["x-request-sign"];
    if (!token) {
      return res.status(FORBIDEN).json({ message: "User Unauthorized" });
    }
    const signature = generateSignature("a3gb9zJrzVUwZve2BU5PXDpX", req.body);

    if (token !== signature) {
      return res
        .status(FORBIDEN)
        .json({ message: "signature unmatched error " });
    }

    let transactions = [];

    const { user_id, currency, game, game_id, finished, actions } = req.body;

    const gamer = await User.findOne({
      walletAddress: user_id.toLowerCase(),
    });

    if (!gamer) return res.status(BAD_REQUEST).json({ message: "Not found" });

    if (actions.length !== 0) {
      for (let i = 0; i < actions.length; i++) {
        const isProcessed = await Action.findOne({
          action_id: actions[i].action_id,
        });

        if (isProcessed) {
          transactions.push({
            action_id: isProcessed.action_id,
            tx_id: isProcessed._id,
            processed_at: isProcessed.createdAt,
          });
        } else {
          if (actions[i].action === "bet") {
            let subAmount = actions[i].amount / 100;

            if (subAmount > gamer.balance) {
              return res.status(412);
            }

            gamer.balance -= subAmount;
            await gamer.save();

            const action = await Action.create({
              action: actions[i].action,
              action_id: actions[i].action_id,
              amount: subAmount,
              jackpot_contribution: actions[i].jackpot_contribution,
            });

            transactions.push({
              action_id: action.action_id,
              tx_id: action._id,
              processed_at: action.createdAt,
            });
          }

          if (actions[i].action === "win") {
            let subAmount = actions[i].amount / 100;
            gamer.balance += subAmount;
            await gamer.save();

            const action = await Action.create({
              action: actions[i].action,
              action_id: actions[i].action_id,
              amount: subAmount,
              jackpot_contribution: actions[i].jackpot_contribution,
            });

            transactions.push({
              action_id: action.action_id,
              tx_id: action._id,
              processed_at: action.createdAt,
            });
          }
        }
      }
    }

    let balance = Number(gamer.balance) * 100;

    return res.status(200).json({ balance, game_id, transactions });
  } catch (error) {
    return res.status(SERVER_ERROR).json({ message: error.message });
  }
}

//rollback
export async function rollback(req, res, next) {
  try {
    const token = req.headers["x-request-sign"];
    if (!token) {
      return res.status(FORBIDEN).json({ message: "User Unauthorized" });
    }
    const signature = generateSignature("a3gb9zJrzVUwZve2BU5PXDpX", req.body);

    if (token !== signature) {
      return res
        .status(FORBIDEN)
        .json({ message: "signature unmatched error " });
    }

    let transactions = [];

    const { user_id, currency, game, game_id, finished, actions } = req.body;

    const gamer = await User.findOne({
      walletAddress: user_id.toLowerCase(),
    });

    if (!gamer) return res.status(BAD_REQUEST).json({ message: "Not found" });

    if (actions.length !== 0) {
      for (let i = 0; i < actions.length; i++) {
        const isProcessed = await Action.findOne({
          action_id: actions[i].action_id,
        });

        if (isProcessed) {
          transactions.push({
            action_id: isProcessed.action_id,
            tx_id: isProcessed._id,
            processed_at: isProcessed.createdAt,
          });
        } else {
          const originalAction = await Action.findOne({
            action_id: actions[i].original_action_id,
          });

          if (originalAction.action === "bet") {
            gamer.balance += originalAction.amount;
            await gamer.save();

            const action = await Action.create({
              action: actions[i].action,
              action_id: actions[i].action_id,
              amount: originalAction.amount,
            });

            transactions.push({
              action_id: action.action_id,
              tx_id: "",
              processed_at: action.createdAt,
            });
          }

          if (originalAction.action === "win") {
            gamer.balance -= originalAction.amount;
            await gamer.save();

            const action = await Action.create({
              action: actions[i].action,
              action_id: actions[i].action_id,
              amount: originalAction.amount,
            });

            transactions.push({
              action_id: action.action_id,
              tx_id: "",
              processed_at: action.createdAt,
            });
          }
        }
      }
    }

    let balance = Number(gamer.balance) * 100;

    return res.status(200).json({ balance, game_id, transactions });
  } catch (error) {
    return res.status(SERVER_ERROR).json({ message: error.message });
  }
}
