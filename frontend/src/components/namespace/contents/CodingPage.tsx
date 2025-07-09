import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { ResizablePanelGroup, ResizableHandle, ResizablePanel } from "../../ui/resizable";

import { useSocket } from "../../../hooks/useSocket";
import {File, RemoteFile,Type } from "./files/file-manager";
import { FileTree } from "./files/file-tree";
import { CodingContext } from "../context/codingContext";
import { useToggleContext } from "../context/toggleContext";


import { Filebar } from "./Filebar";
import { CodeEditor } from "./CodeEditor";
import { Output } from "./Output";
import {TerminalComponent as Terminal } from "./Terminal";
import { RightPanels } from "./RightPanels";

export const CodingPage = () => {
    // const [searchParams] = useSearchParams();
    // const spaceId = searchParams.get('spaceId') ?? '';
    const { spaceId } = useParams<{ spaceId: string }>();
    const socket = useSocket(spaceId!);
    const {isRightBarOpen, activePanel, handlePanelToggle} = useToggleContext(); 
    const panelRef = useRef<any>(null);

    const [loaded, setLoaded] = useState(false);
    const [fileStructure, setFileStructure] = useState<RemoteFile[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
    const [showOutput, setShowOutput] = useState(false);


    useEffect(() => {
        console.log("Socket initialized:");
        
        if (socket) {
            socket.on('connect_error', (err:Error) => {
                console.error('Socket connection error:', err);
            });

            socket.on('loaded', ({ rootContent }: { rootContent: RemoteFile[] }) => {
                setLoaded(true);
                setFileStructure(rootContent);

                // console.log("rootContent:-")
                // console.log(rootContent)
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

    // useEffect(() => {
    //   if (!panelRef.current) return;

    //   if (activePanel) {
    //     // console.log("expand")
    //     panelRef.current.expand?.();   // expand when there's an active panel
    //   } else {
    //     panelRef.current.collapse?.(); // collapse when none is active
    //   }
    // }, [activePanel]);

    if (!socket) return <>Connecting to socket...</>;

    if (!loaded) {
        return <>Loading...</>;
    }

    return (
        <CodingContext.Provider value={{
          socket,
          selectedFile,
          fileStructure,
          onSelect,
          setSelectedFile,
          setFileStructure
        }}>

            <div className="h-full w-full flex flex-row">
              <ResizablePanelGroup direction="horizontal">

                  <ResizablePanel id="file-tree" order={1} defaultSize={15} minSize={10} maxSize={30}>
                    {/* <div className="flex h-full w-[250px] border-r border-r-zinc-700"> */}
                      {/* <span className="font-semibold text-zinc-200">Files</span>      */}
                      <Filebar/>
                    {/* </div> */}
                  </ResizablePanel>

                  <ResizableHandle className="bg-zinc-700 "/>

                  <ResizablePanel id="xyz" order={2} defaultSize={85}>

                    <ResizablePanelGroup
                      direction="horizontal"
                      className=" md:min-w-[450px] bg-zinc-900"
                    >
                        <ResizablePanel id="code-editor" order={3} defaultSize={60} minSize={30} >
                            {/* <div className="flex h-full items-center justify-center p-6">
                                    <span className="font-semibold text-zinc-200">Code</span>
                            </div> */}
                            <CodeEditor/>
                            
                        </ResizablePanel>
                            
                        <ResizableHandle withHandle className="bg-zinc-700 "/>
                            
                        {isRightBarOpen && 
                          <ResizablePanel id="right-bar" order={4} defaultSize={40} minSize={20}>
                          
                              <div className="bg-neutral-300 dark:bg-neutral-900 h-8 w-full">
                                  <div className="flex flex-row h-full">
                                      <button onClick={()=>handlePanelToggle("output")} className="h-full text-xs min-w-20 px-2 pb-0.5 flex flex-col cursor-pointer hover:bg-zinc-500/25 items-center justify-center text-zinc-800 dark:text-zinc-300 border-r border-r-zinc-400 dark:border-r-zinc-700">
                                          Output
                                      </button>
                        
                                      <button onClick={()=>handlePanelToggle("ask")} className="h-full text-xs min-w-20 px-2 pb-0.5 flex flex-col cursor-pointer hover:bg-zinc-500/25 items-center justify-center text-zinc-800 dark:text-zinc-300 border-r border-r-zinc-400 dark:border-r-zinc-700">
                                          Ask AI
                                      </button>
                                  </div>
                              </div>
                        
                              <ResizablePanelGroup direction="vertical">
                        
                                  {activePanel && 
                                    <>
                                      <ResizablePanel id="right-panels" order={5} collapsible collapsedSize={0} ref={panelRef} defaultSize={35} >
                                        <RightPanels/>
                                      </ResizablePanel> 
                                    </>
                                  }            

                                  <ResizableHandle className="bg-zinc-700"/>
                                
                                  <ResizablePanel id="terminal" order={6} defaultSize={65}>
                                    {/* <div className="flex h-full items-center justify-center p-6">
                                      <span className="font-semibold text-zinc-200">Terminal</span>
                                    </div> */}
                                    <div>
                                      <Terminal/>
                                    </div>
                                    
                                    
                                  </ResizablePanel>
                              </ResizablePanelGroup>
                                    
                          </ResizablePanel>
                        }
                    </ResizablePanelGroup>

                </ResizablePanel>

              </ResizablePanelGroup>
            </div>
        
            
        </CodingContext.Provider>
    );

};