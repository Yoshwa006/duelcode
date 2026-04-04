import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Editor from "@monaco-editor/react";
import { getSessionByToken, submitCode, generateKey, surrender, cancelSession } from "../service/api.js";
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
    const { token, questionId } = useParams();
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
                if (questionId) {
                    const res = await generateKey(questionId);
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

    const handleSurrender = async () => {
        if (!confirm("Are you sure you want to surrender? Your opponent will win.")) {
            return;
        }
        try {
            const res = await surrender(token);
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
            const res = await cancelSession(token);
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
            <div className="loading-spinner">Loading battle...</div>
        </div>
    );

    if (error) return (
        <div className="container">
            <Navbar />
            <div className="alert alert-error">
                {error}
                <br /><br />
                <button onClick={() => navigate("/")} className="cf-btn">Back to Home</button>
            </div>
        </div>
    );

    const question = sessionData?.question;

    return (
        <div className="container">
            <Navbar />

            <div style={{ display: 'flex', height: 'calc(100vh - 100px)', padding: '10px', gap: '10px' }}>
                <div style={{ width: '35%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div className="panel" style={{ flex: '0 0 auto' }}>
                        <div className="panel-title">{question?.title || "Loading..."}</div>
                        <div className="panel-content">
                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                                Difficulty: <span style={{ fontWeight: 'bold' }}>{question?.difficulty}</span>
                            </div>
                            <div style={{ whiteSpace: 'pre-wrap', fontSize: '13px' }}>
                                {question?.description}
                            </div>
                            {question?.stdIn && (
                                <div style={{ marginTop: '10px' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '12px' }}>Input Format:</div>
                                    <pre className="code-block">{question.stdIn}</pre>
                                </div>
                            )}
                            {question?.expectedOutput && (
                                <div style={{ marginTop: '10px' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '12px' }}>Expected Output:</div>
                                    <pre className="code-block">{question.expectedOutput}</pre>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '200px' }}>
                        <div className="panel-title">
                            Match Chat
                            <span style={{ float: 'right', fontSize: '11px', fontWeight: 'normal' }}>Token: {token}</span>
                        </div>
                        <div style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
                            {messages.map((m, idx) => (
                                <div key={idx} style={{ marginBottom: '8px' }}>
                                    <div style={{ fontSize: '11px', color: '#888' }}>{m.sender}</div>
                                    <div style={{ 
                                        display: 'inline-block',
                                        padding: '5px 10px',
                                        borderRadius: '5px',
                                        backgroundColor: m.sender === userEmail ? '#0000BB' : '#eee',
                                        color: m.sender === userEmail ? '#fff' : '#000',
                                        fontSize: '13px'
                                    }}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={sendChat} style={{ padding: '10px', borderTop: '1px solid #ddd', display: 'flex', gap: '5px' }}>
                            <input
                                type="text"
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                placeholder="Type a message..."
                                style={{ flex: 1 }}
                            />
                            <button type="submit" className="cf-btn">Send</button>
                        </form>
                    </div>
                </div>

                <div style={{ width: '65%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div className="panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div className="panel-title">
                            Java 17 Editor
                            <button 
                                onClick={handleRunCode}
                                disabled={submitting}
                                style={{ float: 'right', backgroundColor: '#28a745', color: '#fff' }}
                                className="cf-btn"
                            >
                                {submitting ? "Running..." : "Submit Code"}
                            </button>
                            {showSurrender && (
                            <button 
                                onClick={handleSurrender}
                                style={{ float: 'right', marginLeft: '5px', backgroundColor: '#dc3545', color: '#fff' }}
                                className="cf-btn"
                            >
                                Surrender
                            </button>
                            )}
                            {showCancel && (
                            <button 
                                onClick={handleCancel}
                                style={{ float: 'right', marginLeft: '5px', backgroundColor: '#6c757d', color: '#fff' }}
                                className="cf-btn"
                            >
                                Cancel Match
                            </button>
                            )}
                        </div>
                        <div style={{ flex: 1 }}>
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

                    <div style={{ height: '150px', backgroundColor: '#1e1e1e', borderRadius: '3px', padding: '10px' }}>
                        <div style={{ color: '#888', fontSize: '12px', marginBottom: '5px' }}>Console Output</div>
                        <pre style={{ color: '#d4d4d4', fontSize: '12px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                            {output || "Ready. Write and submit your code."}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MatchPage;
