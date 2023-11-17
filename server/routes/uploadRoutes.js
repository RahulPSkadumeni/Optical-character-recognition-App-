// uploadRoutes.js

import express from "express";
const router = express.Router();
import { handleUpload } from "../controller/uploadController.js";
import multer from "multer";

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST /api/upload
router.post(
  "/",
  upload.fields([{ name: "frontImage" }, { name: "backImage" }]),
  async (req, res) => {
    try {
      await handleUpload(req, res); // Ensure handleUpload function is correctly invoked
    } catch (error) {
      console.error("Error handling upload:", error);
      res.status(500).json({ message: "Error handling upload" });
    }
  }
);

export default router;
