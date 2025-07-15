import { useEffect, useState , useRef} from "react";
import { io, Socket } from "socket.io-client";

export function useSocket(spaceId: string, podId:string): Socket | null {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!spaceId || !podId) return;

    const newSocket = io("http://localhost:3001", {
      auth: { spaceId, podId },
      withCredentials: true,
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [spaceId,podId]);

  return socket;
}