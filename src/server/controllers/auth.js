import { validateEmail } from "../../utils/helper.js";
import { generateToken, getUserFromToken } from "../../utils/jsonWebToken.js";
import { sendWelcomeMail, sendMail } from "../../utils/sendmail.js";
import User from "../models/UserModel.js";
import {
  BAD_REQUEST,
  NOT_FOUND,
  SERVER_ERROR,
  SUCCESS,
} from "../types/statusCode.js";
import {
  UPDATE_SUCCESS,
  ITEM_NOT_FOUND,
  FETCHED_SUCCESSFUL,
  DELETED_SUCCESSFUL,
} from "../types/statusMessge.js";
import crypto from "crypto";

export async function register(req, res, next) {
  try {
    let { player, password, currency, game, ...rest } = req.body;

    if (!player || !password || !currency || !game) {
      return res.status(BAD_REQUEST).json({
        message: "Please provide all field values",
      });
    }

    // Create user
    const user = await User.create({
      player,
      password,
      currency,
      game,
      ...rest,
    });

    const token = generateToken(user);

    // sendWelcomeMail(user.email, user.firstName, user.lastName);

    return res.status(SUCCESS).json({
      message: "Successfully registered",
      token,
      user,
    });
  } catch (error) {
    return res.status(SERVER_ERROR).json({ message: error.message });
  }
}

export async function getSingleUser(req, res, next) {
  const { userid } = req.params;

  try {
    const user = await User.findById(userid);

    return res.status(SUCCESS).json({
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    return res.status(SERVER_ERROR).json({ message: error.message });
  }
}

export async function updateUser(req, res, next) {
  try {
    const { ...rest } = req.body;
    const { userId } = req.params;
    const response = await User.findByIdAndUpdate(userId, {
      $set: {
        ...rest,
      },
    });

    if (!response)
      return res.status(BAD_REQUEST).json({ message: ITEM_NOT_FOUND });

    return res.status(SUCCESS).json({ message: UPDATE_SUCCESS });
  } catch (error) {
    return res.status(SERVER_ERROR).json({ message: error.message });
  }
}

export async function updatePassword(req, res, next) {
  try {
    const { password, newPassword } = req.body;
    const $user = getUserFromToken(req);

    const user = await User.findById($user._id);

    if (!user) {
      return res.status(BAD_REQUEST).json({ message: ITEM_NOT_FOUND });
    }

    const isPasswordValid = await user.matchPassword(password);

    if (isPasswordValid) {
      user.password = newPassword;
      await user.save();

      return res.status(SUCCESS).json({ message: UPDATE_SUCCESS });
    }

    return res.status(BAD_REQUEST).json({ message: "password invalid" });
  } catch (error) {
    return res.status(SERVER_ERROR).json({ message: error.message });
  }
}

export async function getLoggedInUser(req, res, next) {
  try {
    const $user = getUserFromToken(req);

    const user = await User.findById($user._id);

    if (!user) {
      return res.status(BAD_REQUEST).json({ message: ITEM_NOT_FOUND });
    }

    return res
      .status(SUCCESS)
      .json({ user, message: "User fetched successfully" });
  } catch (error) {
    return res.status(SERVER_ERROR).json({ message: error.message });
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(BAD_REQUEST).json({ message: ITEM_NOT_FOUND });
    }

    // Get reset password token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetUrl = `https://cryptocapitalinvest.co/resetpassword/${resetToken}`;

    // sendResetPasswordMail(email, resetUrl);

    return res.status(SUCCESS).json({ message: "Reset link sent to mail" });
  } catch (error) {
    return res.status(SERVER_ERROR).json({ message: error.message });
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { password } = req.body;

    const resetPasswordToken = crypto
      .createHmac("sha256", process.env.JWT_SECRET)
      .update(req.params.resetToken)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(BAD_REQUEST).json({ message: ITEM_NOT_FOUND });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.status(SUCCESS).json({ message: "Successful" });
  } catch (error) {
    return res.status(SERVER_ERROR).json({ message: error.message });
  }
}

export async function sendUserMail(req, res, next) {
  try {
    const { email, subject, message } = req.body;

    if (!email || !subject || !message) {
      return res
        .status(BAD_REQUEST)
        .json({ message: "Please provide email and message" });
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(BAD_REQUEST).json({ message: ITEM_NOT_FOUND });
    }

    sendMail(user.firstName, user.lastName, subject, message, user.email);

    return res.status(SUCCESS).json({ message: "Successful" });
  } catch (error) {
    return res.status(SERVER_ERROR).json({ message: error.message });
  }
}
