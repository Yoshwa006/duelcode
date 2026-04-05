import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Editor from "@monaco-editor/react";
import { matchApi } from "../service/api";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080';

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
    const { token, questionId } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [sessionData, setSessionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [code, setCode] = useState("");
    const [language, setLanguage] = useState(LANGUAGES[0]);
    const [output, setOutput] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [stompClient, setStompClient] = useState(null);
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState("");

    const userEmail = getUserFromToken();

    useEffect(() => {
        const initMatch = async () => {
            try {
                if (questionId) {
                    const res = await matchApi.generateKey(questionId);
                    if (res && typeof res === 'string') {
                        navigate(`/match/${res}`, { replace: true });
                        return;
                    } else {
                        setError(res?.message || 'Failed to create session');
                        setLoading(false);
                        return;
                    }
                }
                
                if (token) {
                    const data = await matchApi.getByToken(token);
                    setSessionData(data);

                    if (data.question?.stdIn) {
                        setCode(`// Solve: ${data.question.title}\n\n${language.template}`);
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
                            client.subscribe(`/topic/match/${token}/output`, (msg) => {
                                setOutput(msg.body);
                            });
                            client.subscribe(`/topic/match/${token}/result`, (msg) => {
                                const result = JSON.parse(msg.body);
                                if (result.winner) {
                                    alert(`🏆 ${result.winner} won the battle!`);
                                }
                            });
                        },
                        onDisconnect: () => {
                            console.log("Disconnected from match WebSocket");
                        }
                    });
                    client.activate();
                    setStompClient(client);
                }
            } catch (err) {
                setError(err.message || 'Failed to load session');
            } finally {
                setLoading(false);
            }
        };
        initMatch();

        return () => {
            if (stompClient) {
                stompClient.deactivate();
            }
        };
    }, [token, questionId, navigate, userEmail]);

    const handleLanguageChange = (e) => {
        const selectedLang = LANGUAGES.find(l => l.id === parseInt(e.target.value));
        if (selectedLang) {
            setLanguage(selectedLang);
            if (!code.trim()) {
                setCode(`// Solve: ${sessionData?.question?.title || 'Problem'}\n\n${selectedLang.template}`);
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

    const handleCodeChange = (value) => {
        setCode(value || "");
    };

    const handleRunCode = async () => {
        try {
            setSubmitting(true);
            setOutput("Running code...\n");

            const payload = {
                language_id: language.id,
                source_code: code,
            };

            const res = await matchApi.submit(payload);

            if (res.status === "success") {
                setOutput(`${res.message}\n\n🎉 You won the battle!`);
                if (stompClient) {
                    stompClient.publish({
                        destination: `/app/chat/${token}`,
                        body: JSON.stringify({ sender: userEmail, content: "has completed the problem! 🏆" })
                    });
                }
            } else {
                setOutput(`❌ Failed: ${res.message || "Wrong answer"}`);
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

    const handleSurrender = async () => {
        if (!confirm("Are you sure you want to surrender? Your opponent will win.")) {
            return;
        }
        try {
            const res = await matchApi.surrender(token);
            if (res.status === "SUCCESS") {
                alert("You surrendered. The match is over.");
                window.location.href = "/";
            }
        } catch (err) {
            alert("Failed to surrender: " + (err.message || "Unknown error"));
        }
    };

    const handleCancel = async () => {
        if (!confirm("Are you sure you want to cancel this session?")) {
            return;
        }
        try {
            const res = await matchApi.cancel(token);
            if (res.status === "SUCCESS") {
                alert("Session cancelled.");
                window.location.href = "/";
            } else {
                alert(res.message || "Failed to cancel");
            }
        } catch (err) {
            alert("Failed to cancel: " + (err.message || "Unknown error"));
        }
    };

    const isCreator = sessionData?.createdBy === userEmail;
    const hasOpponent = sessionData?.joinedBy != null;
    const showCancel = isCreator && !hasOpponent;
    const showSurrender = hasOpponent;

    if (loading) return (
        <div className="container">
            <Navbar />
            <div className="loading-spinner">
                <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <span>Loading battle...</span>
            </div>
        </div>
    );

    if (error) return (
        <div className="container">
            <Navbar />
            <div className="page-container">
                <div className="alert alert-error">
                    <strong>Error:</strong> {error}
                    <br /><br />
                    <button onClick={() => navigate("/")} className="cf-btn">Back to Home</button>
                </div>
            </div>
        </div>
    );

    const question = sessionData?.question;

    return (
        <div className="container">
            <Navbar />

            <div style={{ display: 'flex', height: 'calc(100vh - 120px)', padding: '15px', gap: '15px' }}>
                <div style={{ width: '35%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div className="panel" style={{ flex: '0 0 auto' }}>
                        <div className="panel-title">
                            <span>📝</span> {question?.title || "Loading..."}
                        </div>
                        <div className="panel-content">
                            <div style={{ fontSize: '13px', color: '#888', marginBottom: '15px', display: 'flex', gap: '15px' }}>
                                <span>
                                    <span style={{ color: '#666' }}>Difficulty:</span>{' '}
                                    <span className={question?.difficulty?.toLowerCase() === 'easy' ? 'difficulty-easy' : question?.difficulty?.toLowerCase() === 'medium' ? 'difficulty-medium' : 'difficulty-hard'}>
                                        {question?.difficulty}
                                    </span>
                                </span>
                            </div>
                            <div style={{ whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.7', color: '#ddd' }}>
                                {question?.description}
                            </div>
                            {question?.stdIn && (
                                <div style={{ marginTop: '20px' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#ff8c00', marginBottom: '8px' }}>📥 Input Format:</div>
                                    <pre className="code-block">{question.stdIn}</pre>
                                </div>
                            )}
                            {question?.expectedOutput && (
                                <div style={{ marginTop: '15px' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#4caf50', marginBottom: '8px' }}>📤 Expected Output:</div>
                                    <pre className="code-block">{question.expectedOutput}</pre>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '200px' }}>
                        <div className="panel-title">
                            <span>💬</span> Match Chat
                            <span style={{ fontSize: '11px', fontWeight: 'normal', opacity: 0.7 }}>Token: {token}</span>
                        </div>
                        <div style={{ flex: 1, padding: '12px', overflowY: 'auto', background: 'var(--cf-bg-tertiary)' }}>
                            {messages.map((m, idx) => (
                                <div key={idx} style={{ marginBottom: '10px', animation: 'fadeIn 0.3s ease' }}>
                                    <div style={{ fontSize: '11px', color: '#888', marginBottom: '3px' }}>{m.sender}</div>
                                    <div style={{ 
                                        display: 'inline-block',
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        backgroundColor: m.sender === userEmail ? 'var(--cf-blue)' : 'var(--cf-bg-secondary)',
                                        color: m.sender === userEmail ? '#fff' : '#ccc',
                                        fontSize: '13px',
                                        border: m.sender === userEmail ? 'none' : '1px solid var(--cf-border)'
                                    }}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            {messages.length === 0 && (
                                <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                                    No messages yet. Start the conversation!
                                </div>
                            )}
                        </div>
                        <form onSubmit={sendChat} style={{ padding: '12px', borderTop: '1px solid var(--cf-border)', display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                placeholder="Type a message..."
                                style={{ flex: 1, padding: '8px 12px' }}
                            />
                            <button type="submit" className="cf-btn">Send</button>
                        </form>
                    </div>
                </div>

                <div style={{ width: '65%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div className="panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div className="panel-title">
                            <span>⚡</span> Code Editor
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
                                
                                {showSurrender && (
                                <button 
                                    onClick={handleSurrender}
                                    style={{ background: 'linear-gradient(180deg, #f44336 0%, #d32f2f 100%)', border: 'none' }}
                                    className="cf-btn"
                                >
                                    🏳️ Surrender
                                </button>
                                )}
                                {showCancel && (
                                <button 
                                    onClick={handleCancel}
                                    style={{ background: 'linear-gradient(180deg, #666 0%, #444 100%)', border: 'none' }}
                                    className="cf-btn"
                                >
                                    ✖ Cancel Match
                                </button>
                                )}
                                <button 
                                    onClick={handleRunCode}
                                    disabled={submitting}
                                    style={{ background: 'linear-gradient(180deg, #4caf50 0%, #388e3c 100%)', border: 'none' }}
                                    className="cf-btn-primary"
                                >
                                    {submitting ? "⏳ Running..." : "🚀 Submit Code"}
                                </button>
                            </div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <Editor
                                height="100%"
                                language={language.monaco}
                                theme="vs-dark"
                                value={code}
                                onChange={handleCodeChange}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    lineNumbers: "on",
                                    scrollBeyondLastLine: false,
                                    fontFamily: "'Fira Code', 'Consolas', monospace",
                                    padding: { top: 10 },
                                }}
                            />
                        </div>
                    </div>

                    <div className="panel" style={{ height: '180px' }}>
                        <div className="panel-title" style={{ background: 'linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%)' }}>
                            <span>📺</span> Console Output
                        </div>
                        <div style={{ 
                            backgroundColor: '#0d1117', 
                            padding: '15px', 
                            height: 'calc(100% - 45px)',
                            overflow: 'auto',
                            fontFamily: "'Fira Code', 'Consolas', monospace",
                            fontSize: '13px',
                            color: output.includes('🎉') ? '#4caf50' : output.includes('❌') ? '#ff6666' : '#ddd'
                        }}>
                            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                                {output || "Ready. Write and submit your code."}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MatchPage;