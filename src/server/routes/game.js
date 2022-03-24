import express from "express";
const router = express.Router();

import { launch } from "../controllers/game.js";

router.post("/launch", launch);

export default router;
