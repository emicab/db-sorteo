import express from "express";
import { handleOAuthCallback, redirectToMercadoPago } from "../controllers/oauthController.js";

const router = express.Router();

router.get("/connect/:userId", redirectToMercadoPago); // usuario inicia el flujo
router.get("/callback", handleOAuthCallback);    // callback de MP

export default router;
