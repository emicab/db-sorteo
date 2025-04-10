import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();


// Crear premio
export const createPrize = async (req, res) => {
  const { name, raffleId } = req.body;
  console.log('req.body::', req.body)

  try {
    const prize = await prisma.prize.create({
      data: {
        name,
        raffleId,
      },
    });
    res.status(201).json(prize);
  } catch (error) {
    console.error("Error creando premio:", error);
    res.status(500).json({ message: "Error al crear el premio" });
  }
};

// Actualizar premio
export const updatePrize = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const updated = await prisma.prize.update({
      where: { id },
      data: { name },
    });
    res.json(updated);
  } catch (error) {
    console.error("Error actualizando premio:", error);
    res.status(500).json({ message: "Error al actualizar el premio" });
  }
};

// Eliminar premio
export const deletePrize = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.prize.delete({
      where: { id },
    });
    res.json({ message: "Premio eliminado" });
  } catch (error) {
    console.error("Error eliminando premio:", error);
    res.status(500).json({ message: "Error al eliminar el premio" });
  }
};

// premios por sorteo
export const getPrizesByRaffle = async (req, res) => {
  const { raffleId } = req.params;
  try {
    const prizes = await prisma.prize.findMany({
      where: { raffleId },
    });
    res.json(prizes);
  } catch (error) {
    console.error("Error al obtener premios:", error);
    res.status(500).json({ error: "Error al obtener premios" });
  }
};