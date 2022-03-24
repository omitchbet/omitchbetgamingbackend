import express from "express";
const router = express.Router();

import {
  register,
  getSingleUser,
  updateUser,
  updatePassword,
  getLoggedInUser,
  forgotPassword,
  resetPassword,
  sendUserMail,
} from "../controllers/auth.js";

router.post("/register", register);
router.get("/user/:userid", getSingleUser);
router.put("/user/:userId", updateUser);
router.post("/user/updatepassword", updatePassword);
router.get("/user", getLoggedInUser);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resetToken", resetPassword);
router.post("/sendmail", sendUserMail);

export default router;
