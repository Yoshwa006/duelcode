import Editor from "@monaco-editor/react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { getSingleQuestion, submitCode } from "../service/api";
import Navbar from "../components/Navbar";

const LANGUAGES = [
    { id: 62, name: "Java", extension: "java", monaco: "java", template: `public class Main {\n    public static void main(String[] args) {\n        // Your code here\n        \n    }\n}` },
    { id: 71, name: "Python", extension: "py", monaco: "python", template: `# Your code here\n\ndef main():\n    pass\n\nif __name__ == "__main__":\n    main()` },
    { id: 76, name: "C++", extension: "cpp", monaco: "cpp", template: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Your code here\n    \n    return 0;\n}` },
    { id: 50, name: "C", extension: "c", monaco: "c", template: `#include <stdio.h>\n\nint main() {\n    // Your code here\n    \n    return 0;\n}` },
    { id: 63, name: "JavaScript", extension: "js", monaco: "javascript", template: `// Your code here\n\nfunction main() {\n    \n}\n\nmain();` },
    { id: 72, name: "Ruby", extension: "rb", monaco: "ruby", template: `# Your code here\n\ndef main\n  \nend\n\nmain` },
    { id: 68, name: "Go", extension: "go", monaco: "go", template: `package main\n\nimport "fmt"\n\nfunc main() {\n    // Your code here\n    \n}` },
    { id: 51, name: "C#", extension: "cs", monaco: "csharp", template: `using System;\n\nclass Main {\n    static void Main() {\n        // Your code here\n        \n    }\n}` },
    { id: 74, name: "Swift", extension: "swift", monaco: "swift", template: `import Foundation\n\n// Your code here\n\nfunc main() {\n    \n}\n\nmain()` },
    { id: 78, name: "Kotlin", extension: "kt", monaco: "kotlin", template: `fun main() {\n    // Your code here\n    \n}` },
];

function TextEditor() {
    const fileInputRef = useRef(null);
    const { id } = useParams();
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState(LANGUAGES[0]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [problem, setProblem] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    const handleEditorChange = (value) => {
        setCode(value || "");
    };

    const handleLanguageChange = (e) => {
        const selectedLang = LANGUAGES.find(l => l.id === parseInt(e.target.value));
        if (selectedLang) {
            setLanguage(selectedLang);
            if (!code.trim()) {
                setCode(selectedLang.template);
            }
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setCode(event.target.result);
        };
        reader.readAsText(file);
        
        e.target.value = '';
    };

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                setLoading(true);
                setError(null);
                const problemData = await getSingleQuestion(id);
                setProblem(problemData);
                setCode(language.template);
            } catch (err) {
                setError(err.message || 'Something went wrong.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProblem();
        }
    }, [id]);

    const handleSubmit = async () => {
        if (!code.trim()) {
            console.warn("Editor is empty!");
            return;
        }

        setSubmitting(true);
        setResult(null);

        try {
            const payload = {
                language_id: language.id,
                source_code: code,
            };

            const response = await submitCode(payload);
            console.log("API Response:", response);
            
            if (response.status === "success") {
                setResult({ success: true, message: "🎉 Correct answer! You won the battle." });
            } else {
                setResult({ success: false, message: `❌ ${response.message || "Wrong answer"}` });
            }
        } catch (error) {
            console.error("Submission failed:", error);
            setResult({ success: false, message: "Submission failed. Check console for details." });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="container">
                <Navbar />
                <div className="loading-spinner">
                    <div className="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <span>Loading editor...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <Navbar />
                <div className="page-container">
                    <div className="alert alert-error">
                        <strong>Error:</strong> {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <Navbar />
            <div className="page-container">
                <div style={{ marginBottom: '15px' }}>
                    <Link to={`/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <span>←</span> Back to Problem
                    </Link>
                </div>

                <div className="panel slide-up">
                    <div className="panel-title">
                        <span>📝</span> Submit Solution: {problem?.title || "Problem"}
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginLeft: '20px' }}>
                            <select
                                value={language.id}
                                onChange={handleLanguageChange}
                                style={{
                                    background: 'var(--cf-bg-secondary)',
                                    border: '1px solid var(--cf-border)',
                                    color: '#fff',
                                    padding: '6px 12px',
                                    borderRadius: '4px',
                                    fontSize: '13px',
                                    cursor: 'pointer'
                                }}
                            >
                                {LANGUAGES.map(lang => (
                                    <option key={lang.id} value={lang.id}>{lang.name}</option>
                                ))}
                            </select>
                            
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept=".java,.py,.cpp,.c,.js,.rb,.go,.cs,.swift,.kt,.txt"
                                style={{ display: 'none' }}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="cf-btn"
                                style={{ fontSize: '12px', padding: '6px 12px' }}
                            >
                                📁 Upload File
                            </button>
                        </div>
                    </div>
                    <div className="panel-content">
                        <div style={{ border: '1px solid var(--cf-border)', borderRadius: '6px', height: '500px', marginBottom: '15px', overflow: 'hidden' }}>
                            <Editor
                                height="100%"
                                language={language.monaco}
                                value={code}
                                theme="vs-dark"
                                onChange={handleEditorChange}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    fontFamily: "'Fira Code', 'Consolas', monospace",
                                    padding: { top: 10 },
                                    lineNumbers: "on",
                                    scrollBeyondLastLine: false,
                                }}
                            />
                        </div>

                        {result && (
                            <div className={`alert ${result.success ? 'alert-success' : 'alert-error'}`}>
                                {result.message}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button
                                onClick={handleSubmit}
                                disabled={!code.trim() || submitting}
                                className="cf-btn-primary"
                                style={{ padding: '10px 25px', fontSize: '15px', fontWeight: '600' }}
                            >
                                {submitting ? (
                                    <span>
                                        <span className="loading-dots"><span></span><span></span><span></span></span> Submitting...
                                    </span>
                                ) : '🚀 Submit'}
                            </button>
                            
                            <Link to={`/${id}`}>
                                <button className="cf-btn" style={{ padding: '10px 20px' }}>
                                    Cancel
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TextEditor;