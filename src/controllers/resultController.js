import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Crear un resultado de sorteo
export const createResult = async (req, res) => {
  try {
    const { raffleId, ticketId, prizeId } = req.body;
    const result = await prisma.result.create({
      data: { raffleId, ticketId, prizeId },
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al registrar el resultado" });
  }
};

// Obtener todos los resultados
export const getResults = async (req, res) => {
  try {
    const results = await prisma.result.findMany({
      include: { raffle: true, ticket: true, prize: true },
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los resultados" });
  }
};

// Eliminar un resultado
export const deleteResult = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.result.delete({ where: { id } });
    res.json({ message: "Resultado eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el resultado" });
  }
};
