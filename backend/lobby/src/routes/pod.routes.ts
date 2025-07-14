import express  from "express";
import { authorisePodAccess } from "../controllers/pod.controller";


const router = express.Router();

router.post('/authorisePodAccess', authorisePodAccess);
// router.post('/resume',resumeSpace);

// ${process.env.LOBBY_URI}/api/pod/authorisePodAccess
// ${process.env.LOBBY_URI}/api/pod/destroyPod

export default router;