import express from "express";
const router = express.Router();

import {
  createSessionEvenbet,
  getGameList,
  openLobby,
} from "../controllers/evenbetGame.js";

router.post("/session", createSessionEvenbet);
router.get("/games", getGameList);
router.get("/openlobby", openLobby);

export default router;
