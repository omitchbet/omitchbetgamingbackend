import express from "express";
const router = express.Router();

import {
  getGameList,
  openLobby,
  seamlessWallet,
} from "../controllers/evenbetGame.js";

router.post("/", seamlessWallet);
router.get("/games", getGameList);
router.post("/openlobby", openLobby);

export default router;
