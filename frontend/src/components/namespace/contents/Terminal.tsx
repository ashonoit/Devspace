import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";

import { useCodingContext } from "../context/codingContext";

const fitAddon = new FitAddon();

function ab2str(buf: ArrayBuffer) {
    return String.fromCharCode.apply(null, Array.from(new Uint8Array(buf)));
}

const OPTIONS_TERM = {
    useStyle: true,
    screenKeys: true,
    cursorBlink: true,
    cols: 200,
    theme: {
        background: "black"
    }
};

export const TerminalComponent = () => {
    const {socket} = useCodingContext();
    if(!socket) return null;
    
    const terminalRef = useRef<HTMLDivElement | null>(null); // ✅ Typed ref

    useEffect(() => {
        if (!terminalRef.current || !socket) {
            return;
        }

        const term = new Terminal(OPTIONS_TERM);
        term.loadAddon(fitAddon);
        term.open(terminalRef.current);
        fitAddon.fit();

        function terminalHandler({ data }: { data: ArrayBuffer | string }) {
            if (data instanceof ArrayBuffer) {
                const str = ab2str(data);
                console.log(str);
                term.write(str);
            } else if (typeof data === "string") {
                term.write(data);
            }
        }

        socket.emit("requestTerminal");
        socket.on("terminal", terminalHandler);

        term.onData((data: string) => {
            socket.emit("terminalData", { data });
        });

        socket.emit("terminalData", { data: "\n" });

        return () => {
            socket.off("terminal", terminalHandler);
            term.dispose(); // Cleanup
        };
    }, [socket]);

    return (
        <div
          ref={terminalRef}
          className="w-[40vw] h-[400px] text-left"
        />
    );
};
