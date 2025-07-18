import express from "express";
import dotenv from "dotenv";

dotenv.config();

import podRoutes from './routes/pod.routes';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3002;

app.use("/orchestrator/pod", podRoutes);

app.get('/', (_req, res) => {
  res.send('Welcome to the orchestrator engine!!');
});

app.listen(PORT, () => {
  console.log(`Orchestrator running at http://localhost:${PORT}`);
});
