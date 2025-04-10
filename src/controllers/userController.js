import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "clave_secreta";

// Registro de usuario
export const registerUser = async (req, res) => {
  try {
    const { user, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const username = await prisma.user.create({
      data: { user, email, password: hashedPassword },
    });

    res.status(201).json({ message: "Usuario registrado", username });
  } catch (error) {
    res.status(500).json({ error: "Error al registrar el usuario" });
  }
};

// Inicio de sesión
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ message: "Inicio de sesión exitoso", user, token });
  } catch (error) {
    res.status(500).json({ error: "Error en el inicio de sesión" });
  }
};
