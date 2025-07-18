import 'source-map-support/register';
import express from "express";
import dotenv from "dotenv"
import cors from "cors";
import cookieParser from "cookie-parser"
dotenv.config()
import { createServer } from "http";
import { initWs } from "./websocket";

const app = express();

app.use(cookieParser());
app.use(express.json());

app.use(cors(
  {
  origin: process.env.CLIENT_URI,
  credentials: true,
  }
));

const httpServer = createServer(app);

initWs(httpServer);

const port = process.env.PORT || 3001;
httpServer.listen(port, () => {
  console.log(`listening on *:${port}`);
});


// "node-pty": "^1.0.0"