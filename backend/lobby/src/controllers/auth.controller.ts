import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/user.model";
import jwt, { SignOptions } from "jsonwebtoken";
import axios from 'axios';

const SignUp = async (req:Request, res:Response):Promise<void>=>{
    try{
        const {username, email, password} = req.body;

        if ([email, username, password].some((field) => field?.trim() === "")) {
            res.status(400).json({message: "All fields must be filled", success:false});
            return;
        }

        if(username.length<3 || username.length>25){
            res.status(400).json({message: "Username should be of [3,25] letters!", success:false}); 
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		    if (!emailRegex.test(email) || email.length>50) {
		    	res.status(400).json({ message: "Invalid email format", success:false });
          return;
		    }

        const user =await User.findOne({
            $or: [{email},{username}]
        });
        if(user){
            res.status(409).json({ success: false, message: "Email or username already exists!" });
            return;
        }

        const salt =  await bcrypt.genSalt(10);
        const passHash = await bcrypt.hash(password, salt);

        const newUser = new User({ username, email, passHash, loginVia:'manual'});
        await newUser.save();

        console.log(newUser?.username, " just signed up")

        res.status(201)
                  .json({success:true, message: "User created successfully." });
    }
    catch(err){
        console.log("Error in SignUp : ",err);
        res.status(500).json({success:true, message: "Failed to Sign Up"});
    }
}

const SignIn = async (req:Request, res:Response): Promise<void> =>{
    try{
        const {username, email, password} = req.body;
        if(!email && !username){
            res.status(400).json({message: "At least one of username or email must be given", success:false});
            return;
        }

        const user = await User.findOne({
            $or: [{username}, {email}]
        })

        if (!user){
            res.status(400).json({ message: "Invalid credentials.",success:false });
            return;
        }

        const isPasswordOk = await bcrypt.compare(password, user?.passHash!);

        if (!isPasswordOk){
             res.status(400).json({ message: "Invalid credentials.", success:false });
            return;
        }

        const token = jwt.sign(
          { id: user._id, 
            email: user.email,
            username: user.username
          },
          process.env.JWT_SECRET!,
          { expiresIn: "2 days" }
        );

        const cookieOptions = {
            httpOnly: true,
            maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
        }

        console.log(user.username, " signed in")

        res.status(200)
        .cookie("accessToken", token, cookieOptions)
        .json({
            success:true,
            message: "Login successful",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })

    }
    catch(err){
        console.log("Error in signin in: ", err);
        res.status(500).json({success:false, message: "Failed to Sign In"});
    }
}

const SignInWithGoogle = async (req:Request, res:Response): Promise<void> =>{
    try {
      const { code } = req.body;

      if (!code) {
        res.status(400).json({ success: false, message: "Code is required" });
        return;
      }

      // 1. Exchange code for tokens
      const tokenRes = await axios.post(
        "https://oauth2.googleapis.com/token",
        {
          code,
          client_id: process.env.GOOGLE_OAUTH20_CLIENT_ID,
          client_secret: process.env.GOOGLE_OAUTH20_CLIENT_SECRET,
          redirect_uri: "postmessage", // same as used on frontend
          grant_type: "authorization_code",
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const { access_token, id_token } = tokenRes.data;

      // 2. Use access token to get user info
      const userInfoRes = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

    //   console.log(userInfoRes.data);

      const { email, name, sub: googleId } = userInfoRes.data;

      if (!email || !googleId) {
        res.status(400).json({ success: false, message: "Invalid Google user info" });
        return;
      }

      // 3. Check if user exists
      let user = await User.findOne({ email });

      if (!user) {
        user = new User({
          email,
          username: name.replace(/\s+/g, "").toLowerCase(), // fallback username
          loginVia: "google",
          googleId,
        });
        await user.save();
      }

      // 4. Generate JWT
      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
          username: user.username,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "2d" }
      );

      // 5. Set cookie
      const cookieOptions = {
        httpOnly:true,
        secure:false,
        sameSite: "lax" as const,
        maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
      };

      console.log("Google logged in", user.username)

      res.cookie("accessToken", token, cookieOptions)
        .status(200)
        .json({
          success: true,
          message: "Login successful",
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
          },
        });
    } catch (err: any) {
      console.error("Google login error:", err.response?.data || err.message);
      res.status(500).json({ success: false, message: "Google login failed" });
    }
}

const FetchMe = async (req:Request, res:Response):Promise<void> =>{
    try{
      const user = req.user;  //{id,email,username}
      if(!user){
        console.log("No user found in FetchMe");
        return;
      }

      console.log("User reloaded")

      res.status(200).json({success:true, message:"Here are your details", user});
    }
    catch(err:any){
      console.error("Unable to FetchMe() :", err.response?.data || err.message);
      res.status(500).json({ success: false, message: "Error in fetching your details" });
    }
}

const SignOut = async (req: Request, res: Response): Promise<void> => {
  try {

    console.log("User signed out")
    // Clear the accessToken cookie
    res.clearCookie("accessToken", {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // set to true if using HTTPS
    });

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err: any) {
    console.error("Signout error:", err.message || err);
    res.status(500).json({ success: false, message: "Logout failed" });
  }
};

export {SignIn, SignUp, SignInWithGoogle, FetchMe, SignOut}

