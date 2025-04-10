import express from "express";
import { createTicket, getTickets, deleteTicket, getTicketById } from "../controllers/ticketController.js";

const router = express.Router();

router.post("/", createTicket);
router.get("/", getTickets);
router.get("/:id", getTicketById)
router.delete("/:id", deleteTicket);

export default router;
