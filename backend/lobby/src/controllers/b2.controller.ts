import { S3Client, CreateBucketCommand, PutObjectCommand, CopyObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
// console.log(process.env.S3_REGION);

const s3 = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
});

const copyB2Folder= async (sourcePrefix:string, destinationPrefix: string, continuationToken?:string):Promise<"success" | "error"> =>{
    try{
        const listObjectCommand = new ListObjectsV2Command({
            Bucket: process.env.S3_BUCKET ?? "",
            Prefix: sourcePrefix,
            ContinuationToken: continuationToken
        })

        const listedObjects = await s3.send(listObjectCommand);

        if(!listedObjects.Contents || listedObjects.Contents.length===0) return "success";

        for (const object of listedObjects.Contents) {
            if (!object.Key) continue;
      
            const destinationKey = object.Key.replace(sourcePrefix, destinationPrefix);
      
            const copyCommand = new CopyObjectCommand({
              Bucket: process.env.S3_BUCKET,
              CopySource: `/${process.env.S3_BUCKET}/${object.Key}`,
              Key: destinationKey,
            });
      
            await s3.send(copyCommand);
            console.log(`Copied ${object.Key} ➜ ${destinationKey}`);
        }

        // Handle pagination if the list is truncated
        if (listedObjects.IsTruncated) {
            const nextToken = listedObjects.NextContinuationToken;
            await copyB2Folder(sourcePrefix, destinationPrefix, nextToken);
        }

        return "success";
    }
    catch(err){
        console.log("Error in copyB2Folder ", err);
        return "error";
    }
}

const saveToB2 = async (key: string, content: string): Promise<void> => {
    try {
        const params = {
            Bucket: process.env.S3_BUCKET ?? "",
            Key: key,
            Body: content
        };

        await s3.send(new PutObjectCommand(params)); // Upload the file to B2
        console.log(`File saved to ${key}`);
    } catch (error) {
        console.error('Error saving file:', error);
    }
}

export {copyB2Folder, saveToB2}