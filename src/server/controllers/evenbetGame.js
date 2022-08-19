import User from "../models/UserModel.js";
import {
  BAD_REQUEST,
  NOT_FOUND,
  SERVER_ERROR,
  SUCCESS,
} from "../types/statusCode.js";
import axios from "axios";
import { generateEvenbetSig } from "../../utils/evenbetSig.js";
import { generateSignature } from "../../utils/jsonWebToken.js";
import EvenbetAction from "../models/EvenbetActionModel.js";
// import { randomUUID } from "crypto";

export async function getGameList(req, res, next) {
  const params = {
    clientId: "bet-qXrTaMQY",
    deviceType: "desktop",
    authType: "internal",
  };

  const signature = generateEvenbetSig(params);

  let reqInstance = axios.create({
    headers: {
      sign: signature,
    },
  });

  try {
    const gameres = await reqInstance.get(
      `https://omitch.pokerserversoftware.com/api/web/v2/casino/games?clientId=bet-qXrTaMQY&deviceType=desktop&authType=internal`
    );
    console.log(gameres.data);
    res.status(200).json({ data: gameres.data });
  } catch (error) {
    // console.log(error);
    // return res.status(SERVER_ERROR).json({ message: error.message });
  }
}

export async function openLobby(req, res, next) {
  // const params = {
  //   clientId: "bet-qXrTaMQY",
  //   authType: "external",
  //   userId: "0xE151dE25279b1826eA0d120faC7e665540829Bd3",
  //   nickName: "plankos",
  //   lang: "en",
  //   currency: "USD",
  // };

  console.log(req.body);

  let { authType, userId, nick, lang, currency } = req.body;

  const userGamingDetails = {
    authType,
    userId,
    nick,
    lang,
    currency,
  };

  const signature = generateEvenbetSig(userGamingDetails);

  console.log(signature);

  let reqInstance = axios.create({
    headers: {
      sign: signature,
    },
  });

  const clientId = "bet-qXrTaMQY";

  try {
    const gameres = await reqInstance.post(
      `https://omitch.pokerserversoftware.com/api/web/v2/app/users/${req.body.userId}/session?clientId=${clientId}`,
      req.body
    );

    console.log(gameres.data);

    res.status(200).json({ data: gameres.data });
  } catch (error) {
    console.log(error.response.data);
    return res.status(SERVER_ERROR).json({ message: error.message });
  }
}

export async function seamlessWallet(req, res, next) {
  try {
    const requestSignature = req.headers["sign"];

    const signature = generateEvenbetSig(req.body);

    let errorResponse = {
      errorCode: 0,
      errorDescription: "",
    };

    let successResponse = {
      balance: 0,
      errorCode: 0,
      errorDescription: "",
    };

    if (requestSignature !== signature) {
      errorResponse.errorCode = 1;
      errorResponse.errorDescription = "Invalid signature";
      return res.status(200).json(errorResponse);
    }

    let {
      method,
      userId,
      currency,
      amount,
      transactionId,
      referenceTransactionId,
    } = req.body;

    if (!method) {
      errorResponse.errorCode = 4;
      errorResponse.errorDescription = "Invalid request params";
      return res.status(200).json(errorResponse);
    }

    switch (method) {
      case "GetBalance":
        if (!method || !userId || !currency || currency !== "USD") {
          errorResponse.errorCode = 4;
          errorResponse.errorDescription = "Invalid request params";
          return res.status(200).json(errorResponse);
        }

        let gamer = await getUer(userId);

        successResponse.balance = gamer.balance;
        return res.status(200).json(successResponse);

      case "GetCash":
        if (
          !method ||
          !userId ||
          !amount ||
          !transactionId ||
          !currency ||
          currency !== "USD" ||
          amount < 0
        ) {
          errorResponse.errorCode = 4;
          errorResponse.errorDescription = "Invalid request params";
          return res.status(200).json(errorResponse);
        }

        gamer = await getUer(userId);

        let isProcessed = await EvenbetAction.findOne({ transactionId });

        if (isProcessed) {
          successResponse.balance = isProcessed.balance;
          successResponse.errorCode = 0;
          successResponse.errorDescription = "Transaction already processed";
          return res.status(200).json(errorResponse);
        }

        if (gamer.balance < amount) {
          errorResponse.errorCode = 4;
          errorResponse.errorDescription = "Invalid request params";
          return res.status(200).json(errorResponse);
        }

        gamer.balance -= amount;
        await gamer.save();

        await EvenbetAction.create({
          walletAddress: userId.toLowerCase(),
          method,
          transactionId,
          amount,
          balance: gamer.balance,
        });

        successResponse.balance = gamer.balance;
        return res.status(200).json(successResponse);

      case "ReturnCash":
        if (
          !method ||
          !userId ||
          !amount ||
          !transactionId ||
          !currency ||
          currency !== "USD" ||
          amount < 0
        ) {
          errorResponse.errorCode = 4;
          errorResponse.errorDescription = "Invalid request params";
          return res.status(200).json(errorResponse);
        }

        gamer = await getUer(userId);

        isProcessed = await EvenbetAction.findOne({ transactionId });

        if (isProcessed) {
          successResponse.balance = isProcessed.balance;
          successResponse.errorCode = 0;
          successResponse.errorDescription = "Transaction already processed";
          return res.status(200).json(errorResponse);
        }

        gamer.balance += amount;
        await gamer.save();

        await EvenbetAction.create({
          walletAddress: userId.toLowerCase(),
          method,
          transactionId,
          amount,
          balance: gamer.balance,
        });

        successResponse.balance = gamer.balance;
        return res.status(200).json(successResponse);

      case "Rollback":
        if (
          !method ||
          !userId ||
          !amount ||
          !transactionId ||
          !referenceTransactionId ||
          !currency ||
          currency !== "USD" ||
          amount < 0
        ) {
          errorResponse.errorCode = 4;
          errorResponse.errorDescription = "Invalid request params";
          return res.status(200).json(errorResponse);
        }

        isProcessed = await EvenbetAction.findOne({ transactionId });

        if (isProcessed) {
          successResponse.balance = isProcessed.balance;
          successResponse.errorCode = 0;
          successResponse.errorDescription = "Transaction already processed";
          return res.status(200).json(errorResponse);
        }

        let refTransaction = await EvenbetAction.findOne({
          transactionId: referenceTransactionId,
        });

        if (!refTransaction) {
          errorResponse.errorCode = 5;
          errorResponse.errorDescription =
            "Reference transaction does not exist";
          return res.status(200).json(errorResponse);
        }

        gamer = await getUer(userId);

        if (refTransaction.method === "GetCash") {
          gamer.balance += refTransaction.amount;
          await gamer.save();
        }

        if (refTransaction.method === "ReturnCash") {
          gamer.balance -= refTransaction.amount;
          await gamer.save();
        }

        await EvenbetAction.create({
          walletAddress: userId.toLowerCase(),
          method,
          transactionId,
          amount,
          balance: gamer.balance,
          referenceTransactionId,
        });

        successResponse.balance = gamer.balance;
        return res.status(200).json(successResponse);

      default:
        successResponse.balance = 0;
        return res.status(200).json(successResponse);
    }
  } catch (error) {
    console.log(error.response.data);
    return res.status(SERVER_ERROR).json({ message: error.message });
  }
}

const getUer = async (userId) => {
  let gamer = await User.findOne({
    walletAddress: userId.toLowerCase(),
  });

  if (!gamer) {
    errorResponse.errorCode = 2;
    errorResponse.errorDescription = "Player not found";
    return res.status(200).json(errorResponse);
  }

  return gamer;
};
