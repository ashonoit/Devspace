import { Request, Response } from 'express';
import { copyB2Folder } from './b2.controller';
import Space from '../models/space.model';
import Pod from '../models/pod.model';
import { startPod } from './pod.controller';

const createNewSpace = async (req: Request, res: Response): Promise<void> => {
    // console.log("req came");

    try {
        const user = req.user;
        const { title:spaceId, stack:language, description:desc } = req.body;

        if (!spaceId || !language) {
            res.status(400).json({success:false, message: "Missing required fields" });
            return;
        }

        const space = await Space.findOne({spaceId})
        if(space){
            res.status(409).json({success:false, message:"SpaceId already taken"});
            return;
        }

        //step-1 Create space document in db
        const newSpace = new Space({ 
            userId:user?.id, 
            spaceId, 
            desc, 
            language
        });
        await newSpace.save();

        console.log("Space created : ", newSpace);

        //step-2 Copy boiler code to this new spaceId in S3(currently B2)
        const B2result = await copyB2Folder(`base/${language}`, `spaces/${spaceId}`);
        // const B2result="success";   //temporary

        if(B2result!=="success"){
          await Space.deleteOne({ spaceId }); // Cleanup DB if pod creation failed
          res.status(500).json({ success: false, message: "Failed to copy boiler code. Try again." });
          return;
        }

        console.log("Copied boiler code in B2")
          
        // Step 3: Start Pod
        const podResult = await startPod(spaceId, user?._id);
        // const podResult = {success:true, podId:"logan-xcyghfbef"}     //delete this <----------------------
        if (!podResult.success) {
          
          await Space.deleteOne({ spaceId }); // Cleanup DB if pod creation failed
          res.status(500).json({ success: false, message: "Failed to start environment. Try again." });
          return;
        }
        
        console.log("Pod started")

        // Step 4: Create a new Record with pod info
        await Pod.create({
          spaceId,
          podId: podResult.podId,
          ownerId: user?.id,
          status: 'running'
        });

        console.log("Pod doc created ")
        
        //step-5 Send success response with externalId
        // console.log("Space created ", newSpace);

        res.status(200).json({
          success: true,
          message: "Project created",
          spaceId,
          podId: podResult.podId,
        });
        
    } catch (error) {
        console.error("Error in createNewSpace:", error);
        res.status(500).json({success:false, message: "Failed to create project", error: String(error) });
    }
};


const resumeSpace = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const { spaceId } = req.body;

    //Step-1 Check if given spaceId exists or not
    const space = await Space.findOne({ spaceId, userId: user?.id });
    if (!space) {
      res.status(404).json({ success: false, message: "Space not found" });
      return;
    }

    //Step-2: Start Pod again (new externalId)
    const podResult = await startPod(spaceId, user?._id);
    if (!podResult.success) {
      res.status(500).json({ success: false, message: "Failed to resume environment" });
      return;
    }

    //step-3: Create a record of running Pod in db
    await Pod.create({
      spaceId,
      podId: podResult.podId,
      ownerId: user?.id,
      status: 'running'
    });

    //step-4: Send success response with externalId
    res.status(200).json({
      success: true,
      message: "Space resumed",
      spaceId,
      podId: podResult.podId,
    });
  } catch (err) {
    console.error("Error in resumeSpace:", err);
    res.status(500).json({ success: false, message: "Failed to resume space", error: String(err) });
  }
};



export {createNewSpace, resumeSpace}