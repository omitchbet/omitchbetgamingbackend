import express from "express";
const router = express.Router();

// import { launch } from "../controllers/game.js";
import { demo, play } from "../controllers/gcp.js";

// router.post("/launch", launch);
router.post("/demo", demo);

export default router;
