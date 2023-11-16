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
  handleUpload
);

export default router;
