import express from "express";
import { createSellers, deleteSeller, getSellerByIdWithTickets, getSellersById, getSellersByRaffle, updateSeller } from "../controllers/sellerControllers.js";


const router = express.Router();

// Crear vendedor
router.post("/", createSellers);

// Obtener vendedores por ID
router.get("/:id/sellers", getSellersById)

// Obtener vendedores por sorteo
router.get("/:raffleId", getSellersByRaffle);

// Obtener vendedor puntual con tickets vendidos
router.get("/details/:sellerId", getSellerByIdWithTickets);

// Actualizar nombre del vendedor
router.put("/:sellerId", updateSeller);

// Eliminar vendedor
router.delete("/:id", deleteSeller);

export default router;
