import "dotenv/config";

import express from "express";
import cors from "cors";
import path from "path";
import connectDB from "./config/db.js";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import savedJobsRoutes from "./routes/savedJobsRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//middleware to handle cors
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

//connect database
connectDB();

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// test route
app.get("/", (req, res) => {
  res.send("Backend is running successfully 🚀");
});

//routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/save-jobs", savedJobsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin", adminRoutes);

//serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {}));

//start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
