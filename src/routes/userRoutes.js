import express from "express";
import { registerUser, loginUser } from "../controllers/userController.js";

const router = express.Router();

router.post("/register-notfound", registerUser);
router.post("/login", loginUser);

export default router;
