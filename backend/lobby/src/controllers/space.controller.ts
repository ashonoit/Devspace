import { Request, Response } from 'express';
import { copyB2Folder } from './b2.controller';

const createNewSpace = async (req: Request, res: Response): Promise<void> => {
    // console.log("req came");

    try {
        const { spaceId, language } = req.body;

        if (!spaceId || !language) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }
        
        // const result="success";
        const result = await copyB2Folder(`base/${language}`, `spaces/${spaceId}`);

        if (result === "success") {
            res.status(200).json({ message: "Project created" });
        } else {
            res.status(500).json({ message: "Failed to create project" });
        }
    } catch (error) {
        console.error("Error in createNewSpace:", error);
        res.status(500).json({ message: "Failed to create project", error: String(error) });
    }
};

export {createNewSpace}