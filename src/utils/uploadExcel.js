import xlsx from "xlsx";
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const uploadExcel = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "Archivo no encontrado" });

    const filePath = path.join("uploads", file.filename);
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    // Formatear datos
    const formatted = data.map((row) => ({
      number: Number(row["numero"]),
      buyerName: row["comprador"] || null,
      status: row["estado"]?.toLowerCase() === "vendido" ? "sold" : "available",
      email: row["Email"] || null,
      sellerName: row["vendedor"] || null,
    }));

    // Paso 1: Crear vendedores únicos
    const uniqueSellers = [...new Set(formatted.map((item) => item.sellerName).filter(Boolean))];

    const sellerMap = new Map();

    for (const name of uniqueSellers) {
      let seller = await prisma.seller.findFirst({
        where: {
          name,
          raffleId: req.params.id,
        },
      });

      if (!seller) {
        seller = await prisma.seller.create({
          data: {
            name,
            raffleId: req.params.id,
          },
        });
      }

      sellerMap.set(name, seller.id);
    }

    // Paso 2: Obtener números existentes del sorteo
    const existingNumbers = await prisma.ticket.findMany({
      where: {
        raffleId: req.params.id,
      },
    });

    const numberMap = new Map();
    existingNumbers.forEach((n) => {
      numberMap.set(n.number, n.id);
    });

    // Paso 3: Preparar actualizaciones
    const updates = [];

    for (const item of formatted) {
      const numberId = numberMap.get(item.number);
      const sellerId = item.sellerName ? sellerMap.get(item.sellerName) : null;

      if (numberId) {
        updates.push(
          prisma.ticket.update({
            where: { id: numberId },
            data: {
              buyerName: item.buyerName,
              buyerDni: null,
              status: item.status,
              sellerId,
            },
          })
        );
      } else {
        console.warn(`Número ${item.number} no encontrado en el sorteo`);
      }
    }

    await prisma.$transaction(updates);

    // Eliminar archivo temporal
    fs.unlinkSync(filePath);

    res.status(200).json({ message: "Migración completada exitosamente" });
  } catch (error) {
    console.error("Error al procesar el Excel:", error);
    res.status(500).json({ error: "Error al procesar el archivo" });
  }
};