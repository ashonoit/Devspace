import { Request, Response } from 'express';
import { copyB2Folder } from './b2.controller';
import Space from '../models/space.model';
import Pod from '../models/pod.model';
import axios from 'axios';
import {v4 as uuidv4} from 'uuid';

const createNewSpace = async (req: Request, res: Response): Promise<void> => {
    // console.log("req came");

    try {
        const user = req.user;
        const { title:spaceId, stack:language, description:desc } = req.body;

        if (!spaceId || !language) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }

        const space = await Space.findOne({spaceId})
        if(space){
            res.status(409).json({success:false, message:"SpaceId already taken"});
            return;
        }
        
        const result="success";
        // const result = await copyB2Folder(`base/${language}`, `spaces/${spaceId}`);

        if (result === "success") {
            //step-1 : Create new Space record in db
            const newSpace = new Space({ 
                userId:user?.id, 
                spaceId, 
                desc, 
                language
            });
            await newSpace.save();

            console.log("Space created ", newSpace);

            // Step 2: Start Pod
            const podResult = await startPod(spaceId, user?._id);
            if (!podResult.success) {
              
              await Space.deleteOne({ spaceId }); // Cleanup DB if pod creation failed
              res.status(500).json({ success: false, message: "Failed to start environment. Try again." });
              return;
            }
            
            // Step 3: Create a new Record with pod info
            await Pod.create({
              spaceId,
              externalId: podResult.externalId,
              ownerId: user?.id,
              status: 'running'
            });

             res.status(200).json({
              success: true,
              message: "Project created",
              spaceId,
              externalId: podResult.externalId,
            });

            // res.status(200).json({success:true, message: "Project created", spaceId});
        } else {
            res.status(500).json({success:false, message: "Failed to create project" });
        }
    } catch (error) {
        console.error("Error in createNewSpace:", error);
        res.status(500).json({success:false, message: "Failed to create project", error: String(error) });
    }
};


const resumeSpace = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const { spaceId } = req.body;

    const space = await Space.findOne({ spaceId, userId: user?.id });
    if (!space) {
      res.status(404).json({ success: false, message: "Space not found" });
      return;
    }

    // Start Pod again (new externalId)
    const podResult = await startPod(spaceId, user?._id);
    if (!podResult.success) {
      res.status(500).json({ success: false, message: "Failed to resume environment" });
      return;
    }

    await Pod.create({
      spaceId,
      externalId: podResult.externalId,
      ownerId: user?.id,
      status: 'running'
    });

    res.status(200).json({
      success: true,
      message: "Space resumed",
      spaceId,
      externalId: podResult.externalId,
    });
  } catch (err) {
    console.error("Error in resumeSpace:", err);
    res.status(500).json({ success: false, message: "Failed to resume space", error: String(err) });
  }
};




const startPod = async (spaceId: string, userId: string) => {
  const externalId = `${spaceId}-${uuidv4()}`;

  try {
    const res = await axios.post("http://localhost:3002/start", { spaceId, externalId });
    
    if (res.status === 200 || res.status === 201) {
      return { success: true, externalId };
    } else {
      return { success: false };
    }
  } catch (err:any) {
    console.error("Failed to start pod:", err?.message);
    return { success: false };
  }
};

export {createNewSpace}