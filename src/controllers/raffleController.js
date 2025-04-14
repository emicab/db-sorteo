import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

// Crear un sorteo
export const createRaffle = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      totalNumbers,
      winnersCount,
      pricePerNumber,
      whatsapp,
      alias,
      status = "pending",
      sellers,
    } = req.body;

    if (
      !title ||
      !description ||
      !date ||
      !totalNumbers ||
      !winnersCount ||
      !pricePerNumber ||
      !whatsapp ||
      !alias
    ) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token no proporcionado" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    const generateShortCode = () => {
      return Math.random().toString(36).substring(2, 8).toUpperCase(); // Ej: "5TG9KZ"
    };
    const formattedDate = new Date(date).toISOString();

    const raffle = await prisma.raffle.create({
      data: {
        title,
        description,
        date: formattedDate,
        totalNumbers: parseInt(totalNumbers),
        winnersCount: parseInt(winnersCount),
        pricePerNumber: parseFloat(pricePerNumber),
        ownerId: userId,
        whatsapp,
        alias,
        status,
        shortCode: generateShortCode(),
        sellers: {
          create: (sellers || []).map((name) => ({ name })),
        },
      },
    });

    const numbersData = Array.from({ length: totalNumbers }, (_, i) => ({
      number: i + 1,
      raffleId: raffle.id,
    }));

    await prisma.ticket.createMany({
      data: numbersData,
    });

    res.status(201).json(raffle);
  } catch (error) {
    console.error("Error al crear sorteo:", error);
    res.status(500).json({ error: "Error al crear el sorteo" });
  }
};

// Obtener todos los sorteos
export const getRaffles = async (req, res) => {
  const userId = req.userId;
  try {
    const raffles = await prisma.raffle.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
    });
    res.json(raffles);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los sorteos" });
  }
};

// Eliminar un sorteo
export const deleteRaffle = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.raffle.delete({ where: { id } });
    res.json({ message: "Sorteo eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el sorteo" });
  }
};

export const updateRaffle = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      date,
      totalNumbers,
      winnersCount,
      pricePerNumber,
    } = req.body;

    const formattedDate = new Date(date).toISOString();

    const updatedRaffle = await prisma.raffle.update({
      where: { id: id },
      data: {
        title,
        description,
        date: formattedDate,
        totalNumbers,
        winnersCount: parseInt(winnersCount),
        pricePerNumber,
      },
    });

    res.json(updatedRaffle);
  } catch (error) {
    console.error("Error al actualizar sorteo:", error);
    res.status(500).json({ error: "Error al actualizar el sorteo" });
  }
};

export const getRaffleById = async (req, res) => {
  try {
    const { id } = req.params;

    const raffle = await prisma.raffle.findUnique({
      where: { id: id },
      include: {
        prizes: true,
      },
    });

    if (!raffle) {
      return res.status(404).json({ error: "Sorteo no encontrado" });
    }

    res.json(raffle);
  } catch (error) {
    console.error("Error al obtener sorteo:", error);
    res.status(500).json({ error: "Error al obtener el sorteo" });
  }
};

export const getRaffleDetailsForCreator = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Verificamos que req.user existe
    if (!req.userId) {
      return res.status(401).json({ error: "Token inválido o faltante." });
    }

    const raffle = await prisma.raffle.findUnique({
      where: { id },
      include: {
        tickets: true,
        prizes: true,
        owner: true,
      },
    });

    if (!raffle) {
      return res.status(404).json({ error: "Sorteo no encontrado" });
    }

    if (raffle.ownerId !== userId) {
      return res
        .status(403)
        .json({ error: "No tienes permiso para ver este sorteo" });
    }

    const vendidos = raffle.tickets.filter((t) => t.status === "sold").length;
    const reservados = raffle.tickets.filter(
      (t) => t.status === "reserved"
    ).length;
    const disponibles = raffle.totalNumbers - vendidos - reservados;

    const recaudado = vendidos * (raffle.pricePerNumber ?? 0);

    res.json({
      ...raffle,
      vendidos,
      disponibles,
      reservados,
      recaudado,
    });
  } catch (error) {
    console.error("Error al obtener sorteo:", error);
    res.status(500).json({ error: "Error al obtener el sorteo" });
  }
};

