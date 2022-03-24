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

console.log(generatedSignature == expectedSignature);

// export async function launchDemo(req, res, next) {
//   try {
//     const userGamingDetails = {
//       casino_id: "demo",
//       game: "CherryFiesta",
//       locale: "fr",
//       ip: "46.53.162.55",
//       client_type: "mobile",
//       urls: {
//         deposit_url: "https://example.com/deposit",
//         return_url: "https://example.com",
//       },
//     };

//     res.status(200).json({ data: uuid });
//   } catch (error) {
//     return res.status(SERVER_ERROR).json({ message: error.message });
//   }
// }

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

    const generatedSignature = generateSignature("SECRET", userGamingDetails);

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
    const userGamingDetails = {
      user_id: "550e8400-e29b-41d4-a716-446655440000",
      currency: "EUR",
      game: "CherryFiesta",
      game_id: "12",
      finished: true,
      actions: [
        {
          action: "bet",
          amount: 1000,
          action_id: "123",
          jackpot_contribution: 1.23,
        },
        {
          action: "win",
          amount: 1250,
          action_id: "124",
        },
      ],
    };

    res.status(200).json({ data: uuid });
  } catch (error) {
    return res.status(SERVER_ERROR).json({ message: error.message });
  }
}
