import cryptoJs from "crypto-js";
import User from "../models/UserModel.js";
import {
  BAD_REQUEST,
  NOT_FOUND,
  SERVER_ERROR,
  SUCCESS,
} from "../types/statusCode.js";
import crypto from "crypto";
import axios from "axios";

function generateSignature(apiSecret, body) {
  const hmac = crypto.createHmac("SHA256", apiSecret);
  if (body) {
    hmac.update(Buffer.from(JSON.stringify(body)));
  }
  return hmac.digest("hex");
}

const expectedSignature =
  "e368dba16378d7e233512666bd0196e1fcc6c08394ab54fbc6a9390d68e878ee";
const generatedSignature = generateSignature("SECRET", { a: 1 });

export async function createSessions(req, res, next) {
  try {
    const userGamingDetails = {
      casino_id: "demo",
      game: "CherryFiesta",
      currency: "EUR",
      locale: "de",
      ip: "46.53.162.55",
      balance: 25000,
      client_type: "desktop",
      urls: {
        deposit_url: "https://example.com/deposit",
        return_url: "https://example.com",
      },
      user: {
        id: "550e8400-e29b-41d4-a716-446655440000",
        email: "user@example.com",
        firstname: "John",
        lastname: "Doe",
        nickname: "spinmaster",
        city: "Berlin",
        country: "DE",
        date_of_birth: "1980-12-26",
        gender: "m",
        registered_at: "2018-10-11",
      },
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

    const response = await axios.post(`/bgamingurl`, userGamingDetails, {
      config,
    });

    res.status(SUCCESS).json({ response });
  } catch (error) {
    return res.status(SERVER_ERROR).json({ message: error.message });
  }
}

export async function play(req, res, next) {
  try {
    const lauchData = {
      casino_id: "acceptance:test",
      game: "Acceptance Test",
      currency: "BTC",
      locale: "en",
      ip: "46.53.162.55",
      balance: 25000,
      client_type: "desktop",
      urls: {
        deposit_url: "https://omitchgame.herokuapp.com/deposit",
        return_url: "https://omitch.com",
      },
      user: {
        id: "550e8400-e29b-41d4-a716-446655440000",
        email: "user@example.com",
        firstname: "John",
        lastname: "Doe",
        nickname: "spinmaster",
        city: "Berlin",
        country: "DE",
        date_of_birth: "1980-12-26",
        gender: "m",
        registered_at: "2018-10-11",
      },
    };

    const demoLaunchData = {
      casino_id: "demo",
      game: "CherryFiesta",
      locale: "fr",
      ip: "46.53.162.55",
      client_type: "mobile",
      urls: {
        deposit_url: "https://omitchgame.herokuapp.com/deposit",
        return_url: "https://omitch.com",
      },
    };

    // List of currencies enabled: EUR, USD, BTC, FUN.
    // GCP_URL: https://int.bgaming-system.com/a8r/omitch-int
    // CASINO_ID: omitch-int
    // AUTH_TOKEN: a3gb9zJrzVUwZve2BU5PXDpX

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

    const response = await axios.post(
      `https://int.bgaming-system.com/a8r/omitch-int/demo`,
      demoLaunchData,
      {
        config,
      }
    );

    console.log(response);

    res.status(200).json({ response });
  } catch (error) {
    return res.status(SERVER_ERROR).json({ message: error.message });
  }
}

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
