import express from "express";
import {
  createRaffle,
  getRaffles,
  deleteRaffle,
  updateRaffle,
  getRaffleById,
  getRaffleDetailsForCreator,
  getRaffleDetail,
  getRaffleNumbers,
  getRaffleByShortCode,
  drawWinners,
  getRaffleWinners,
  getResultsByRaffle,
} from "../controllers/raffleController.js";
import { verifyToken } from "../middleware/verifyToken.js";
// import { createSellers, getSellersById } from "../controllers/sellerControllers.js";

const router = express.Router();

router.get("/", verifyToken, getRaffles);
router.get("/numbers/:id", getRaffleNumbers);
router.get("/:id", getRaffleById); // Para obtener un sorteo por ID
router.get("/:id/creator", verifyToken, getRaffleDetailsForCreator);
router.get("/:id/details", getRaffleDetail);
router.get("/shortcode/:code", getRaffleByShortCode);
router.get("/:id/results", getResultsByRaffle);

router.post("/", createRaffle);
// router.post("/:id/sellers", createSellers)
router.post("/:raffleId/draw", drawWinners); // AGREGAR VERIFYTOKEN



router.put("/:id", updateRaffle); // Para editar un sorteo

router.delete("/:id", deleteRaffle);

export default router;
