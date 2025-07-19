import express  from "express";
import { authorisePodAccess, destroyPod , getPodToken} from "../controllers/pod.controller";
import { authenticate } from "../middlewares/authenticate.middleware";


const router = express.Router();

router.post('/authorisePodAccess', authorisePodAccess);
router.post('/selfDestroy',destroyPod);

router.post('/getPodToken', authenticate,getPodToken);  //hit by client to generate a podToken

// ${process.env.LOBBY_URI}/api/pod/authorisePodAccess
// ${process.env.LOBBY_URI}/api/pod/destroyPod

export default router;