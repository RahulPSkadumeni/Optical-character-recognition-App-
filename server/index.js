import express from "express";

import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
//rote import

// import categoryRoutes from "./routes/categoryRoutes.js";

/*MIDDLEware configuration*/
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
// app.use(bodyParser.json({ limit: "30mb", extended: true }));
// app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

app.use(
  cors({
    origin: ["http://localhost:3000"],
    method: ["GET", "POST"],
    credentials: true,
  })
);
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const PORT = process.env.PORT || 3001;

/* middlewares */

app.get("/login", (req, res) => {
  console.log("hello");
  try {
    res.status(200).send("user login success");
  } catch (error) {
    console.log("user login failed", error);
  }
});

// import categoryRoutes from "./routes/categoryRoutes.js";
// app.use("/api/product", categoryRoutes);
// app.post("/api/upload", upload.any(), (req, res) => {
//   console.log("upload", req);
//   console.log("file", req.file);
//   res.status(200).json({ message: "success" });
// });
import uploadRoutes from "./routes/uploadRoutes.js";
// app.post(
//   "/api/upload",
//   upload.fields([{ name: "frontImage" }, { name: "backImage" }]),
//   (req, res) => {
//     try {
//       const frontImage = req.files["frontImage"][0];
//       const backImage = req.files["backImage"][0];

//       // Handle the images here, you can save them or perform OCR or any processing needed

//       // Send a response back to the client
//       res.setHeader("Content-Type", "application/json");
//       res.json({ message: "Files received successfully" });
//     } catch (error) {
//       console.error("Error handling files:", error);
//       res.status(500).json({ message: "Error handling files" });
//     }
//   }
// );
app.use("/api/upload", uploadRoutes);
mongoose
  .connect(
    // "mongodb+srv://rahulps995:FXUzQB45WFNpFOTG@cluster0.axpd3e6.mongodb.net/?retryWrites=true&w=majority",
    "mongodb+srv://rahulps995:YxXn00k2ytnICiRA@cluster0.9gmrpk1.mongodb.net/?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("DB connected");
    app.listen(PORT, () => console.log(`Server Port:${PORT}`));
  })
  .catch((error) => console.log(`${error}did not connect`));
