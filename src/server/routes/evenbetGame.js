import express from "express";
const router = express.Router();

import {
  createSessionEvenbet,
  getGameList,
} from "../controllers/evenbetGame.js";

router.post("/session", createSessionEvenbet);
router.get("/games", getGameList);

export default router;
