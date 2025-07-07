import { Request, Response } from 'express';
import { copyB2Folder } from './b2.controller';
import Space from '../models/space.model';

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
            const newSpace = new Space({ 
                userId:user?.id, 
                spaceId, 
                desc, 
                language
            });
            await newSpace.save();

            console.log("Space created ", newSpace);

            res.status(200).json({success:true, message: "Project created", spaceId});
        } else {
            res.status(500).json({success:false, message: "Failed to create project" });
        }
    } catch (error) {
        console.error("Error in createNewSpace:", error);
        res.status(500).json({success:false, message: "Failed to create project", error: String(error) });
    }
};

export {createNewSpace}