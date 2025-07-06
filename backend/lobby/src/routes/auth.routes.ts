import express  from "express";
import { SignIn, SignUp, SignInWithGoogle, FetchMe} from "../controllers/auth.controller";
import { authenticate } from "../middlewares/authenticate.middleware";

const router = express.Router();

router.post('/signin', SignIn);
router.post('/signup', SignUp);
router.post("/viaGoogle", SignInWithGoogle);
router.get("/me", authenticate, FetchMe);

export default router;