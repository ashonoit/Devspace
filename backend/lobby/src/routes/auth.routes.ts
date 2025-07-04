import express  from "express";
import { SignIn, SignUp, SignInWithGoogle} from "../controllers/auth.controller";

const router = express.Router();

router.post('/signin', SignIn);
router.post('/signup', SignUp);
router.post("/viaGoogle", SignInWithGoogle);

export default router;