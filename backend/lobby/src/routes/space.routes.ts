import express  from "express";
import { createNewSpace } from "../controllers/space.controller";
import { authenticate } from "../middlewares/authenticate.middleware";

const router = express.Router();

router.post('/launch', authenticate, createNewSpace);
// router.post('/createNewSpace', createNewSpace);

export default router;