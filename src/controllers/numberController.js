import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const reserveNumbers = async (req, res) => {
  try {
    const { raffleId, numbers, buyerName, buyerDni, sellerId } = req.body;
    console.log("req.body::", req.body);

    if (!raffleId || !numbers?.length || !buyerName || !buyerDni) {
      return res.status(400).json({ message: "Faltan datos obligatorios." });
    }

    const referenceCode = `${buyerName
      .slice(0, 2)
      .toUpperCase()}${buyerDni}${raffleId.slice(0, 4)}${Date.now()
      .toString()
      .slice(-4)}`;

    // Verificar si los números ya están reservados o vendidos
    const existing = await prisma.ticket.findMany({
      where: {
        raffleId,
        number: { in: numbers },
        OR: [{ userId: { not: null } }, { buyerName: { not: null } }],
      },
    });

    if (existing.length > 0) {
      return res.status(409).json({
        message: "Algunos números ya fueron reservados o vendidos.",
        conflictNumbers: existing.map((t) => t.number),
      });
    }

    // Reservar los números con buyerName, buyerDni y Seller (vendedor)
    await prisma.ticket.updateMany({
      where: {
        raffleId,
        number: { in: numbers },
      },
      data: {
        buyerName,
        buyerDni,
        status: "reserved",
        referenceCode,
        sellerId: sellerId || null,
      },
    });

    // Recuperar todos los tickets reservados
    const tickets = await prisma.ticket.findMany({
      where: {
        raffleId,
        number: { in: numbers },
        buyerName,
        buyerDni,
        referenceCode,
      },
      select: {
        id: true,
        buyerName: true,
        buyerDni: true,
        number: true,
        referenceCode: true,
        raffleId: true,
        status: true,
      },
    });

    return res.status(200).json({
      message: "Números reservados exitosamente.",
      tickets,
    });
  } catch (error) {
    console.error("Error al reservar números:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};


export const approveNumber = async (req, res) => {
  const { id } = req.params;

  try {
    const number = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!number)
      return res.status(404).json({ message: "Número no encontrado" });
    if (number.status !== "reserved")
      return res.status(400).json({ message: "El número no está reservado" });

    const updated = await prisma.ticket.update({
      where: { id },
      data: {
        status: "sold",
        // price: ticket.raffle.pricePerNumber
        //approvedAt: new Date(), // opcional
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("Error aprobando número:", error);
    res.status(500).json({ message: "Error al aprobar número" });
  }
};
