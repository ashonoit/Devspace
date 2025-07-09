import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket(spaceId: string): Socket | null {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!spaceId) return;

    const newSocket = io("ws://localhost:3001", {
      auth: { spaceId }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [spaceId]);

  return socket;
}