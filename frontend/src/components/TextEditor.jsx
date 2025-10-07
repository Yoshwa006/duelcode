// src/components/TextEditor.jsx
import React, { useCallback } from "react";
import Editor from "@monaco-editor/react";

const languageMap = {
  cpp: "cpp",
  java: "java",
  python: "python",
  javascript: "javascript",
};

const TextEditor = ({
  language = "java",
  code = "",
  onChange = () => {},
  height = "500px",
  readOnly = false,
}) => {
  const handleEditorChange = useCallback(
    (value) => onChange(value),
    [onChange]
  );

  return (
    <div className="rounded-xl shadow-md border border-gray-300 overflow-hidden">
      <Editor
        height={height}
        language={languageMap[language] || "java"}
        value={code}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{
          fontSize: 14,
          readOnly,
          minimap: { enabled: false },
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: "on",
          formatOnType: true, 
          tabSize: 4,
        }}
      />
    </div>
  );
};

export default TextEditor;
