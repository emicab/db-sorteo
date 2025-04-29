import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createPreference = async (req, res) => {
  try {
    const { raffleId, numbers, buyerName, buyerDni, sellerId } = req.body;

    // Validaciones básicas
    if (!raffleId || !numbers?.length || !buyerName || !buyerDni) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    // Buscar datos del sorteo
    const raffle = await prisma.raffle.findUnique({
      where: { id: raffleId },
      include: { owner: true }, // importante para traer el owner
    });

    if (!raffle) {
      return res.status(404).json({ error: "Sorteo no encontrado" });
    }

    // Traer el access token del owner
    const hostAccessToken = raffle.owner.mp_access_token;

    if (!hostAccessToken) {
      return res.status(400).json({ error: "Host sin cuenta conectada" });
    }

    // Total de la venta.
    const totalPrice = raffle.pricePerNumber * numbers.length;

    // Crear preferencia en MercadoPago usando el access_token del host
    const preferenceResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${hostAccessToken}`,
      },
      body: JSON.stringify({
        items: [
          {
            title: `Números de la rifa: ${raffle.title}`,
            quantity: numbers.length,
            currency_id: "ARS",
            unit_price: raffle.pricePerNumber, // precio individual
          },
        ],
        metadata: {
          raffleId,
          selectedNumbers: numbers,
          buyerName,
          buyerDni,
          sellerId,

        },
        back_urls: {
          success: `${process.env.FRONTEND_URL}/mp/payment-success`,
          failure: `${process.env.FRONTEND_URL}/mp/payment-failure`,
          pending: `${process.env.FRONTEND_URL}/mp/payment-pending`,
        },
        auto_return: "approved",
        marketplace_fee: parseFloat((totalPrice * 0.06).toFixed(2)),

      }),
    });

    const preferenceData = await preferenceResponse.json();

    if (!preferenceData.init_point) {
      throw new Error("No se pudo crear preferencia en MP");
    }

    res.status(200).json({ init_point: preferenceData.init_point });
  } catch (error) {
    console.error("Error creando preferencia:", error.message);
    res.status(500).json({ error: "Error creando preferencia" });
  }
};
