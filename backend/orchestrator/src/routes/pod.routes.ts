import express  from "express";
import { startPod, destroyPod } from "../controllers/pod.controllers";

const router = express.Router()

router.post("/start", startPod);
router.post("/destroy", destroyPod);

export default router;