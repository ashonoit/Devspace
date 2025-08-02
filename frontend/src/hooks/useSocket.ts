// import { useEffect, useState , useRef} from "react";
// import { io, Socket } from "socket.io-client";

// export function useSocket(spaceId: string, podId:string, podToken:string): Socket | null {
//   const [socket, setSocket] = useState<Socket | null>(null);

//   useEffect(() => {
//     if (!spaceId || !podId || !podToken) return;

//     const newSocket = io(`ws://${podId}.${import.meta.env.VITE_MINIKUBE_IP}.sslip.io`, {
//       auth: { spaceId, podId , podToken},
//     });

//     setSocket(newSocket);

//     return () => {
//       newSocket.disconnect();
//     };
//   }, [spaceId,podId,podToken]);

//   return socket;
// }

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket(spaceId: string, podId: string, podToken: string): Socket | null {
  const [socket, setSocket] = useState<Socket | null>(null);
  const retryCount = useRef(0);
  const maxRetries = 9;

  useEffect(() => {
    if (!spaceId || !podId || !podToken) return;

    let currentSocket: Socket | null = null;
    let isCancelled = false;

    const connectWithRetry = () => {
      const delay = Math.min(1000 * 2 ** retryCount.current, 300000); // exponential backoff with cap

      currentSocket = io(`ws://${podId}.${import.meta.env.VITE_MINIKUBE_IP}.sslip.io`, {
        auth: { spaceId, podId, podToken },
        autoConnect: false, // we will manually control connection
        reconnection: false // we handle it manually
      });

      currentSocket.connect();

      currentSocket.on("connect", () => {
        if (!isCancelled) {
          retryCount.current = 0;
          setSocket(currentSocket);
          console.log("Socket connected");
        }
      });

      currentSocket.on("connect_error", (err: any) => {
        console.warn(`Socket connect error:`, err?.message || err);
        if (!isCancelled && retryCount.current < maxRetries) {
          retryCount.current++;
          setTimeout(() => connectWithRetry(), delay);
        }
      });
    };

    connectWithRetry();

    return () => {
      isCancelled = true;
      if (currentSocket) {
        currentSocket.disconnect();
      }
    };
  }, [spaceId, podId, podToken]);

  return socket;
}
