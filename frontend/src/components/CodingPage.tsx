import { useEffect, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import { Editor } from './Editor';
import { File, RemoteFile, Type } from './external/editor/utils/file-manager';
import { useSearchParams, useParams } from 'react-router-dom';
import { Output } from './Output';
import { TerminalComponent as Terminal } from './Terminal';
import axios from 'axios'; 

function useSocket(spaceId: string): Socket | null {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        if (!spaceId) return;

        const newSocket = io(`ws://localhost:3001`,{
            auth: { spaceId }
        });
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [spaceId]);

    return socket;
}


export const CodingPage = () => {
    const [podCreated, setPodCreated] = useState(false);
    // const [searchParams] = useSearchParams();
    // const spaceId = searchParams.get('spaceId') ?? '';
    const { spaceId } = useParams<{ spaceId: string }>();
    
    useEffect(() => {
        if (spaceId) {
            // axios.post(`http://localhost:3002/start`, { spaceId })
            //     .then(() => setPodCreated(true))
            //     .catch((err : Error) => console.error(err));

            setPodCreated(true)
        }
    }, []);

    if (!podCreated) {
        return <>Booting...</>
    }
    return <CodingPagePostPodCreation />

}

export const CodingPagePostPodCreation = () => {
    // const [searchParams] = useSearchParams();
    // const spaceId = searchParams.get('spaceId') ?? '';
    const { spaceId } = useParams<{ spaceId: string }>();

    const [loaded, setLoaded] = useState(false);
    const socket = useSocket(spaceId!);
    const [fileStructure, setFileStructure] = useState<RemoteFile[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
    const [showOutput, setShowOutput] = useState(false);

    useEffect(() => {
        console.log("Socket initialized:", socket);
        
        if (socket) {
            socket.on('connect_error', (err:Error) => {
                console.error('Socket connection error:', err);
            });

            socket.on('loaded', ({ rootContent }: { rootContent: RemoteFile[] }) => {
                setLoaded(true);
                setFileStructure(rootContent);
            });
        }
    }, [socket]);

    const onSelect = (file: File) => {
        if (!socket) return;

        if (file.type === Type.DIRECTORY) {
            socket.emit("fetchDir", file.path, (data: RemoteFile[]) => {
                setFileStructure(prev => {
                    const allFiles = [...prev, ...data];
                    return allFiles.filter((file, index, self) =>
                        index === self.findIndex(f => f.path === file.path)
                    );
                });
            });
        } else {
            socket.emit("fetchContent", { path: file.path }, (data: string) => {
                file.content = data;
                setSelectedFile(file);
            });
        }
    };

    if (!socket) return <>Connecting to socket...</>;

    if (!loaded) {
        return <>Loading...</>;
    }

    return (
      <div className="flex flex-col w-full">
        <div className="flex justify-end p-2">
          <button className="text-amber-500 dark:text-blue-300" onClick={() => setShowOutput(!showOutput)}>
            See output
          </button>
        </div>
        <div className="flex text-base w-full">
          <div className="w-[60%] ">
            <Editor socket={socket} selectedFile={selectedFile} onSelect={onSelect} files={fileStructure} />
          </div>

          <div className="w-[40%] ">
            <div className={`${showOutput ? "h-[40vh]" : "h-0"} overflow-hidden transition-all duration-200`}>
              {showOutput && <Output />}
            </div>
            <div className="flex-1 overflow-auto bg-black">
              <Terminal socket={socket} />
            </div>
          </div>
        </div>
      </div>
    );

};

