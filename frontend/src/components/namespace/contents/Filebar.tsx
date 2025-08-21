import { useEffect, useMemo, useState } from "react";

import { File, buildFileTree, RemoteFile } from "./files/file-manager";
import { FileTree } from "./files/file-tree";
import { useCodingContext } from "../context/codingContext";

export const Filebar = () => {

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
    <div className="select-none">
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
