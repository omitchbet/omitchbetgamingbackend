import { checkExist } from "../utils/checkExist.js";
import User from "../server/models/UserModel.js";
import { BAD_REQUEST, SERVER_ERROR } from "../server/types/statusCode.js";

export const userUniqueSchemaValueExist = async (req, res, next) => {
  try {
    const { email, userName } = req.body;

    const emailExist = await User.findOne({ email });
    const usernameExist = await User.findOne({ userName });

    if (usernameExist) {
      return res
        .status(BAD_REQUEST)
        .json({ message: "Username already in use" });
    }

    if (emailExist) {
      return res.status(BAD_REQUEST).json({ message: "Email already in use" });
    }

    next();
  } catch (error) {
    return res.status(SERVER_ERROR).json({ message: error.message });
  }
};