export const getRaffleDetail = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const raffle = await prisma.raffle.findUnique({
      where: { id },
      include: { prizes: true },
    });

    if (!raffle || raffle.ownerId !== userId) {
      return res.status(403).json({ message: "No autorizado" });
    }

    const tickets = await prisma.ticket.findMany({
      where: { raffleId: id },
      select: {
        id: true,
        number: true,
        userId: true,
      },
    });

    const ticketStatus = tickets.map((t) => ({
      ...t,
      status: t.userId ? "sold" : "available", // en el futuro podés diferenciar "reserved"
    }));

    res.json({ raffle, tickets: ticketStatus, prizes: raffle.prizes });
  } catch (error) {
    console.error("Error en getRaffleDetail:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const getRaffleNumbers = async (req, res) => {
  const { id } = req.params;

  try {
    const numbers = await prisma.ticket.findMany({
      where: { raffleId: id },
      orderBy: { number: "asc" },
    });

    res.status(200).json(numbers);
  } catch (err) {
    console.error("Error al obtener números del sorteo:", err);
    res.status(500).json({ message: "Error al obtener números" });
  }
};

export const getRaffleByShortCode = async (req, res) => {
  const { shortcode } = req.params;
  try {
    const raffle = await prisma.raffle.findUnique({
      where: { shortCode: shortcode.toUpperCase() }, // puede normalizarlo si querés
      include: {
        prizes: true,
        tickets: true,
        sellers: true,
      },
      owner: {
        select: {
          username: true,
          verified: true
        },
      }
    });

    if (!raffle) {
      return res.status(404).json({ message: "Sorteo no encontrado." });
    }

    res.status(200).json(raffle);
  } catch (error) {
    console.error("Error al buscar sorteo por código:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

export const drawWinners = async (req, res) => {
  const { raffleId } = req.params;

  try {
    const raffle = await prisma.raffle.findUnique({
      where: { id: raffleId },
    });

    if (!raffle) {
      return res.status(404).json({ error: "Sorteo no encontrado" });
    }

    if (raffle.status !== "pending") {
      return res.status(400).json({ error: "El sorteo ya fue realizado" });
    }

    // Verificamos si ya hay resultados (no debería haber)
    const existingResults = await prisma.result.findMany({
      where: {
        ticket: {
          raffleId,
        },
      },
    });

    if (existingResults.length > 0) {
      return res
        .status(400)
        .json({ error: "Este sorteo ya tiene resultados generados" });
    }

    const soldTickets = await prisma.ticket.findMany({
      where: { raffleId: raffleId, status: "sold" },
    });

    if (soldTickets.length < raffle.winnersCount) {
      return res.status(400).json({
        error: "No hay suficientes números vendidos para realizar el sorteo",
      });
    }

    const prizes = await prisma.prize.findMany({
      where: { raffleId },
    });

    const winners = soldTickets
      .sort(() => 0.5 - Math.random())
      .slice(0, raffle.winnersCount);

    const usedPrizeIds = new Set();
    const usedTicketIds = new Set();
    const results = [];

    for (let i = 0; i < winners.length; i++) {
      const ticket = winners[i];
      const prize = prizes[i];

      if (!ticket || !prize) break;

      if (usedTicketIds.has(ticket.id) || usedPrizeIds.has(prize.id)) {
        continue; // saltamos duplicados
      }

      usedTicketIds.add(ticket.id);
      usedPrizeIds.add(prize.id);

      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { isWinner: true },
      });

      const result = await prisma.result.create({
        data: {
          ticketId: ticket.id,
          prizeId: prize.id,
        },
        include: {
          ticket: true,
          prize: true,
        },
      });

      results.push(result);
    }

    await prisma.raffle.update({
      where: { id: raffleId },
      data: { status: "finished" },
    });

    res.json({ message: "Sorteo realizado", results });
  } catch (error) {
    console.error("❌ Error al realizar sorteo:", error);
    res.status(500).json({ error: "Error al realizar sorteo" });
  }
};

export const getRaffleWinners = async (req, res) => {
  const { raffleId } = req.params;

  try {
    // Verificar que el sorteo exista
    const raffle = await prisma.raffle.findUnique({
      where: { id: raffleId },
    });

    if (!raffle) {
      return res.status(404).json({ error: "Sorteo no encontrado" });
    }

    // Si el sorteo no está finalizado, no mostrar ganadores
    if (raffle.status !== "finished") {
      return res.status(400).json({ error: "El sorteo aún no fue finalizado" });
    }

    // Buscar tickets ganadores
    const winners = await prisma.ticket.findMany({
      where: {
        raffleId,
        isWinner: true,
      },
      select: {
        number: true,
        buyerName: true,
        buyerDni: true,
        referenceCode: true,
        id: true,
      },
    });

    res.json(winners);
  } catch (error) {
    console.error("Error al obtener ganadores:", error);
    res.status(500).json({ error: "Error interno al obtener ganadores" });
  }
};

export const getResultsByRaffle = async (req, res) => {
  const { id } = req.params;

  try {
    const raffle = await prisma.raffle.findUnique({
      where: { id },
    });

    if (!raffle) {
      return res.status(404).json({ error: "Sorteo no encontrado." });
    }

    if (raffle.status !== "finished") {
      return res.status(400).json({
        error: "El sorteo aún no ha finalizado.",
      });
    }

    const results = await prisma.result.findMany({
      where: { ticket: { raffleId: id } },
      include: {
        ticket: true,
        prize: true,
      },
    });

    res.json(results);
  } catch (error) {
    console.error("❌ Error al obtener resultados del sorteo:", error);
    res
      .status(500)
      .json({ error: "Error del servidor al obtener resultados." });
  }
};

export const getCreatorRaffleByShortCode = async (req, res) => {
  const { shortcode } = req.params;
  const userId = req.userId;

  try {
    const raffle = await prisma.raffle.findFirst({
      where: {
        shortCode: shortcode.toUpperCase(),
        ownerId: userId,
      },
      include: {
        prizes: true,
        tickets: true,
        sellers: true,
      },
    });

    if (!raffle) {
      return res.status(404).json({ message: "Sorteo no encontrado o no autorizado." });
    }

    res.status(200).json(raffle);
  } catch (error) {
    console.error("Error al obtener sorteo del creador:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};
