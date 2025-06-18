import { S3Client, PutObjectCommand, CopyObjectCommand, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { SELF_DESTRUCT_TIME } from "./constants";

const s3 = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,

    // defaultsMode: "legacy",   //to remove checksum errors
});

// s3.middlewareStack.remove("flexibleChecksumsMiddleware");

export const fetchB2Folder = async (key: string, localPath: string): Promise<void> => {
    const params = {
        Bucket: process.env.S3_BUCKET ?? "",
        Prefix: key,

        ChecksumAlgorithm: undefined,
    }

    const listedObjects = await s3.send(new ListObjectsV2Command(params));
    if (listedObjects.Contents) {
        for (const file of listedObjects.Contents) {
            const fileKey = file.Key;
            if (fileKey) {
                const getParams = {
                    Bucket: process.env.S3_BUCKET ?? "",
                    Key: fileKey,
                    ChecksumAlgorithm: undefined,
                };
                const data = await s3.send(new GetObjectCommand(getParams));
                if (data.Body) {
                    const fileData = await streamToBuffer(data.Body as any);
                    const filePath = `${localPath}/${fileKey.replace(key, "")}`;
                    await writeFile(filePath, fileData);
                }
            }
        }
    }
};

export const copyB2Folder = async (sourcePrefix: string, destinationPrefix: string, continuationToken?: string): Promise<void> => {
    try {
        const listParams = {
            Bucket: process.env.S3_BUCKET ?? "",
            Prefix: sourcePrefix,
            ContinuationToken: continuationToken,

            ChecksumAlgorithm: undefined,
        };

        const listedObjects = await s3.send(new ListObjectsV2Command(listParams));

        if (!listedObjects.Contents || listedObjects.Contents.length === 0) return;

        for (const object of listedObjects.Contents) {
            if (!object.Key) continue;
            let destinationKey = object.Key.replace(sourcePrefix, destinationPrefix);
            let copyParams = {
                Bucket: process.env.S3_BUCKET ?? "",
                CopySource: `/${process.env.S3_BUCKET}/${object.Key}`,
                Key: destinationKey,

                ChecksumAlgorithm: undefined,
            };

            await s3.send(new CopyObjectCommand(copyParams));
            console.log(`Copied ${object.Key} to ${destinationKey}`);
        }

        if (listedObjects.IsTruncated) {
            const nextToken = listedObjects.NextContinuationToken;
            await copyB2Folder(sourcePrefix, destinationPrefix, nextToken);
        }
    } catch (error) {
        console.error('Error copying folder:', error);
    }
};

function writeFile(filePath: string, fileData: Buffer): Promise<void> {
    return new Promise(async (resolve, reject) => {
        await createFolder(path.dirname(filePath));

        fs.writeFile(filePath, fileData, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function createFolder(dirName: string) {
    return new Promise<void>((resolve, reject) => {
        fs.mkdir(dirName, { recursive: true }, (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

function streamToBuffer(stream: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: any[] = [];
        stream.on("data", (chunk: any) => chunks.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", reject);
    });
}

export const saveToB2 = async (key: string, filePath: string, content: string): Promise<void> => {
    const params = {
        Bucket: process.env.S3_BUCKET ?? "",
        Key: `${key}${filePath}`,
        Body: content,
        ChecksumAlgorithm: undefined, //  Prevents 'x-amz-checksum-crc32' error
    };

    await s3.send(new PutObjectCommand(params));
};
