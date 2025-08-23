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
import * as Y from "yjs";
import { docs, persistDoc, getYDoc, saveDebounced } from "./services/yjs";

const terminalManager = new TerminalManager(); 
const selfDestructTimers: Map<string, NodeJS.Timeout> = new Map();

// console.log("client uri : ",process.env.CLIENT_URI);

export function initWs(httpServer: HttpServer) {
    const io = new Server(httpServer, {
        cors: {
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
        try{
            const podId = socket.data.podId;
            const spaceId = socket.data.spaceId;
            
            console.log(`User connected`);

            // delete the self-destruct timer if user reconnects within given time limit
            if (selfDestructTimers.has(podId)) {
                console.log("Self-destruct timer off")
                clearTimeout(selfDestructTimers.get(podId)!);
                selfDestructTimers.delete(podId);
            }

            // console.log("Attempting to fetch directory...");
            // socket.emit("loaded", {
            //     rootContent: await fetchDir("/workspace", "")
            // });
            // console.log("Directory fetched successfully, emitting 'loaded' event.");

            initHandlers(socket, spaceId, podId);
        }
        catch(error){
            console.error(`[${socket.id}] CRITICAL ERROR in connection handler:`, error);
            // Optionally, inform the client that something went wrong
            socket.emit("load-error", { message: "Failed to initialize workspace." });
        }
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

    socket.on("request-initial-data", async ()=>{
        try{
            const rootContent = await fetchDir("/workspace", "");
            socket.emit("loaded", { rootContent });
            console.log(`[${socket.id}] 'loaded' event emitted on request.`);
        }
        catch(error){
            console.log("error fetching rootContent ", error);
        }
    })

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

    // socket.on("updateContent", async ({ path: filePath, content }: { path: string, content: string }) => {
    //     const fullPath =  `/workspace/${filePath}`;
    //     await saveFile(fullPath, content);
    //     await saveToB2(`spaces/${spaceId}`, filePath, content);
    // });

    socket.on("joinFile", async (filePath: string) => {
        try{
            console.log(`[${socket.id}] joining room: ${filePath}`);
            socket.join(filePath);

            const doc = await getYDoc(filePath);
            // Send current state to new client
            const state = Y.encodeStateAsUpdate(doc);
            console.log(`[${filePath}] Sending initial state to client. Update size: ${state.byteLength} bytes.`);
            
            socket.emit("y-update", { filePath, update: state });
        }
        catch(error){
            console.log("Error in socket.on(joinFile)")
        }
    });

    socket.on("y-update", async ({ filePath, update }: { filePath: string, update: Uint8Array }) => {
        try{
            const doc = await getYDoc(filePath);
            Y.applyUpdate(doc, update);

            // Broadcast to all other clients editing this file
            socket.to(filePath).emit("y-update", { filePath, update });

            // persist to disk/B2 periodically
            // throttle or debounce this part
            saveDebounced(filePath, doc, spaceId)
        }
        catch(error){
            console.log("Error in socket.on(y-update)")
        }
    });

    socket.on("cursorChange", (data: { filePath: string, position: any, user: any }) => {
        // Broadcast the cursor position to all other clients in the same file room.
        // We use socket.to(room) which is equivalent to socket.broadcast.to(room) here,
        // as the client-side logic should prevent a user from rendering their own cursor.
        socket.to(data.filePath).emit("cursorUpdate", data);
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