import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { ResizablePanelGroup, ResizableHandle, ResizablePanel } from "../../ui/resizable";

import { useSocket } from "../../../hooks/useSocket";
import { usePodToken } from "../../../hooks/usePodToken";
import {File, RemoteFile,Type } from "./files/file-manager";
import { CodingContext } from "../context/codingContext";
import { useToggleContext } from "../context/toggleContext";
import { fitAddon } from "./Terminal";


import { Filebar } from "./Filebar";
import { CodeEditor } from "./CodeEditor";
import {TerminalComponent as Terminal } from "./Terminal";
import { RightPanels } from "./RightPanels";

import * as Y from "yjs";

export const CodingPage = () => {
    const { spaceId , podId} = useParams<{ spaceId: string, podId:string }>();
    if (!spaceId || !podId) {
      return <div>Missing parameters in URL</div>;
    }

    const { podToken, loading:loadingToken, error:errorToken } = usePodToken(spaceId!, podId!);

    const socket = useSocket(spaceId!, podId!, podToken!);   //major step <=================================
    const {isRightBarOpen, activePanel, handlePanelToggle} = useToggleContext(); 
    const panelRef = useRef<any>(null);

    const [loaded, setLoaded] = useState(false);
    const [fileStructure, setFileStructure] = useState<RemoteFile[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);

        // Yjs state management
    const [activeDoc, setActiveDoc] = useState<Y.Doc | null>(null);
    const yDocsRef = useRef<Map<string, Y.Doc>>(new Map());

    const [initialContent, setInitialContent] = useState<string | undefined>(undefined);
    const [isDocPopulated, setIsDocPopulated] = useState(false);



    useEffect(() => {
        console.log("Socket initialized:");
        if(!socket) return;
        console.log("here")

        
        
        socket.on('connect_error', (err:Error) => {
            console.error('Socket connection error:', err);
        });
        
        socket.on('loaded', ({ rootContent }: { rootContent: RemoteFile[] }) => {
            setLoaded(true);
            setFileStructure(rootContent);
            // console.log("rootContent:-")
            // console.log(rootContent)
        });

        socket.on('y-update', ({filePath, update} : {filePath:string, update: Uint8Array})=>{

          // const normalizedPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
          console.log(`[CLIENT] Received 'y-update' for ${filePath}. Update size: ${update.byteLength} bytes.`);


          const doc = yDocsRef.current.get(filePath);
          if(doc){
            // Apply the remote update to the local doc
            // The 'server' origin prevents this change from being re-emitted
            console.log("Applying update")
            Y.applyUpdate(doc, new Uint8Array(update), 'server');

            const textContent = doc.getText("monaco").toString();
            if (initialContent === undefined) {
                    setInitialContent(textContent);
            }
            setIsDocPopulated(true)
          }
        })

        //fetch the file content on request
        socket.emit("request-initial-data");

        return ()=>{
          socket.off('connect_error');
          socket.off('loaded');
          socket.off('y-update');
        }
        
    }, [socket]);

    useEffect(()=>{
      if(!socket || !activeDoc || !selectedFile) return;

      const updateHandler = (update:Uint8Array, origin:any) =>{
        if(origin!='server'){
          socket.emit('y-update', {
            filePath: selectedFile.path,
            update:update
          })
        }
      }

      activeDoc.on('update', updateHandler);

      return () => {
            activeDoc.off('update', updateHandler);
      };
    }, [activeDoc, socket, selectedFile])

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
            setIsDocPopulated(false); //<--------------- debugging
            setSelectedFile(file);
            let doc = yDocsRef.current.get(file.path);
            console.log("On select file.path : ", file.path);

            if(!doc){
              doc = new Y.Doc();
              yDocsRef.current.set(file.path, doc);
            }

            setActiveDoc(doc);
            
            socket.emit('joinFile', file.path);
        }
    };

    // const resizeXterm = () => {
    //     setTimeout(() => {
    //       console.log("resizing")
    //       fitAddon.fit();

    //     }, 100);
    // }

    const resizeXterm = () => {
        requestAnimationFrame(() => {
        // console.log("resizing ok")
        fitAddon.fit();
      });
    };


    if (!socket) return <>Connecting to socket...</>;

    if (!loaded) {
        return <div className="text-zinc-800 dark:text-zinc-200">Loading...</div>;
    }

    return (
        <CodingContext.Provider value={{
          socket,
          selectedFile,
          fileStructure,
          onSelect,
          setSelectedFile,
          setFileStructure,
          activeDoc,
          initialContent,
          isDocPopulated
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
                      onLayout={() => resizeXterm()}
                    >
                        <ResizablePanel id="code-editor" order={3} defaultSize={60} minSize={30} >
                            {/* <div className="flex h-full items-center justify-center p-6">
                                    <span className="font-semibold text-zinc-200">Code</span>
                            </div> */}
                            <CodeEditor/>
                            
                        </ResizablePanel>
                            
                        <ResizableHandle withHandle className=""/>
                            
                        {true && 
                          <ResizablePanel id="right-bar" order={4} defaultSize={40} minSize={20}
                                          className={isRightBarOpen ? "block" : "hidden"}
                          >
                          
                              <div className="bg-neutral-300 dark:bg-neutral-900 h-8 w-full border-b border-b-zinc-700">
                                  <div className="flex flex-row h-full">
                                      <button onClick={()=>{handlePanelToggle("output"); resizeXterm()}} className={`${activePanel==="output"? "bg-zinc-500/50":""} h-full text-xs min-w-20 px-2 pb-0.5 flex flex-col cursor-pointer hover:bg-zinc-500/25 items-center justify-center text-zinc-800 dark:text-zinc-300 border-r border-r-zinc-400 dark:border-r-zinc-700`}>
                                          Output
                                      </button>
                        
                                      <button onClick={()=>{handlePanelToggle("ask"); resizeXterm()}} className={`${activePanel==="ask"? "bg-zinc-500/40":""} h-full text-xs min-w-20 px-2 pb-0.5 flex flex-col cursor-pointer hover:bg-zinc-500/25 items-center justify-center text-zinc-800 dark:text-zinc-300 border-r border-r-zinc-400 dark:border-r-zinc-700`}>
                                          Ask AI
                                      </button>
                                  </div>
                              </div>
                        
                              <ResizablePanelGroup direction="vertical" 
                                                    onLayout={()=>resizeXterm()}
                              >
                        
                                  {activePanel && 
                                    <>
                                      <ResizablePanel id="right-panels" order={5} collapsible collapsedSize={0} ref={panelRef} defaultSize={35} >
                                        <RightPanels/>
                                      </ResizablePanel> 

                                      <ResizableHandle className="bg-zinc-700"/>
                                    </>
                                  }            

                                
                                  <ResizablePanel id="terminal" order={6} defaultSize={activePanel?65:100}>
                                    {/* <div className="flex h-full items-center justify-center p-6">
                                      <span className="font-semibold text-zinc-200">Terminal</span>
                                    </div> */}
                                    <div className="flex  flex-col h-full w-full">
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





//--------------------------------------------------------------------------------------------

// import { useParams } from "react-router-dom";
// import { useState, useEffect, useRef } from "react";
// import { ResizablePanelGroup, ResizableHandle, ResizablePanel } from "../../ui/resizable";

// import { useSocket } from "../../../hooks/useSocket";
// import { usePodToken } from "../../../hooks/usePodToken";
// import {File, RemoteFile,Type } from "./files/file-manager";
// import { CodingContext } from "../context/codingContext";
// import { useToggleContext } from "../context/toggleContext";
// import { fitAddon } from "./Terminal";


// import { Filebar } from "./Filebar";
// import { CodeEditor } from "./CodeEditor";
// import {TerminalComponent as Terminal } from "./Terminal";
// import { RightPanels } from "./RightPanels";

// import * as Y from "yjs";

// export const CodingPage = () => {
//     const { spaceId , podId} = useParams<{ spaceId: string, podId:string }>();
//     if (!spaceId || !podId) {
//       return <div>Missing parameters in URL</div>;
//     }

//     const { podToken, loading:loadingToken, error:errorToken } = usePodToken(spaceId!, podId!);

//     const socket = useSocket(spaceId!, podId!, podToken!);   //major step <=================================
//     const {isRightBarOpen, activePanel, handlePanelToggle} = useToggleContext(); 
//     const panelRef = useRef<any>(null);

//     const [loaded, setLoaded] = useState(false);
//     const [fileStructure, setFileStructure] = useState<RemoteFile[]>([]);
//     const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);



//     useEffect(() => {
//         console.log("Socket initialized:");
        
//         if (socket) {
//             socket.on('connect_error', (err:Error) => {
//                 console.error('Socket connection error:', err);
//             });

//             socket.on('loaded', ({ rootContent }: { rootContent: RemoteFile[] }) => {
//                 setLoaded(true);
//                 setFileStructure(rootContent);

//                 // console.log("rootContent:-")
//                 // console.log(rootContent)
//             });
//         }
//     }, [socket]);

//     const onSelect = (file: File) => {
//         if (!socket) return;

//         if (file.type === Type.DIRECTORY) {
//             socket.emit("fetchDir", file.path, (data: RemoteFile[]) => {
//                 setFileStructure(prev => {
//                     const allFiles = [...prev, ...data];
//                     return allFiles.filter((file, index, self) =>
//                         index === self.findIndex(f => f.path === file.path)
//                     );
//                 });
//             });
//         } else {
//             socket.emit("fetchContent", { path: file.path }, (data: string) => {
//                 file.content = data;
//                 setSelectedFile(file);
//             });
//         }
//     };

//     // const resizeXterm = () => {
//     //     setTimeout(() => {
//     //       console.log("resizing")
//     //       fitAddon.fit();

//     //     }, 100);
//     // }

//     const resizeXterm = () => {
//         requestAnimationFrame(() => {
//         // console.log("resizing ok")
//         fitAddon.fit();
//       });
//     };


//     if (!socket) return <>Connecting to socket...</>;

//     if (!loaded) {
//         return <div className="text-zinc-800 dark:text-zinc-200">Loading...</div>;
//     }

//     return (
//         <CodingContext.Provider value={{
//           socket,
//           selectedFile,
//           fileStructure,
//           onSelect,
//           setSelectedFile,
//           setFileStructure
//         }}>

//             <div className="h-full w-full flex flex-row">
//               <ResizablePanelGroup direction="horizontal">

//                   <ResizablePanel id="file-tree" order={1} defaultSize={15} minSize={10} maxSize={30}>
//                     {/* <div className="flex h-full w-[250px] border-r border-r-zinc-700"> */}
//                       {/* <span className="font-semibold text-zinc-200">Files</span>      */}
//                       <Filebar/>
//                     {/* </div> */}
//                   </ResizablePanel>

//                   <ResizableHandle className="bg-zinc-700 "/>

//                   <ResizablePanel id="xyz" order={2} defaultSize={85}>

//                     <ResizablePanelGroup
//                       direction="horizontal"
//                       className=" md:min-w-[450px] bg-zinc-900"
//                       onLayout={() => resizeXterm()}
//                     >
//                         <ResizablePanel id="code-editor" order={3} defaultSize={60} minSize={30} >
//                             {/* <div className="flex h-full items-center justify-center p-6">
//                                     <span className="font-semibold text-zinc-200">Code</span>
//                             </div> */}
//                             <CodeEditor/>
                            
//                         </ResizablePanel>
                            
//                         <ResizableHandle withHandle className=""/>
                            
//                         {true && 
//                           <ResizablePanel id="right-bar" order={4} defaultSize={40} minSize={20}
//                                           className={isRightBarOpen ? "block" : "hidden"}
//                           >
                          
//                               <div className="bg-neutral-300 dark:bg-neutral-900 h-8 w-full border-b border-b-zinc-700">
//                                   <div className="flex flex-row h-full">
//                                       <button onClick={()=>{handlePanelToggle("output"); resizeXterm()}} className={`${activePanel==="output"? "bg-zinc-500/50":""} h-full text-xs min-w-20 px-2 pb-0.5 flex flex-col cursor-pointer hover:bg-zinc-500/25 items-center justify-center text-zinc-800 dark:text-zinc-300 border-r border-r-zinc-400 dark:border-r-zinc-700`}>
//                                           Output
//                                       </button>
                        
//                                       <button onClick={()=>{handlePanelToggle("ask"); resizeXterm()}} className={`${activePanel==="ask"? "bg-zinc-500/40":""} h-full text-xs min-w-20 px-2 pb-0.5 flex flex-col cursor-pointer hover:bg-zinc-500/25 items-center justify-center text-zinc-800 dark:text-zinc-300 border-r border-r-zinc-400 dark:border-r-zinc-700`}>
//                                           Ask AI
//                                       </button>
//                                   </div>
//                               </div>
                        
//                               <ResizablePanelGroup direction="vertical" 
//                                                     onLayout={()=>resizeXterm()}
//                               >
                        
//                                   {activePanel && 
//                                     <>
//                                       <ResizablePanel id="right-panels" order={5} collapsible collapsedSize={0} ref={panelRef} defaultSize={35} >
//                                         <RightPanels/>
//                                       </ResizablePanel> 

//                                       <ResizableHandle className="bg-zinc-700"/>
//                                     </>
//                                   }            

                                
//                                   <ResizablePanel id="terminal" order={6} defaultSize={activePanel?65:100}>
//                                     {/* <div className="flex h-full items-center justify-center p-6">
//                                       <span className="font-semibold text-zinc-200">Terminal</span>
//                                     </div> */}
//                                     <div className="flex  flex-col h-full w-full">
//                                       <Terminal/>
//                                     </div>
                                    
                                    
//                                   </ResizablePanel>
//                               </ResizablePanelGroup>
                                    
//                           </ResizablePanel>
//                         }
//                     </ResizablePanelGroup>

//                 </ResizablePanel>

//               </ResizablePanelGroup>
//             </div>
        
            
//         </CodingContext.Provider>
//     );

// };