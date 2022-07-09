import {
  BAD_REQUEST,
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

    res.status(SUCCESS).json({ response: gameres.data });
  } catch (error) {
    return res.status(SERVER_ERROR).json({ message: error.message });
  }
}

export async function createSessions(req, res, next) {
  try {
    console.log("123");
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

    const config = {
      headers: {
        "X-REQUEST-SIGN": generatedSignature,
        "Content-Type": "application/json",
      },
    };

    const gameres = await axios.post(
      `https://int.bgaming-system.com/a8r/omitch-int/sessions`,
      userGamingDetails,
      {
        config,
      }
    );

    res.status(SUCCESS).json({ response: gameres.data });
  } catch (error) {
    return res.status(SERVER_ERROR).json({ message: error.message });
  }
}

export async function getBalance(req, res, next) {
  try {
    const { myContract, web3, provider, walletAddress } = contractInit();

    // const balance = await myContract.methods
    //   .bettingBalance("0x2049B28B9D7e74348cC8800B9a34F6ce9911E622")
    //   .call();
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
    compareSignature(req, next);

    let transactions = [];

    const { user_id, currency, game, game_id, finished, actions } = req.body;

    const { myContract, web3, provider, walletAddress } = contractInit();

    // let balance = await myContract.methods.bettingBalance(user_id).call();
    // balance = Number(web3.utils.fromWei(balance, "ether"));

    let balance = await getUserBalance(web3, myContract, user_id);

    // const receipt = await myContract.methods.setData(3).send({ from: address });
    // console.log(`Transaction hash: ${receipt.transactionHash}`);
    // console.log(`New data value: ${await myContract.methods.data().call()}`);
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
            console.log(actions[i].amount, balance);
            if (actions[i].amount > balance) {
              return res
                .status(412)
                .json({ message: "Not enough balance to process bet" });
            }

            const amount = web3.utils.toWei(actions[i].amount.toString());

            const receipt = await myContract.methods
              .bet(amount, user_id)
              .send({ from: walletAddress.address });

            balance = await getUserBalance(web3, myContract, user_id);

            const action = await Action.create({
              action_id: actions[i].action_id,
              amount: actions[i].amount,
              jackpot_contribution: actions[i].jackpot_contribution,
            });

            transactions.push({
              action_id: action.action_id,
              tx_id: action._id,
              processed_at: action.createdAt,
            });
          }

          if (actions[i].action === "win") {
            const amount = web3.utils.toWei(actions[i].amount.toString());

            const receipt = await myContract.methods
              .updateWinning(amount, user_id)
              .send({ from: walletAddress.address });

            balance = await getUserBalance(web3, myContract, user_id);

            const action = await Action.create({
              action_id: actions[i].action_id,
              amount: actions[i].amount,
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

    res.status(200).json({ balance, transactions });
  } catch (error) {
    return res.status(SERVER_ERROR).json({ message: error.message });
  }
}
