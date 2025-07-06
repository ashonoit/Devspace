import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload as DefaultJwtPayload } from "jsonwebtoken";

// Define our custom payload shape
interface JwtPayload extends DefaultJwtPayload {
  id: string;
  email: string;
  username: string;
}

// Extend Express Request to include user
declare module "express-serve-static-core" {
  interface Request {
    user?: JwtPayload;
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction):void => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.user = decoded;

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};
