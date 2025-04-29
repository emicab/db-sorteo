import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getSales = async (req, res) => {
  const { raffleId } = req.params;

  try {
    const sale = await prisma.sale.findMany({
      where: { raffleId },
      select: {
        amountReceived: true,
        transactionAmount: true,
      }
    })

    if (!sale) {
      return res.status(404).json({ error: "No se encontraron ventas" });
    }
    res.status(200).json(sale);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las ventas" });
  }
}