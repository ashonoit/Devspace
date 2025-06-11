import express from "express";
import dotenv from "dotenv";

dotenv.config();

import podRoutes from './routes/pod.routes';

const app = express();
const PORT = process.env.PORT || 3002;

app.use("/pod", podRoutes);

app.get('/', (_req, res) => {
  res.send('Welcome to the orchestrator engine!!');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
