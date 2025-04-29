import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import userRoutes from "./routes/userRoutes.js";
import raffleRoutes from "./routes/raffleRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import prizeRoutes from "./routes/prizeRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import quickRaffleRoutes from "./routes/quickRaffle.js";
import numberRoutes from "./routes/numberRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import oauthRoutes from "./routes/oauthRoutes.js";
import paymentsRoutes from "./routes/paymentsRoutes.js";
import mpRoutes from "./routes/mpRoutes.js";
import salesRoutes from "./routes/salesRoutes.js";

import morgan from "morgan";

dotenv.config();
const app = express();

app.use(cors({
  origin: [
    "https://kh8mlfw9-5173.brs.devtunnels.ms",
    "https://rifalo.onrender.com",
    "https://rifalo.com.ar",
    "https://www.rifalo.com.ar",
    "https://rifalo.vercel.app",
    "http://localhost:5173",

  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/users", userRoutes);
app.use("/api/raffles", raffleRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/prizes", prizeRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/numbers", numberRoutes);
app.use("/api/sellers", sellerRoutes);
app.use("/api/sales", salesRoutes);

app.use("/api", quickRaffleRoutes);

// Integracion de MP
app.use("/api/oauth", oauthRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/mp", mpRoutes);


app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
