import { useEffect, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import { Editor } from './Editor';
import { File, RemoteFile, Type } from './external/editor/utils/file-manager';
import { useSearchParams } from 'react-router-dom';
import styled from '@emotion/styled';
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


const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end; /* Aligns children (button) to the right */
  padding: 10px; /* Adds some space around the button */
`;

const Workspace = styled.div`
  display: flex;
  margin: 0;
  font-size: 16px;
  width: 100%;
`;

const LeftPanel = styled.div`
  flex: 1;
  width: 60%;
`;

const RightPanel = styled.div`
  flex: 1;
  width: 40%;
`;


export const CodingPage = () => {
    const [podCreated, setPodCreated] = useState(false);
    const [searchParams] = useSearchParams();
    const spaceId = searchParams.get('spaceId') ?? '';
    
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
    const [searchParams] = useSearchParams();
    const spaceId = searchParams.get('spaceId') ?? '';
    const [loaded, setLoaded] = useState(false);
    const socket = useSocket(spaceId);
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
        <Container>
            <ButtonContainer>
                <button onClick={() => setShowOutput(!showOutput)}>See output</button>
            </ButtonContainer>
            <Workspace>
                <LeftPanel>
                    <Editor socket={socket} selectedFile={selectedFile} onSelect={onSelect} files={fileStructure} />
                </LeftPanel>
                <RightPanel>
                    {showOutput && <Output />}
                    <Terminal socket={socket} />
                </RightPanel>
            </Workspace>
        </Container>
    );
};

