import jwt from "jsonwebtoken";
import { FORBIDEN, SERVER_ERROR } from "../server/types/statusCode.js";
import crypto from "crypto";

export const generateToken = (user) => {
  return jwt.sign({ user }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const getUserFromToken = (req) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      throw Error("User Unauthorized");
    }
    const jwtPayload = jwt.verify(token, process.env.JWT_SECRET);
    const { user } = jwtPayload;
    return user;
  } catch (e) {
    throw Error(e);
  }
};

export const compareSignature = (req, res, next) => {
  const token = req.headers["x-request-sign"];
  if (!token) {
    throw Error("User Unauthorized");
  }
  const signature = generateSignature("a3gb9zJrzVUwZve2BU5PXDpX", req.body);

  if (token !== signature) {
    return res.status(FORBIDEN).json({ message: "signature unmatched error " });
  } else {
    next();
  }
};

export function generateSignature(apiSecret, body) {
  const hmac = crypto.createHmac("SHA256", apiSecret);
  if (body) {
    hmac.update(Buffer.from(JSON.stringify(body)));
  }
  return hmac.digest("hex");
}

export function generateSHA256(apiSecret) {
  return crypto.createHash("sha256").update(apiSecret).digest("hex");
}
