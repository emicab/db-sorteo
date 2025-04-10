import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Crear un ticket
export const createTicket = async (req, res) => {
  try {
    const { number, raffleId, userId } = req.body;
    const ticket = await prisma.ticket.create({
      data: { number, raffleId, userId },
    });
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el ticket" });
  }
};

// Obtener todos los tickets
export const getTickets = async (req, res) => {
  try {
    const tickets = await prisma.ticket.findMany();
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los tickets" });
  }
};

// Eliminar un ticket
export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.ticket.delete({ where: { id } });
    res.json({ message: "Ticket eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el ticket" });
  }
};

// GET /api/tickets/:id
export const getTicketById = async (req, res) => {
  const { id } = req.params;

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket no encontrado." });
    }

    res.json(ticket);
  } catch (err) {
    console.error("Error buscando ticket:", err);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};
