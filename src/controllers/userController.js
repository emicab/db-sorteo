import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { isEmailValid } from "../utils/validateEmails.js";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "clave_secreta";

// Registro de usuario
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const {valid, reason, validators} = await isEmailValid(email)
    if (!valid) {
      return res.status(400).json({
        error: 'Correo inválido o sospechoso',
        details: reason,
        validator: validators[reason]
      })
    }

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

// obtener usuario por id
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({ 
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        mp_connected: true,
        mp_user_id: true,
        mp_access_token: true,
        mp_refresh_token: true,
      }, 
    });
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el usuario" });
  }
};