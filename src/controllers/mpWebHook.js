import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const handleMPWebhook = async (req, res) => {
    try {
        const mpEvent = req.body;

        // Validar que es un evento válido
        if (
            mpEvent.type !== "payment" &&
            mpEvent.action !== "payment.created"
        ) {
            return res.status(200).send("Evento ignorado");
        }

        const paymentId = mpEvent.data.id;
        // Obtener info completa del pago desde MP
        const paymentResponse = await fetch(
          `https://api.mercadopago.com/v1/payments/${paymentId}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`, // TOKEN DE RIFALO, no del host
                },
            }
        );

        const paymentData = await paymentResponse.json();
        // console.log("paymentData:: ", paymentData);

        if (paymentData.status !== "approved") {
            return res.status(200).send("Pago no aprobado");
        }

        const {
          metadata: {
            raffle_id: raffleId,
            selected_numbers: selectedNumbers,
            buyer_name: buyerName,
            buyer_dni: buyerDni,
            seller_id: sellerId,
          },
          transaction_details: { net_received_amount: amountReceived },
          transaction_amount
        } = paymentData;

        await prisma.sale.create({
            data: {
                raffleId,
                buyerName,
                buyerDni,
                numbers: selectedNumbers,
                amountReceived: amountReceived,
                mp_payment_id: paymentId,
                sellerId,
                transactionAmount: transaction_amount
            },
        });

        const referenceCode = `${buyerName
          .slice(0, 2)
          .toUpperCase()}${buyerDni}${raffleId.slice(0, 4)}${Date.now()
          .toString()
          .slice(-4)}`;

        await prisma.ticket.updateMany({
          where: {
            raffleId,
            number: {
              in: selectedNumbers,
            },
          },
          data: {
            status: "sold",
            buyerName,
            buyerDni,
            referenceCode,
            sellerId: sellerId || null,
            price: amountReceived,
          },
        })

        res.status(200).json();
    } catch (error) {
        console.error("Error en webhook:", error.message);
        res.status(500).send("Error procesando webhook");
    }
};
