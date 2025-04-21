import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

export const createPreference = async (req, res) => {
  try {
    const { raffleId, numbers, buyerName, buyerDni, sellerId } = req.body;

    if (!raffleId || !numbers?.length || !buyerName || !buyerDni) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    // Buscar datos de la rifa
    const raffle = await prisma.raffle.findUnique({
      where: { id: raffleId },
      select: {
        title: true,
        pricePerNumber: true,
        ownerId: true,
      },
    });

    if (!raffle) return res.status(404).json({ error: "Rifa no encontrada" });

    // Buscar access_token del host
    const host = await prisma.user.findUnique({
      where: { id: raffle.ownerId },
      select: { mp_access_token: true },
    });

    if (!host || !host.mp_access_token) {
      return res.status(404).json({ error: "El creador no tiene cuenta conectada a MercadoPago" });
    }

    const totalPrice = raffle.pricePerNumber * numbers.length;

    const preference = {
      items: [
        {
          title: `${raffle.title} - Nros: ${numbers.join(", ")}`,
          quantity: 1,
          unit_price: parseFloat(totalPrice),
        },
      ],
      back_urls: {
        success: `${process.env.FRONTEND_URL}/success`,
        failure: `${process.env.FRONTEND_URL}/failure`,
        pending: `${process.env.FRONTEND_URL}/pending`,
      },
      auto_return: "approved",
      marketplace_fee: parseFloat((totalPrice * 0.10).toFixed(2)),
      metadata: {
        raffleId,
        selectedNumbers: numbers,
        buyerName,
        buyerDni,
        sellerId: sellerId || null,
      },
    };

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${host.mp_access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preference),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error al crear preferencia:", data);
      return res.status(500).json({ error: "Error creando preferencia de pago" });
    }

    res.json({ init_point: data.init_point });
  } catch (error) {
    console.error("Error general:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

