import User from "../models/UserModel.js";
import {
  BAD_REQUEST,
  NOT_FOUND,
  SERVER_ERROR,
  SUCCESS,
} from "../types/statusCode.js";
import axios from "axios";
import { generateEvenbetSig } from "../../utils/evenbetSig.js";
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

export async function createSessionEvenbet(req, res, next) {
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

  const clientId = "bet-qXrTaMQY";

  try {
    const gameres = await axios.post(
      `https://omitch.pokerserversoftware.com/api/web/v2/app/users/${user}/session?clientId=${clientId}`
    );

    console.log(gameres);

    res.status(200).json({ data: gameres });
  } catch (error) {
    // console.log(error);
    // return res.status(SERVER_ERROR).json({ message: error.message });
  }
}
