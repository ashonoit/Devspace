import { Request, Response } from 'express';
import axios from 'axios';
import {v4 as uuidv4} from 'uuid';
import jwt, {JwtPayload as DefaultJwtPayload, JwtPayload} from "jsonwebtoken";
import Pod from '../models/pod.model';


const startPod = async (spaceId: string, userId: string) => {
//   const podId = `${spaceId}-${uuidv4()}`;
  const podId = `${spaceId}-${uuidv4().slice(0, 10)}`;

  try {
    const res = await axios.post(`${process.env.ORCHESTRATOR_URI}/orchestrator/pod/start`, { spaceId,podId });
    
    if (res.status === 200 || res.status === 201) {
      return { success: true, podId };
    } else {
      return { success: false };
    }
  } catch (err:any) {
    console.error("Failed to start pod:", err?.message);
    return { success: false };
  }
};

const destroyPod = async (req:Request, res:Response): Promise<void> => {
//   const podId = `${spaceId}-${uuidv4()}`;
  const {spaceId, podId} = req.body;

  try {
    const res = await axios.post(`${process.env.ORCHESTRATOR_URI}/orchestrator/pod/destroy`, { spaceId,podId });
    
    console.log(`Pod ${podId} destroyed`, res.data.message);
    
  } catch (err:any) {
    console.error("Failed to start pod:", err?.message);
  }
};

const authorisePodAccess = async (req:Request, res:Response):Promise<void> =>{
    try{
        const {podId, accessToken} = req.body;

        if (!accessToken || !podId) {
            console.log("Either token or podID not provided by pod")
            res.status(400).json({ success: false, message: "Missing accessToken or podId" });
            return;
        }
        
        //Extract user info from token
        const user = jwt.verify(accessToken, process.env.JWT_SECRET as string) as JwtPayload;
        
        if (!user || !user.id) {    //if invalid payload
          res.status(401).json({ success: false, message: "Invalid token payload" });
          return;
        }

        //find the pod stored in db
        const podDoc = await Pod.findOne({ podId });

        if (!podDoc) {   //if pod with podId never stored in db 
          console.log("podDoc not found")
          res.status(404).json({ success: false, message: "Pod not found" });
          return;
        }

        if (podDoc.ownerId.toString() !== user.id) {   //if stored owner is not the requesting user
          res.status(403).json({ success: false, message: "Not authorized for this pod" });
          return;
        }
        
        console.log("Pod auth done")
        res.json({ success: true, message:"Authorisation successful", user });
    }
    catch(err){
        console.error("Pod access denied ", err);
        res.status(401).json({
          success: false,
          message: "Invalid or expired token.",
        });
    }
}

export {startPod, authorisePodAccess, destroyPod}