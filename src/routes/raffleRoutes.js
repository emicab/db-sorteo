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
  getResultsByRaffle,
  getCreatorRaffleByShortCode,
} from "../controllers/raffleController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { uploadExcel } from "../utils/uploadExcel.js";
import multer from "multer";

const router = express.Router();

router.get("/", verifyToken, getRaffles);
router.get("/numbers/:id", getRaffleNumbers);
router.get("/:id", getRaffleById); // Para obtener un sorteo por ID
router.get("/:id/creator", verifyToken, getRaffleDetailsForCreator);
router.get("/:id/details", getRaffleDetail);
router.get("/:id/results", getResultsByRaffle);
router.get("/shortcode/:shortcode", getRaffleByShortCode);
router.get("/creator/shortcode/:shortcode", verifyToken, getCreatorRaffleByShortCode);

router.post("/", createRaffle);
// router.post("/:id/sellers", createSellers)
router.post("/:raffleId/draw", drawWinners); // AGREGAR VERIFYTOKEN


const upload = multer({ dest: "uploads/" });
router.post("/:id/import", upload.single("file"), uploadExcel)

router.put("/:id", updateRaffle); // Para editar un sorteo

router.delete("/:id", deleteRaffle);

export default router;
