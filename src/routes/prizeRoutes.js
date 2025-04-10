import express from "express";
import {
  createPrize,
  updatePrize,
  deletePrize,
  getPrizesByRaffle,
} from "../controllers/prizeController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/", verifyToken, createPrize);
router.put("/:id", verifyToken, updatePrize);
router.delete("/:id", verifyToken, deletePrize);
router.get("/:raffleId", getPrizesByRaffle);

export default router;
