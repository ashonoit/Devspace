import express  from "express";
import { createNewSpace , resumeSpace} from "../controllers/space.controller";
import { authenticate } from "../middlewares/authenticate.middleware";

const router = express.Router();

router.post('/launch', authenticate, createNewSpace);
router.post('/resume', authenticate,resumeSpace);

export default router;