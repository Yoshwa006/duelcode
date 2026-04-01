import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Editor from "@monaco-editor/react";
import { getSessionByToken, submitCode } from "../service/api.js";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080';

function getUserFromToken() {
    try {
        const token = localStorage.getItem('jwt');
        if (!token) return 'Guest';
        
        const payload = token.split('.')[1];
        if (!payload) return 'Guest';
        
        const decoded = JSON.parse(atob(payload));
        return decoded.sub || decoded.email || 'User';
    } catch {
        return 'Guest';
    }
}

function MatchPage() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [sessionData, setSessionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [code, setCode] = useState("");
    const [output, setOutput] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [stompClient, setStompClient] = useState(null);
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState("");

    const userEmail = getUserFromToken();

    useEffect(() => {
        const initMatch = async () => {
            try {
                const data = await getSessionByToken(token);
                setSessionData(data);

                if (data.question?.stdIn) {
                    setCode(`// Solve: ${data.question.title}\n\n`);
                }

                const socket = new SockJS(`${WS_URL}/ws?userId=${encodeURIComponent(userEmail)}`);
                const client = new Client({
                    webSocketFactory: () => socket,
                    onConnect: () => {
                        console.log("Connected to match WebSocket");
                        client.subscribe(`/topic/match/${token}`, (msg) => {
                            const parsed = JSON.parse(msg.body);
                            setMessages(prev => [...prev, parsed]);
                        });
                    },
                    onStompError: (frame) => {
                        console.error('Broker error', frame.headers['message']);
                    }
                });

                client.activate();
                setStompClient(client);

            } catch (err) {
                setError(err.message || "Failed to load match session.");
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            initMatch();
        }

        return () => {
            if (stompClient) {
                stompClient.deactivate();
            }
        };
    }, [token, userEmail]);

    const handleCodeChange = (value) => {
        setCode(value || "");
    };

    const handleRunCode = async () => {
        try {
            setSubmitting(true);
            setOutput("Running code...\n");

            const payload = {
                language_id: 62,
                source_code: code,
            };

            const res = await submitCode(payload);

            if (res.status === "success") {
                setOutput(`${res.message}\n\nYou won the battle!`);
                if (stompClient) {
                    stompClient.publish({
                        destination: `/app/chat/${token}`,
                        body: JSON.stringify({ sender: userEmail, content: "has completed the problem!" })
                    });
                }
            } else {
                setOutput(`Failed: ${res.message || "Wrong answer"}`);
            }
        } catch (err) {
            setOutput("Submission error: " + (err.message || "Unknown error"));
        } finally {
            setSubmitting(false);
        }
    };

    const sendChat = (e) => {
        e.preventDefault();
        if (!chatInput.trim() || !stompClient) return;

        stompClient.publish({
            destination: `/app/chat/${token}`,
            body: JSON.stringify({ sender: userEmail, content: chatInput })
        });
        setChatInput("");
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error) return (
        <div className="container mx-auto mt-10 max-w-lg">
            <div className="bg-red-50 text-red-700 p-6 rounded-lg border border-red-200">
                <h3 className="font-bold text-lg mb-2">Error</h3>
                <p>{error}</p>
                <button onClick={() => navigate("/")} className="mt-4 cf-btn">Back to Home</button>
            </div>
        </div>
    );

    const question = sessionData?.question;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <div className="flex flex-1 p-4 gap-4 overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
                <div className="w-1/3 flex flex-col gap-4 overflow-y-auto">
                    <div className="bg-white rounded shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-blue-800 mb-2">{question?.title || "Loading..."}</h2>
                        <div className="text-sm text-gray-500 mb-4 pb-4 border-b">
                            Difficulty: <span className="font-semibold text-gray-700">{question?.difficulty}</span>
                        </div>

                        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap mb-6">
                            {question?.description}
                        </div>

                        {question?.stdIn && (
                            <div className="mb-4">
                                <h3 className="font-bold text-sm text-gray-900 mb-2 uppercase tracking-wide">Input Format</h3>
                                <pre className="bg-gray-50 p-3 rounded border border-gray-200 text-sm font-mono text-gray-800 overflow-x-auto">
                                    {question.stdIn}
                                </pre>
                            </div>
                        )}

                        {question?.expectedOutput && (
                            <div>
                                <h3 className="font-bold text-sm text-gray-900 mb-2 uppercase tracking-wide">Expected Output</h3>
                                <pre className="bg-gray-50 p-3 rounded border border-gray-200 text-sm font-mono text-gray-800 overflow-x-auto">
                                    {question.expectedOutput}
                                </pre>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded shadow-sm border border-gray-200 flex flex-col flex-1 min-h-[300px]">
                        <div className="px-4 py-2 border-b bg-gray-50 font-semibold text-gray-700 text-sm flex justify-between">
                            <span>Match Chat</span>
                            <span className="text-xs text-gray-400">Token: {token}</span>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-2 bg-gray-50/50">
                            {messages.map((m, idx) => (
                                <div key={idx} className={`flex flex-col ${m.sender === userEmail ? "items-end" : "items-start"}`}>
                                    <span className="text-xs text-gray-500 mb-1">{m.sender}</span>
                                    <div className={`px-3 py-2 rounded-lg text-sm max-w-[85%] ${m.sender === userEmail ? "bg-blue-600 text-white" : "bg-white border text-gray-800 shadow-sm"}`}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={sendChat} className="border-t p-3 flex gap-2">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700 transition">
                                Send
                            </button>
                        </form>
                    </div>
                </div>

                <div className="w-2/3 flex flex-col gap-4">
                    <div className="bg-white rounded shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
                        <div className="px-4 py-2 border-b bg-gray-50 flex justify-between items-center">
                            <span className="font-semibold text-gray-700 text-sm">Java 17 Editor</span>
                            <button
                                onClick={handleRunCode}
                                disabled={submitting}
                                className={`px-4 py-1.5 rounded text-sm font-medium transition ${submitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#1890ff] hover:bg-[#40a9ff] text-white"}`}
                            >
                                {submitting ? "Running..." : "Submit Code"}
                            </button>
                        </div>
                        <div className="flex-1 pt-2">
                            <Editor
                                height="100%"
                                language="java"
                                theme="vs-light"
                                value={code}
                                onChange={handleCodeChange}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    lineNumbers: "on",
                                    scrollBeyondLastLine: false,
                                }}
                            />
                        </div>
                    </div>

                    <div className="h-48 bg-[#1e1e1e] rounded shadow flex flex-col overflow-hidden border border-gray-800">
                        <div className="px-4 py-1 text-xs font-mono text-gray-400 bg-[#2d2d2d] border-b border-black flex justify-between">
                            <span>Console Output</span>
                            {output && <button onClick={() => setOutput("")} className="hover:text-white">Clear</button>}
                        </div>
                        <pre className="flex-1 p-4 font-mono text-sm overflow-y-auto text-[#d4d4d4] whitespace-pre-wrap">
                            {output || "Ready. Write and submit your code."}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MatchPage;
