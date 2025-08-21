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

// const corsOptions = {
//   origin: process.env.CLIENT_URI,
//   credentials: true,
// };

// app.use(cors(corsOptions));
// app.options(/^\/.*$/, cors(corsOptions));

app.use(cors());

app.get('/healthz', (req, res) => {
  // This route confirms the HTTP server is running.
  res.status(200).send('OK');
});


const httpServer = createServer(app);

initWs(httpServer);

const port = process.env.PORT || 3001;
httpServer.listen(port, () => {
  console.log(`listening on *:${port}`);
});


// "node-pty": "^1.0.0"