import { useEffect, useMemo, useState } from "react";

import { File, buildFileTree, RemoteFile } from "./files/file-manager";
import { FileTree } from "./files/file-tree";
import { useCodingContext } from "../context/codingContext";

export const Filebar = (
//     {
//     files,
//     onSelect,
//     selectedFile,
//     socket
// }: {
//     files: RemoteFile[];
//     onSelect: (file: File) => void;
//     selectedFile: File | undefined;
//     socket: Socket;
// }
) => {

    const {fileStructure,selectedFile, onSelect} = useCodingContext()
    const files=fileStructure;
  
  const rootDir = useMemo(() => {
    return buildFileTree(files);
  }, [files]);

  useEffect(() => {
    if (!selectedFile) {
      onSelect(rootDir.files[0])
    }
  }, [selectedFile])

  return (
    <div>
      {/* <div className="flex h-full w-[250px] border-r border-r-zinc-700"> */}
        
          <FileTree
            rootDir={rootDir}
            selectedFile={selectedFile}
            onSelect={onSelect}
          />
        
      {/* </div> */}
    </div>
  );
};
