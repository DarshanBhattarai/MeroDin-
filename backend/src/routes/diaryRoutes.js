import express from "express";
import {
  getDiaryEntries,
  createDiaryEntry,
} from "../controllers/diaryController.js";

const router = express.Router();

router.get("/", getDiaryEntries);
router.post("/", createDiaryEntry);

export default router;
