import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getSellersById = async (req, res) => {
  const { id } = req.params;

  const sellers = await prisma.seller.findMany({
    where: { raffleId: id },
    select: { id: true, name: true },
  });

  res.json(sellers);
};

export const createSellers = async (req, res) => {
  const { sellers, raffleId } = req.body;

  const nameList = Array.isArray(sellers) ? sellers : [sellers]; // forzar a array

  if (nameList.length === 0) {
    return res
      .status(400)
      .json({ error: "Lista de vendedores vacía o inválida." });
  }
  // Limpiar nombres (quitar espacios) y filtrar vacíos
  const cleanSellers = nameList
    .filter((name) => name.length > 0)
    // .map((name) => name.trim());

  // Verificar si hay duplicados en el array
  const uniqueSet = new Set(cleanSellers);
  if (uniqueSet.size !== cleanSellers.length) {
    return res
      .status(400)
      .json({ error: "Hay nombres duplicados en la lista." });
  }

  try {
    const raffle = await prisma.raffle.findUnique({
      where: { id: raffleId },
      include: { sellers: true },
    });

    if (!raffle) {
      return res.status(404).json({ error: "Sorteo no encontrado." });
    }

    // Chequear si ya existen vendedores con esos nombres
    const existingNames = raffle.sellers.map((s) => s.name.toLowerCase());
    const duplicatedInDB = cleanSellers.filter((name) =>
      existingNames.includes(name.toLowerCase())
    );

    if (duplicatedInDB.length > 0) {
      return res.status(400).json({
        error: `Ya existen vendedores con los siguientes nombres: ${duplicatedInDB.join(
          ", "
        )}`,
      });
    }

    const created = await prisma.$transaction(
      cleanSellers.map((name) =>
        prisma.seller.create({
          data: {
            name,
            raffleId,
          },
        })
      )
    );

    res.status(201).json(created);
  } catch (error) {
    console.error("Error al crear vendedores:", error);
    res.status(500).json({ error: "Error del servidor al crear vendedores." });
  }
};

export const updateSeller = async (req, res) => {
  const { sellerId } = req.params;
  const { name } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "El nombre no puede estar vacío." });
  }

  try {
    const existing = await prisma.seller.findUnique({
      where: { id: sellerId },
    });
    if (!existing) {
      return res.status(404).json({ error: "Vendedor no encontrado." });
    }

    // Verificar si ya existe otro vendedor con el mismo nombre en el mismo sorteo
    const duplicated = await prisma.seller.findFirst({
      where: {
        name: { equals: name.trim(), mode: "insensitive" },
        raffleId: existing.raffleId,
        NOT: { id: sellerId },
      },
    });

    if (duplicated) {
      return res.status(400).json({
        error: "Ya existe otro vendedor con ese nombre en este sorteo.",
      });
    }

    const updated = await prisma.seller.update({
      where: { id: sellerId },
      data: { name: name.trim() },
    });

    res.json(updated);
  } catch (error) {
    console.error("Error al actualizar vendedor:", error);
    res
      .status(500)
      .json({ error: "Error del servidor al actualizar el vendedor." });
  }
};

export const deleteSeller = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res
      .status(400)
      .json({ error: "Falta el ID del vendedor en los parámetros." });
  }

  try {
    const seller = await prisma.seller.findUnique({
      where: { id }, // ✅ Usar el campo correcto
      include: { tickets: true },
    });

    if (!seller) {
      return res.status(404).json({ error: "Vendedor no encontrado." });
    }
    if (seller.tickets.length > 0) {
      return res.status(400).json({
        error: "No se puede eliminar un vendedor que tiene tickets asignados.",
      });
    }

    await prisma.seller.delete({ where: { id } });
    res.json({ message: "Vendedor eliminado correctamente." });
  } catch (error) {
    console.error("❌ Error al eliminar vendedor:", error);
    res.status(500).json({
      error: "Error del servidor al eliminar el vendedor.",
      details: error.message,
    });
  }
};

export const getSellerByIdWithTickets = async (req, res) => {
  const { sellerId } = req.params;

  try {
    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
      include: {
        tickets: {
          select: {
            number: true,
            status: true,
            buyerName: true,
            buyerDni: true,
            referenceCode: true,
            createdAt: true,
          },
          orderBy: { number: "asc" },
        },
        raffle: {
          select: {
            title: true,
            date: true,
            shortCode: true,
          },
        },
      },
    });

    if (!seller) {
      return res.status(404).json({ error: "Vendedor no encontrado." });
    }

    res.json(seller);
  } catch (error) {
    console.error("Error al obtener vendedor:", error);
    res
      .status(500)
      .json({ error: "Error del servidor al obtener el vendedor." });
  }
};

export const getSellersByRaffle = async (req, res) => {
  const { raffleId } = req.params;

  try {
    const sellers = await prisma.seller.findMany({
      where: {
        raffleId,
      },
      include: {
        // Trae solo los tickets vendidos por cada vendedor
        tickets: {
          where: {
            status: "sold",
          },
          select: {
            number: true,
            buyerName: true,
            buyerDni: true,
            status: true,
            price: true, // si se llega a agregar esto por ticket
          },
        },
      },
    });

    // Enriquecer con métricas
    const sellersWithStats = sellers.map((seller) => {
      const soldTickets = seller.tickets;
      const count = soldTickets.length;
      const total = soldTickets.reduce(
        (acc, ticket) => acc + (ticket?.price || 0),
        0
      );

      return {
        id: seller.id,
        name: seller.name,
        createdAt: seller.createdAt,
        totalSold: count,
        totalRevenue: total,
        soldTickets,
      };
    });

    res.json(sellersWithStats);
  } catch (error) {
    console.error("Error al obtener vendedores del sorteo:", error);
    res.status(500).json({ error: "Error al obtener vendedores del sorteo." });
  }
};
