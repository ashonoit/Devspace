

import { useEffect, useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { useCodingContext } from "../context/codingContext";
import { useAppSelector } from "../../../redux/reduxTypeSafety";
import { MonacoBinding } from "y-monaco";
import type * as monaco from 'monaco-editor';
import { useYjs } from "../../../hooks/useYjs";

export const CodeEditor = () => {
    const { selectedFile, activeDoc, isDocPopulated} = useCodingContext();
    
    
    const theme = useAppSelector(state => state.theme.mode);
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

    // This useEffect hook is responsible for managing the binding lifecycle.
    useEffect(() => {
        let binding: MonacoBinding | null = null;

        // We create the binding only when the editor instance and Y.Doc are both available.
        if (editorRef.current && activeDoc && isDocPopulated ) {
            console.log("%c[CodeEditor] Creating MonacoBinding WITH awareness object.", "color: green; font-weight: bold;");

            const yText = activeDoc.getText('monaco');
            const editorModel = editorRef.current.getModel();

            if (editorModel) {
                // Create the binding between the Yjs text and the editor model.
                binding = new MonacoBinding(yText, editorModel, new Set([editorRef.current]));
            }
        }
        else {
             //LOG to see if it's created WITHOUT awareness.
            console.log("%c[CodeEditor] MonacoBinding created WITHOUT awareness object.", "color: orange;");
        }
        
        // This cleanup function is crucial. It runs when the component unmounts
        // or when the dependencies change, ensuring no memory leaks.
        return () => {
            binding?.destroy();
        };
    }, [activeDoc, selectedFile?.path, isDocPopulated]); // Re-run when the doc or file path changes.

    // This callback runs when the Monaco editor has finished mounting.
    const handleEditorDidMount: OnMount = (editor) => {
        editorRef.current = editor;
    };
    
    // Don't render anything if no file is selected.
    if (!selectedFile) {
        return null; 
    }

    // Determine language for syntax highlighting.
    let language = selectedFile.name.split('.').pop();
    if (language === "js" || language === "jsx") language = "javascript";
    else if (language === "ts" || language === "tsx") language = "typescript";

    return (
        <Editor
            height="100vh"
            language={language}
            theme={theme === "dark" ? "vs-dark" : "vs-light"}
            onMount={handleEditorDidMount}
            // The key prop is essential. It tells React to create a brand new
            // Editor component when `selectedFile.path` changes, which prevents
            // any stale state from the previously opened file.
            key={selectedFile.path}
        />
    );
};



// import { useEffect, useRef } from "react";
// import Editor, { OnMount } from "@monaco-editor/react";
// import { useCodingContext } from "../context/codingContext";
// import { useAppSelector } from "../../../redux/reduxTypeSafety";
// import { MonacoBinding } from "y-monaco";
// import type * as monaco from 'monaco-editor';

// export const CodeEditor = () => {
  
//   const {selectedFile, socket, activeDoc} =useCodingContext();
//   const theme = useAppSelector(state=>state.theme.mode);
  
//   const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

//   useEffect(()=>{
//     let binding: MonacoBinding | null = null;

//     if (editorRef.current && activeDoc) {
//       const yText = activeDoc.getText('monaco');

//       const editorModel = editorRef.current.getModel();

//       if(editorModel){
//         binding = new MonacoBinding(yText, editorModel, new Set([editorRef.current]));
//       }
//     }

//     return () => {
//             binding?.destroy();
//     };
//   },[activeDoc, selectedFile?.path])

//   const handleEditorDidMount: OnMount = (editor, _monaco) => {
//         editorRef.current = editor;
//     };

  
//   if (!selectedFile || !socket) return null;

//   const code = selectedFile.content;
//   let language = selectedFile.name.split('.').pop();

//   if (language === "js" || language === "jsx")
//     language = "javascript";
//   else if (language === "ts" || language === "tsx")
//     language = "typescript";
//   else if (language === "py")
//     language = "python";



//   return (
//     <Editor
//       height="100vh"
//       language={language}
//       theme={theme==="dark"?"vs-dark": "vs-light"}
//       onMount={handleEditorDidMount}
//       key={selectedFile.path}
//     />
//   );
// };

//-----------------------------------------------------------------------------------------------------

// import Editor from "@monaco-editor/react";
// import { useCodingContext } from "../context/codingContext";
// import { useAppSelector } from "../../../redux/reduxTypeSafety";

// export const CodeEditor = () => {
  
//   const {selectedFile, socket, initialContent} =useCodingContext();
//   const theme = useAppSelector(state=>state.theme.mode)
  
//   if (!selectedFile || !socket) return null;

//   // const code = selectedFile.content;

//   let language = selectedFile.name.split('.').pop();

//   if (language === "js" || language === "jsx")
//     language = "javascript";
//   else if (language === "ts" || language === "tsx")
//     language = "typescript";
//   else if (language === "py")
//     language = "python";

//   // Debounce function
//   function debounce(func: (value: string | undefined) => void, wait: number) {
//     let timeout: ReturnType<typeof setTimeout>;
//     return (value: string | undefined) => {
//       clearTimeout(timeout);
//       timeout = setTimeout(() => {
//         func(value);
//       }, wait);
//     };
//   }

//   // Create the debounced handler outside JSX
//   const debouncedHandler = debounce((value: string | undefined) => {
//     socket.emit("updateContent", {
//       path: selectedFile.path,
//       content: value ?? "",
//     });
//   }, 500);

//   return (
//     <Editor
//       height="100vh"
//       language={language}
//       value={code}
//       theme={theme==="dark"?"vs-dark": "vs-light"}
//       onChange={(value) => {
//         debouncedHandler(value);
//       }}
//     />
//   );
// };
