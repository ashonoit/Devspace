import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { copyB2Folder } from './b2.controller';
import Space from '../models/space.model';
import Pod from '../models/pod.model';
import RecentVisit from '../models/recentVisit.model';

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
        const podResult = await startPod(spaceId, user?.id);
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

        await updateRecentVisit(user?.id, newSpace._id as any);

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

    await updateRecentVisit(user?.id, space._id as any);

    const pod = await Pod.findOne({spaceId, status:"running"})

    if(pod){
      res.status(200).json({
        success:true,
        message:"Pod already exists with this spaceId, redirecting",
        spaceId,
        podId:pod.podId
      })
      return;
    }

    //Step-2: Start Pod again (new externalId)
    const podResult = await startPod(spaceId, user?.id);
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

const getRecentVisits = async (req:Request, res:Response):Promise<void> => {
  try{
    const user = req.user;
    const recentVisits = await RecentVisit.aggregate([
      // 1. Match by userId
      {
        $match: { userId: new mongoose.Types.ObjectId(user?.id) }
      },
      // 2. Sort by lastVisit descending
      {
        $sort: { lastVisit: -1 }
      },
      // 3. Lookup to join with Space collection
      {
        $lookup: {
          from: 'spaces',                  // collection name in MongoDB (usually lowercase plural)
          localField: 'spaceDocId',
          foreignField: '_id',
          as: 'space'
        }
      },
      // 4. Unwind the joined space array
      {
        $unwind: '$space'
      },
      // 5. Project the desired fields
      {
        $project: {
          _id: 0,
          spaceId: '$space.spaceId',
          language: '$space.language',
          lastVisit: '$lastVisit'
        }
      }
    ]);

    res.status(200).json({success:true, message:"Sent recently visited spaces as res.data.recentVisits", recentVisits}, )
  }
  catch(err){
    console.log("Error in fetching recently visited spaces : ", err);
    res.status(500).json({success:false, message:"Server failed to get recently visited spaces"});
  }
}

const updateRecentVisit = async (userId:string|undefined, spaceDocId:string) =>{
  try{
    await RecentVisit.updateOne(
      { userId, spaceDocId },                        // filter
      { $set: { lastVisit: new Date() } },        // update
      { upsert: true }                            // insert if not found
    );
  }
  catch(err){
    console.error("Error updating recent visit:", err);
  }
}



export {createNewSpace, resumeSpace, getRecentVisits}