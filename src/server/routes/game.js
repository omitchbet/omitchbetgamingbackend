import express from "express";
const router = express.Router();

// import { launch } from "../controllers/game.js";
import {
  createSessions,
  demo,
  getBalance,
  play,
  rollback,
} from "../controllers/gcp.js";
import {
  createUser,
  getUser,
  updateUser,
  withdraw,
} from "../controllers/user.js";

// router.post("/launch", launch);
router.post("/demo", demo);
router.post("/session", createSessions);
router.get("/balance", getBalance);
router.post("/play", play);
router.post("/rollback", rollback);
router.post("/createuser", createUser);
router.post("/updateuser", updateUser);
router.get("/getuser/:id", getUser);
router.post("/withdraw", withdraw);

export default router;
