import express  from "express";
import { createNewSpace , resumeSpace, getRecentVisits} from "../controllers/space.controller";
import { authenticate } from "../middlewares/authenticate.middleware";

const router = express.Router();

router.post('/launch', authenticate, createNewSpace);
router.post('/resume', authenticate,resumeSpace);
router.get('/recents', authenticate,getRecentVisits);

export default router;