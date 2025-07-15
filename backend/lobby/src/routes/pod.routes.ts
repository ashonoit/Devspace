import express  from "express";
import { authorisePodAccess, destroyPod } from "../controllers/pod.controller";


const router = express.Router();

router.post('/authorisePodAccess', authorisePodAccess);
router.post('/selfDestroy',destroyPod);

// ${process.env.LOBBY_URI}/api/pod/authorisePodAccess
// ${process.env.LOBBY_URI}/api/pod/destroyPod

export default router;