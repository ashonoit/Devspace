import express  from "express";
import { SignIn, SignUp, SignInWithGoogle, FetchMe, SignOut} from "../controllers/auth.controller";
import { authenticate } from "../middlewares/authenticate.middleware";

const router = express.Router();

router.post('/signin', SignIn);
router.post('/signup', SignUp);
router.post("/viaGoogle", SignInWithGoogle);
router.get("/me", authenticate, FetchMe);
router.post("/signout", authenticate, SignOut);

export default router;