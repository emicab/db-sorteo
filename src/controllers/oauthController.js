import { PrismaClient } from "@prisma/client";
import { exchangeCodeForToken } from "../services/mercadopagoService.js";
import { generateOAuthUrl } from "../utils/generateOAuthUrl.js";

const prisma = new PrismaClient();

// Ruta para generar URL de autorización
export const redirectToMercadoPago = (req, res) => {
  const { userId } = req.params; 
  if (!userId) {
    return res.status(400).send("userId es requerido");
  }
  console.log(userId)
  const clientId = process.env.MP_CLIENT_ID;
  const redirectUri = encodeURIComponent("https://kh8mlfw9-3000.brs.devtunnels.ms/api/oauth/callback");

  const authUrl = `https://auth.mercadopago.com.ar/authorization?client_id=${clientId}&response_type=code&platform_id=mp&redirect_uri=${redirectUri}&state=${userId}`;

  res.redirect(authUrl);
};

// Ruta callback de MercadoPago
export const handleOAuthCallback = async (req, res) => {
  const { code, state: userId } = req.query;
  if (!code || !userId) {
    return res.status(400).send("Código de autorización o userId faltante");
  }
  
  try {
    const tokenData = await exchangeCodeForToken(code, process.env.MP_REDIRECT_URI);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return res.status(404).send("Usuario no encontrado");
    }
    if (user.mp_connected) {
      return res.status(400).redirect(`${process.env.FRONTEND_URL}/dashboard?status=already_connected`);
    }
    await prisma.user.update({
      where: { id: userId },
      data: {
        mp_access_token: tokenData.access_token,
        mp_refresh_token: tokenData.refresh_token,
        mp_user_id: String(tokenData.user_id), //transformar en string
        mp_connected: true,
      },
    });

    res.redirect(`${process.env.FRONTEND_URL}/perfil?status=success`);

  } catch (error) {
    res.status(500).send("Error al conectar con MercadoPago: " + error.message);
  }
};
