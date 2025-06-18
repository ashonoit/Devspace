import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { saveToB2 } from "./b2";
import path from "path";
import { fetchDir, fetchFileContent, saveFile } from "./fs";
import { TerminalManager } from "./pty";
import { deleteResourcesBySpaceId } from "./podControl";
import { SELF_DESTRUCT_TIME } from "./constants";

const terminalManager = new TerminalManager();
const selfDestructTimers: Map<string, NodeJS.Timeout> = new Map();

export function initWs(httpServer: HttpServer) {
    const io = new Server(httpServer, {
        cors: {
            // Should restrict this more!
            origin: "*",
            methods: ["GET", "POST"],
        },
    });
      
    io.on("connection", async (socket) => {
        // Auth checks should happen here
        const spaceId = socket.handshake.auth.spaceId;   ///for testing envrironment

        // const host = socket.handshake.headers.host;

        // console.log(`host is ${host}`);
        // Split the host by '.' and take the first part as spaceId

        // const spaceId = host?.split('.')[0];
    
        console.log(`User connected`);

        if (!spaceId) {
            socket.disconnect();
            terminalManager.clear(socket.id);
            return;
        }

        // delete the self-destruct timer if user reconnects within given time limit
        if (selfDestructTimers.has(spaceId)) {
            console.log("Self-destruct timer off")
            clearTimeout(selfDestructTimers.get(spaceId)!);
            selfDestructTimers.delete(spaceId);
        }

        socket.emit("loaded", {
            rootContent: await fetchDir("/workspace", "")
        });

        initHandlers(socket, spaceId);
    });
}

function initHandlers(socket: Socket, spaceId: string) {

    socket.on("disconnect", () => {
        console.log("user disconnected");

        const timer = setTimeout(async () => {
            console.log(`Deleting resources for spaceId: ${spaceId}`);
    
            try {
                await deleteResourcesBySpaceId(spaceId);
                console.log(`Resources for ${spaceId} deleted`);
            } catch (err) {
                console.error(`Failed to delete resources for ${spaceId}`, err);
            }
    
            selfDestructTimers.delete(spaceId);
            terminalManager.clear(socket.id);
        }, 5*60*1000); 
        

        selfDestructTimers.set(spaceId, timer);
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