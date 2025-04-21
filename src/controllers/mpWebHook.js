import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const handleMPWebhook = async (req, res) => {
  try {
    const mpEvent = req.body;

    // Validar que es un evento válido
    if (mpEvent.type !== "payment" && mpEvent.action !== "payment.created") {
      return res.status(200).send("Evento ignorado");
    }

    const paymentId = mpEvent.data.id;

    // Obtener info completa del pago desde MP
    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`, // TOKEN DE RIFALO, no del host
      },
    });

    const paymentData = await paymentResponse.json();

    if (paymentData.status !== "approved") {
      return res.status(200).send("Pago no aprobado");
    }

    const {
      metadata: { raffleId, selectedNumbers, buyerName, buyerDni, sellerId },
      transaction_amount,
      payer,
    } = paymentData;

    // ⚙️ Guardar en la DB tu lógica: asignar números, registrar venta, etc
    // Ejemplo básico:
    await prisma.sale.create({
      data: {
        raffleId,
        buyerName,
        buyerDni,
        numbers: selectedNumbers,
        amount: transaction_amount,
        mp_payment_id: paymentId,
        sellerId,
      },
    });

    res.status(200).send("OK");
  } catch (error) {
    console.error("Error en webhook:", error.message);
    res.status(500).send("Error procesando webhook");
  }
};
