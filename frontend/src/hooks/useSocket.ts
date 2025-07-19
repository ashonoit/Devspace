import { useEffect, useState , useRef} from "react";
import { io, Socket } from "socket.io-client";

export function useSocket(spaceId: string, podId:string, podToken:string): Socket | null {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!spaceId || !podId || !podToken) return;

    const newSocket = io(`ws://${podId}.${import.meta.env.VITE_MINIKUBE_IP}.sslip.io`, {
      auth: { spaceId, podId , podToken},
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [spaceId,podId,podToken]);

  return socket;
}