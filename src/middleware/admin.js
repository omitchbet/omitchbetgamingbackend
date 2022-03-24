import User from "../server/models/UserModel.js";
import { BAD_REQUEST } from "../server/types/statusCode.js";
import { getUserFromToken } from "../utils/jsonWebToken.js";

export const isAdmin = async (req, res, next) => {
  const user = getUserFromToken(req);
  const newUser = await User.findOne({ email: user.email });
  if (newUser.isAdmin) {
    next();
  } else {
    return res.status(BAD_REQUEST).json({ message: "Not admin" });
  }
};
