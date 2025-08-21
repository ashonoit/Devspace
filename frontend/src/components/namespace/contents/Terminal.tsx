import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";

import { useCodingContext } from "../context/codingContext";

import '@xterm/xterm/css/xterm.css';

export const fitAddon = new FitAddon();

function ab2str(buf: ArrayBuffer) {
    return String.fromCharCode.apply(null, Array.from(new Uint8Array(buf)));
}

const OPTIONS_TERM = {
    useStyle: true,
    screenKeys: true,
    cursorBlink: true,
    // cols: 200,
    scrollback: 200,
    theme: {
        background: "transparent",
    },
    allowTransparency: true,   
    allowProposedApi: true,
    fontSize: 14,
    fontFamily: "monospace",
};

export const TerminalComponent = () => {
    const {socket} = useCodingContext();
    if(!socket) return null;
    
    const terminalRef = useRef<HTMLDivElement | null>(null); 
    const termRef = useRef<Terminal | null>(null);

    useEffect(() => {
        if (!terminalRef.current || !socket) {
            return;
        }

        const term = new Terminal(OPTIONS_TERM);
        term.loadAddon(fitAddon);
        term.open(terminalRef.current);

        requestAnimationFrame(() => {
          fitAddon.fit();
        });
        // fitAddon.fit();

        termRef.current = term;
        
        // term.onScroll((pos) => {
        //   console.log("Scrolled to:", pos);
        // });
        // term.focus();

        function terminalHandler({ data }: { data: ArrayBuffer | string }) {
            if (data instanceof ArrayBuffer) {
                const str = ab2str(data);
                // console.log(str);
                term.write(str);
            } else if (typeof data === "string") {
                term.write(data);
                // console.log(data)
            }
        }

        socket.emit("requestTerminal");
        socket.on("terminal", terminalHandler);

        term.onData((data: string) => {
            socket.emit("terminalData", { data });
            // console.log(data)
            term.scrollToBottom();
        });

        socket.emit("terminalData", { data: "clear\n" });

        const observer = new ResizeObserver(() => {
          fitAddon.fit();
        });
    
        observer.observe(terminalRef.current);

        return () => {
            socket.off("terminal", terminalHandler);
            term.dispose(); // Cleanup
            // console.log("terminal off")
        };
    }, [socket]);

    // update theme dynamically

    return (
        <div
          ref={terminalRef}
          className="w-full h-full bg-zinc-500 dark:bg-zinc-900 overflow-hidden pl-2"
            style={{ height: "calc(100% - 80px)" }}
        />
    );
};
