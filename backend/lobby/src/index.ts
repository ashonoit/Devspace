import express from 'express';
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

import spaceRoutes from './routes/space.routes';

const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json());
app.use(cors());

//space routes
app.use("/space", spaceRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the lobby!!');
});

//APP LISTEN
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
