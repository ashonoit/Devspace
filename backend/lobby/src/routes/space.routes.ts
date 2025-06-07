import express  from "express";
import { createNewSpace } from "../controllers/space.controller";

const router = express.Router();

router.post('/createNewSpace', createNewSpace);

export default router;