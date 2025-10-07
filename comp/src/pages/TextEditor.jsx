import Editor from "@monaco-editor/react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSingle, submitCode  } from "../service/api";

function TextEditor() {
    const [code, setCode] = useState("// write your code here");
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [problem, setProblem] = useState(null);

    const handleEditorChange = (value) => {
        setCode(value || "");
    };

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                setLoading(true);
                setError(null);
                const problemData = await getSingle({ id });
                setProblem(problemData);
                setCode("// write your code here");
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
            console.warn("Editor is empty !");
            return;
        }

        try {
            const payload = {
                language_id: 62,
                source_code: code,
                stdin: problem?.stdin || "",
                expected_output: problem?.expectedOutput || "",
                jwtToken: localStorage.getItem("token"),
                token: localStorage.getItem("ctoken")
            };

            const response = await submitCode(payload);
            console.log("API Response:", response);
            alert("Submitted successfully. Check console for result.");
        } catch (error) {
            console.error("Submission failed:", error);
            alert("Submission failed. Check console for details.");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading editor...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
                    <strong className="font-semibold">Error:</strong> {error}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-5xl mx-auto space-y-4">
                <Link to={`/${id}`} className="inline-block text-blue-600 hover:underline text-sm">
                    &larr; Go back
                </Link>

                <h2 className="text-2xl font-bold text-gray-800">{problem?.title || "Problem Title"}</h2>

                <div className="h-[500px] rounded-md overflow-hidden border border-gray-300">
                    <Editor
                        height="100%"
                        language="java"
                        value={code}
                        theme="vs-dark"
                        onChange={handleEditorChange}
                    />
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={!code.trim()}
                    className={`w-full py-2 rounded-md text-white transition-colors ${
                        code.trim()
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-gray-400 cursor-not-allowed"
                    }`}
                >
                    Submit
                </button>
            </div>
        </div>
    );
}

export default TextEditor;
