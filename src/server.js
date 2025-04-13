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

import morgan from "morgan";


dotenv.config();
const app = express();

app.use(cors({
  origin: [
    "https://5173-idx-soorteo-v2-1743519701525.cluster-duylic2g3fbzerqpzxxbw6helm.cloudworkstations.dev",
    "https://rifalo-sorteo.onrender.com",
    "https://rifalo.com.ar",
    "https://www.rifalo.com.ar",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.use(express.json());
app.use(morgan("dev"))

app.use("/api/users", userRoutes);
app.use("/api/raffles", raffleRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/prizes", prizeRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/numbers", numberRoutes)
app.use("/api/sellers", sellerRoutes)

app.use("/api", quickRaffleRoutes);

app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
