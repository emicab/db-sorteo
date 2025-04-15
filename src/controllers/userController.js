import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "clave_secreta";

// Registro de usuario
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log(req.body);

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUser) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword, verified: false },
    });

    res.status(201).json({ message: "Usuario registrado", user });
  } catch (error) {
    res.status(500).json({ error: "Error al registrar el usuario" });
  }
};

// Inicio de sesión
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({ where: { username } });

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
