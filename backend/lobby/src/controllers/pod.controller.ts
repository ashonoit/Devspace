import { Request, Response } from 'express';
import axios from 'axios';
import {v4 as uuidv4} from 'uuid';
import jwt, {JwtPayload as DefaultJwtPayload, JwtPayload} from "jsonwebtoken";
import Pod from '../models/pod.model';


const startPod = async (spaceId: string, userId: string | undefined) => {
//   const podId = `${spaceId}-${uuidv4()}`;
  const podId = `${spaceId}-${uuidv4().slice(0, 10)}`
  .toLowerCase()
  .replace(/[^a-z0-9-]/g, '-')   // allow only lowercase, numbers, dash
  .replace(/^-+/, '')            // remove leading hyphens
  .replace(/-+$/, '');           // remove trailing hyphens 

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
    const result = await axios.post(`${process.env.ORCHESTRATOR_URI}/orchestrator/pod/destroy`, { spaceId,podId });
    
    console.log(`Pod ${podId} destroyed`, result.data.message);
    
    const updated = await Pod.findOneAndUpdate(
      { podId },
      { $set: { status: 'stopped' } },
      { new: true }
    );

    if (!updated) {
      console.warn(`Pod with ID ${podId} not found in database`);
    } else {
      console.log(`Pod ${podId} marked as stopped in DB`);
    }

    res.status(200).json({ success: true, message:`Pod ${podId} is getting destroyed`});
  } catch (err:any) {
    console.error("Failed to start pod:", err?.message);
    res.status(500).json({ success: false, message:`Failed to destroy Pod ${podId}`});
  }
};

const getPodToken = async (req:Request, res:Response): Promise<void> =>{
  try{
    const {spaceId, podId} = req.body;
    const userId = req.user?.id;

    if(!userId || !podId){
      res.status(400).json({success:false, message:"Either userId or podId not sent"});
      return;
    }

    const pod = await Pod.findOne({podId})

    if(!pod || pod?.status==="stopped"){
      res.status(400).json({success:false, message:"Pod not running"});
      return;
    }else if(pod.ownerId.toString() !== userId){
      res.status(400).json({success:false, message:"User is not the owner"});
      return;
    }

    const podToken = jwt.sign(
              { userId, podId, spaceId},
              process.env.JWT_POD_SECRET!,
              { expiresIn: "2h" }
            );
    
    console.log("Pod token sent")
    res.status(200).json({success:true, message:"Here is the podtoken", podToken})
  }
  catch(err){
    console.log("Error in getUserPodToken ", err);
    res.status(500).json({success:false, message:"Server error in getPodToken"});
  }
}

// const authorisePodAccess = async (req:Request, res:Response):Promise<void> =>{
//     try{
//         const {podId, accessToken} = req.body;

//         if (!accessToken || !podId) {
//             console.log("Either token or podID not provided by pod")
//             res.status(400).json({ success: false, message: "Missing accessToken or podId" });
//             return;
//         }
        
//         //Extract user info from token
//         const user = jwt.verify(accessToken, process.env.JWT_SECRET as string) as JwtPayload;
        
//         if (!user || !user.id) {    //if invalid payload
//           console.log("Invalid payload")
//           res.status(401).json({ success: false, message: "Invalid token payload" });
//           return;
//         }

//         //find the pod stored in db
//         const podDoc = await Pod.findOne({ podId });

//         if (!podDoc) {   //if pod with podId never stored in db 
//           console.log("podDoc not found")
//           res.status(404).json({ success: false, message: "Pod not found" });
//           return;
//         }

//         if (podDoc.ownerId.toString() !== user.id) {   //if stored owner is not the requesting user
//           console.log("Requesting user is not the owner")
//           res.status(403).json({ success: false, message: "Not authorized for this pod" });
//           return;
//         }
        
//         console.log("Pod auth done")
//         res.status(200).json({ success: true, message:"Authorisation successful", user });
//     }
//     catch(err){
//         console.error("Pod access denied ", err);
//         res.status(401).json({
//           success: false,
//           message: "Invalid or expired token.",
//         });
//     }
// }

export {startPod, destroyPod, getPodToken}