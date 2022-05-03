import User from "../models/UserModel.js";
import {
  BAD_REQUEST,
  NOT_FOUND,
  SERVER_ERROR,
  SUCCESS,
} from "../types/statusCode.js";
// import { randomUUID } from "crypto";

// export async function launch(req, res, next) {
//   try {
//     let uuid = randomUUID();
//     token = uuid.replace(/-/g, "");

//     res.status(200).json({ data: uuid });
//   } catch (error) {
//     return res.status(SERVER_ERROR).json({ message: error.message });
//   }
// }
