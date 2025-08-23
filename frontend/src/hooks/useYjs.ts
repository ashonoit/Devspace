import { Socket } from "socket.io-client";
import { useRef, useEffect, useState } from "react";
import * as Y from 'yjs';
import { File } from "../components/namespace/contents/files/file-manager";
// import { useAppSelector } from "../redux/reduxTypeSafety";

type useYjsProps = {
    socket: Socket | null;
    selectedFile: File | undefined;
}

// const userCursorColors = ['#ff0000', '#00ff00', '#0000ff', '#ff00ff', '#ffff00', '#00ffff'];
// const getRandomColor = () => userCursorColors[Math.floor(Math.random()*userCursorColors.length)];

export const useYjs = ({socket, selectedFile} : useYjsProps) =>{
    const [activeDoc, setActiveDoc] = useState<Y.Doc | null>(null);
    const [isDocPopulated, setIsDocPopulated] = useState(false);
    
    const yDocsRef = useRef<Map<string, Y.Doc>>(new Map());

    useEffect(() => {
        if(!socket) return;

        const handleY_Update = ({filePath, update} : {filePath:string, update: Uint8Array})=>{
          // console.log(`[CLIENT] Received 'y-update' for ${filePath}. Update size: ${update.byteLength} bytes.`);
          const doc = yDocsRef.current.get(filePath);
          if(doc){
            // Apply the remote update to the local doc
            // The 'server' origin prevents this change from being re-emitted
            Y.applyUpdate(doc, new Uint8Array(update), 'server');
            setIsDocPopulated(true)
          }
        };

        socket.on('y-update', handleY_Update);

        return ()=>{
          socket.off('y-update', handleY_Update);
        }
            
    }, [socket]);
    
    useEffect(()=>{
      if(!socket || !activeDoc || !selectedFile) return;

      const updateHandler = (update:Uint8Array, origin:any) =>{
        if(origin!='server'){
          // const selectedFilePath = [...yDocsRef.current.entries()].find(([_ , doc]) => doc===activeDoc)?.[0];
          
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

    const getYDoc = (filePath:string) : Y.Doc =>{
      let doc = yDocsRef.current.get(filePath);
      if(!doc){
        doc = new Y.Doc();
        yDocsRef.current.set(filePath, doc);
      }
      return doc;
    }

    return {activeDoc, setActiveDoc, getYDoc, isDocPopulated, setIsDocPopulated};
}