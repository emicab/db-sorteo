import { z } from "zod";

export const raffleSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  description: z.string().min(1, "La descripción es obligatoria"),
  totalNumbers: z.coerce.number().int().positive("Debe ser un número positivo"),
  winnersCount: z.coerce.number().int().positive("Debe ser al menos 1 ganador"),
  pricePerNumber: z.coerce.number().positive("Debe tener un precio válido"),
  date: z.string().min(1, "La fecha es obligatoria"), // opcionalmente podés validar formato
  whatsapp: z
    .string()
    .regex(/^\+?\d{10,15}$/, "Número de WhatsApp inválido"),
  alias: z.string().min(1, "El alias es obligatorio"),
});
