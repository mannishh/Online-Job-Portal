import "dotenv/config";

import express from "express";
import cors from "cors";
import path from "path";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";

const app = express();
