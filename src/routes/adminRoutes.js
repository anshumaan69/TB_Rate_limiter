import express from "express";
import * as adminController from "../controllers/adminController.js";

const router = express.Router();

router.post("/", adminController.createClient);
router.get("/:clientKey", adminController.getClient);
router.put("/:clientKey", adminController.updateClient);

export default router;
