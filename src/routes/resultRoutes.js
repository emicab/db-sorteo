import express from "express";
import { createResult, getResults, deleteResult } from "../controllers/resultController.js";

const router = express.Router();

router.post("/", createResult);
router.get("/", getResults);
router.delete("/:id", deleteResult);

export default router;
