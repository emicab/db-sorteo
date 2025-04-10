import express from "express";

const router = express.Router();

router.post("/quick-raffle", (req, res) => {
  const { participants, winnersCount } = req.body;

  if (!participants || participants.length === 0) {
    return res.status(400).json({ error: "Debe proporcionar una lista de participantes." });
  }

  if (!winnersCount || winnersCount < 1 || winnersCount > participants.length) {
    return res.status(400).json({ error: "Cantidad de ganadores no válida." });
  }

  // Mezclar y seleccionar ganadores
  const shuffled = [...participants].sort(() => Math.random() - 0.5);
  const winners = shuffled.slice(0, winnersCount);

  return res.json({ winners });
});

export default router;
