import express from "express";
const router = express.Router();

// import { launch } from "../controllers/game.js";
import { createSessions, demo, getBalance, play } from "../controllers/gcp.js";

// router.post("/launch", launch);
router.post("/demo", demo);
router.post("/session", createSessions);
router.get("/balance", getBalance);
router.post("/play", play);

export default router;
