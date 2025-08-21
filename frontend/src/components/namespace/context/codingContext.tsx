import React, {useContext, createContext} from "react";
import * as Y from 'yjs';
import { File, RemoteFile } from "../contents/files/file-manager";
import { Socket } from "socket.io-client";


interface CodingContextProps {
  socket: Socket | null;
  selectedFile: File | undefined;
  fileStructure: RemoteFile[];
  onSelect: (file: File) => void;
  setSelectedFile: React.Dispatch<React.SetStateAction<File | undefined>>;
  setFileStructure: React.Dispatch<React.SetStateAction<RemoteFile[]>>;
  activeDoc:  Y.Doc | null;
  initialContent : string | undefined;
  isDocPopulated: Boolean
}

export const CodingContext = createContext<CodingContextProps | undefined>(undefined);

export const useCodingContext = () => {
  const context = useContext(CodingContext);
  if (!context) throw new Error("useCodingContext must be used within a CodingProvider");
  return context;
};
