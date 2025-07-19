import { Server, Socket } from "socket.io";
import { ExtendedError } from "socket.io";
import * as cookie from 'cookie'
import { Server as HttpServer } from "http";
import { saveToB2 } from "./services/b2storage";
import path from "path";
import { fetchDir, fetchFileContent, saveFile } from "./services/fileSystem";
import { TerminalManager } from "./services/pty";
import { deleteResourcesByPodId, authWithJWT } from "./services/podControl";
import { SELF_DESTRUCT_TIME } from "./constants";

const terminalManager = new TerminalManager();
const selfDestructTimers: Map<string, NodeJS.Timeout> = new Map();

console.log("client uri : ",process.env.CLIENT_URI);

export function initWs(httpServer: HttpServer) {
    const io = new Server(httpServer, {
        cors: {
            // Should restrict this more!
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    // const io = new Server(httpServer, {
    //     cors: {
    //         // Should restrict this more!
    //         credentials: true,
    //         origin: process.env.CLIENT_URI,
    //         methods: ["GET", "POST"],
    //     },
    // });

    io.use(async (socket, next) => {
        try {
            console.log("User attempting to connect")
            // Authorisation with lobby:-  pod will forward the jwt accessToken which will be verified by lobby
            // const cookies = cookie.parse(socket.handshake.headers.cookie || "");
            const podToken = socket.handshake.auth.podToken;
            const podId = socket.handshake.auth.podId;
            const spaceId = socket.handshake.auth.spaceId;

            const err: ExtendedError = {    
                name: "SocketAuthError",
                message: "Unauthorized",
            };


            const isAuth = await authWithJWT(podToken, podId);
            if (!isAuth) {
                console.log("Socket auth failed: Lobby denied");
                return next(err);
                // return next(new Error("Unauthorized"));
            }

            // Attach data for use later
            socket.data.podId = podId;
            socket.data.spaceId = spaceId;
            next();
        } catch (err) {
            next(new Error("Internal error"));
        }
    });
      
    io.on("connection", async (socket) => {
        
        const podId = socket.data.podId;
        const spaceId = socket.data.spaceId;
 
        console.log(`User connected`);

        // delete the self-destruct timer if user reconnects within given time limit
        if (selfDestructTimers.has(podId)) {
            console.log("Self-destruct timer off")
            clearTimeout(selfDestructTimers.get(podId)!);
            selfDestructTimers.delete(podId);
        }

        socket.emit("loaded", {
            rootContent: await fetchDir("/workspace", "")
        });

        initHandlers(socket, spaceId, podId);
    });
}

function initHandlers(socket: Socket, spaceId: string, podId:string) {

    socket.on("disconnect", () => {
        console.log("user disconnected");

        const timer = setTimeout(async () => {
            console.log(`Deleting resources for spaceId: ${podId}`);
    
            try {
                await deleteResourcesByPodId(podId, spaceId);
                console.log(`Resources for podId:${podId} deleted`);
            } catch (err) {
                console.error(`Failed to delete resources for podId:${podId}`, err);
            }
    
            selfDestructTimers.delete(podId);
            terminalManager.clear(socket.id);
        }, 30*60*1000); 
        

        selfDestructTimers.set(podId, timer);
    });

    socket.on("fetchDir", async (dir: string, callback) => {
        const dirPath = `/workspace/${dir}`;
        const contents = await fetchDir(dirPath, dir);
        callback(contents);
    });

    socket.on("fetchContent", async ({ path: filePath }: { path: string }, callback) => {
        const fullPath = `/workspace/${filePath}`;
        const data = await fetchFileContent(fullPath);
        callback(data);
    });

    // TODO: contents should be diff, not full file
    // Should be validated for size
    // Should be throttled before updating S3 (or use an S3 mount)
    socket.on("updateContent", async ({ path: filePath, content }: { path: string, content: string }) => {
        const fullPath =  `/workspace/${filePath}`;
        await saveFile(fullPath, content);
        await saveToB2(`spaces/${spaceId}`, filePath, content);
    });

    socket.on("requestTerminal", async () => {
        terminalManager.createPty(socket.id, spaceId, (data:string, id:number) => {
            socket.emit('terminal', {
                data: Buffer.from(data,"utf-8")
            });
        });
    });
    
    socket.on("terminalData", async ({ data }: { data: string, terminalId: number }) => {
        terminalManager.write(socket.id, data);
    });

}