import express from "express";
import * as checkController from "../controllers/checkController.js";
import { handleRateLimit } from "../middleware/rateLimitHeaders.js";

const router = express.Router();

router.post("/", handleRateLimit, checkController.check);

export default router;
