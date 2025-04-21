import express from 'express';
import { handleMPWebhook } from '../controllers/mpWebHook.js';

const router = express.Router();

router.post("/webhook", express.json(), handleMPWebhook)

export default router;