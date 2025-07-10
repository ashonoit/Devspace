import Editor from "@monaco-editor/react";
import { useCodingContext } from "../context/codingContext";
import { useAppSelector } from "../../../redux/reduxTypeSafety";

export const CodeEditor = () => {
  
  const {selectedFile, socket} =useCodingContext();
  const theme = useAppSelector(state=>state.theme.mode)
  
  if (!selectedFile || !socket) return null;

  const code = selectedFile.content;
  let language = selectedFile.name.split('.').pop();

  if (language === "js" || language === "jsx")
    language = "javascript";
  else if (language === "ts" || language === "tsx")
    language = "typescript";
  else if (language === "py")
    language = "python";

  // Debounce function
  function debounce(func: (value: string | undefined) => void, wait: number) {
    let timeout: ReturnType<typeof setTimeout>;
    return (value: string | undefined) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func(value);
      }, wait);
    };
  }

  // Create the debounced handler outside JSX
  const debouncedHandler = debounce((value: string | undefined) => {
    socket.emit("updateContent", {
      path: selectedFile.path,
      content: value ?? "",
    });
  }, 500);

  return (
    <Editor
      height="100vh"
      language={language}
      value={code}
      theme={theme==="dark"?"vs-dark": "vs-light"}
      onChange={(value) => {
        debouncedHandler(value);
      }}
    />
  );
};
