import express from "express";
import protect from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import {
  uploadAndParseResume,
  getMyParsedResume,
} from "../controllers/resumeController.js";

const router = express.Router();

// POST /api/resume/upload
router.post(
  "/upload",
  protect,
  upload.single("resume"),
  uploadAndParseResume
);

// GET /api/resume/me
router.get("/me", protect, getMyParsedResume);

export default router;



