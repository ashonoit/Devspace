import express from 'express';
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();

import spaceRoutes from './routes/space.routes';
import authRoutes from './routes/auth.routes'
import connectDB from './db';

const PORT = process.env.PORT || 3000;

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(cors(
  {
  origin:process.env.CLIENT_URI,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'User-Agent', 'DNT', 'Cache-Control', 'X-Mx-ReqToken', 'Keep-Alive', 'X-Requested-With', 'If-Modified-Since', 'X-CSRFToken', 'auth-token'],
  optionsSuccessStatus:200,
  }
));

//space routes
app.use("/api/space", spaceRoutes);
app.use("/api/auth", authRoutes);

//auth routes

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
};

startServer();