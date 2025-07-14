import { Server, Socket } from "socket.io";
import cookie from 'cookie'
import { Server as HttpServer } from "http";
import { saveToB2 } from "./services/b2storage";
import path from "path";
import { fetchDir, fetchFileContent, saveFile } from "./services/fileSystem";
import { TerminalManager } from "./services/pty";
import { deleteResourcesByPodId, authorisationWithLobby } from "./services/podControl";
import { SELF_DESTRUCT_TIME } from "./constants";

const terminalManager = new TerminalManager();
const selfDestructTimers: Map<string, NodeJS.Timeout> = new Map();

export function initWs(httpServer: HttpServer) {
    const io = new Server(httpServer, {
        cors: {
            // Should restrict this more!
            origin: "*",
            credentials:true,
            methods: ["GET", "POST"],
        },
    });
      
    io.on("connection", async (socket) => {
        console.log("User attempting to connect")

        // Authorisation with lobby:-  pod will forward the jwt accessToken which will be verified by lobby

        // const cookies = cookie.parse(socket.handshake.headers.cookie || "");
        // const accessToken = cookies.accessToken;
        // const podId = socket.handshake.auth.podId;
        const spaceId = socket.handshake.auth.spaceId;   

        // if (!accessToken || !podId || !spaceId) {
        //   console.log("Missing auth fields. Disconnecting.");
        //   socket.disconnect();
        //   terminalManager.clear(socket.id);
        //   return;
        // }

        // const isAuth = authorisationWithLobby(accessToken,podId);
        // if (!isAuth) {
        //   console.log(`Auth failed for podId=${podId}`);
        //   socket.disconnect();
        //   terminalManager.clear(socket.id);
        //   return;
        // }

        // console.log(`Authenticated and authorised: ${podId}`);    
        console.log(`User connected`);
        const podId=spaceId    //delete this line <---------------------------------

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
        }, 5*60*1000); 
        

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