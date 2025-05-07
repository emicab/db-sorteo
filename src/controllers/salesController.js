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

export const getSaleByPaymentId = async (req, res) => {
  const { paymentId } = req.params;
  console.log(paymentId) // devuelve correctamente el paymentId
  try {
    const sale = await prisma.sale.findFirst({
      where: { mp_payment_id: paymentId },
      select: {
        createdAt: true,
        transactionAmount: true,
        numbers: true,
        buyerName: true,
        buyerDni: true,
        shortCode: true,
        mp_payment_id: true, // type string
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