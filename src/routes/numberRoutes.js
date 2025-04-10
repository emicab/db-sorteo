import express from "express";
import { approveNumber, reserveNumbers } from "../controllers/numberController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/reserve", reserveNumbers);
router.put("/approve/:id", verifyToken, approveNumber);


export default router;
