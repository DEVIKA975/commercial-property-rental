import express from "express";
import {
  microsoftLogin,
  microsoftCallback,
  sendEmailFromGraph
} from "../controllers/graphController.js";

const router = express.Router();

router.get("/auth/login", microsoftLogin);
router.get("/auth/callback", microsoftCallback);
router.post("/send-mail", sendEmailFromGraph);

export default router;
