import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { generateKey, getSingle } from "../service/api.js";
import Navbar from "../components/Navbar.jsx";
import CommentList from "../components/CommentList.jsx";

function SingleProblem() {
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [key, setKey] = useState(null);
    const [showKey, setShowKey] = useState(false);
    const [waiting, setWaiting] = useState(false);
    const [battleStarted, setBattleStarted] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                setLoading(true);
                const problemData = await getSingle({ id });
                setProblem(problemData);
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
    //
    // useEffect(() => {
    //     const polling = async() =>{
    //         try{
    //             const res = await polling()
    //         }
    //     }
    // })
    const handleGenerateKey = async () => {
        try {
            setWaiting(true);

            const generated_key = await generateKey({ questionId: id });
            
            const token = typeof generated_key === 'string' ? generated_key : generated_key.token || JSON.stringify(generated_key);
            localStorage.setItem("key", token);

            setKey(token);
            setShowKey(true);
            setWaiting(false);
            setBattleStarted(true);

            navigate(`/match/${token}`);
        } catch (err) {
            setError(err.message || 'Failed to generate token');
            setWaiting(false);
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'medium':
                return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'hard':
                return 'text-red-600 bg-red-50 border-red-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading problem...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
                <div className="flex items-center">
                    <strong className="font-semibold">Error:</strong>
                    <span className="ml-1">{error}</span>
                </div>
            </div>
        </div>
    );

    if (!problem) return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-6 py-4 rounded-lg">
                Problem not found.
            </div>
        </div>
    );

    return (
        <div className="container">
            <Navbar />
            <div style={{ marginTop: '20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <h2 style={{ color: '#0055BB', margin: '0 0 10px 0' }}>{problem.title}</h2>
                    <div style={{ fontSize: '13px', color: '#555' }}>
                        time limit per test: 2 seconds<br />
                        memory limit per test: 256 megabytes<br />
                        difficulty: <span style={{ fontWeight: 'bold' }}>{problem.difficulty}</span>
                    </div>
                </div>

                <div style={{ lineHeight: '1.6', marginBottom: '30px', fontSize: '14px' }}>
                    <p style={{ whiteSpace: 'pre-wrap', marginBottom: '20px' }}>
                        {problem.description}
                    </p>

                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Input</div>
                        <div className="monospaced-block">
                            {problem.stdIn || "No input available."}
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Output</div>
                        <div className="monospaced-block">
                            {problem.expectedOutput || "No output available."}
                        </div>
                    </div>
                </div>

                <div className="panel" style={{ marginTop: '40px' }}>
                    <div className="panel-title">Actions</div>
                    <div className="panel-content" style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Link to={`/${id}/edit`}>
                            <button className="cf-btn">Submit Code</button>
                        </Link>

                        <button onClick={handleGenerateKey} className="cf-btn">
                            Create 1v1 Battle
                        </button>

                        {battleStarted && (
                            <button
                                onClick={() => {
                                    if (window.confirm("Are you sure you want to quit the battle?")) {
                                        localStorage.removeItem("ctoken");
                                        localStorage.removeItem("QID");
                                        setBattleStarted(false);
                                        navigate('/');
                                    }
                                }}
                                className="cf-btn" style={{ color: 'red', borderColor: 'red' }}
                            >
                                Quit Battle
                            </button>
                        )}
                    </div>
                </div>

                {showKey && (
                    <div className="panel" style={{ marginTop: '20px' }}>
                        <div className="panel-title" style={{ backgroundColor: '#dff0d8', color: '#3c763d' }}>Battle Created</div>
                        <div className="panel-content text-center">
                            <p>Share this token with your opponent to start the battle:</p>
                            <h3 style={{ fontFamily: 'monospace', fontSize: '24px', letterSpacing: '2px', background: '#eee', display: 'inline-block', padding: '10px 20px', border: '1px solid #ccc' }}>
                                {key}
                            </h3>
                        </div>
                    </div>
                )}

                {waiting && (
                    <div style={{ padding: '15px', backgroundColor: '#fcf8e3', border: '1px solid #faebcc', color: '#8a6d3b', textAlign: 'center', marginTop: '15px' }}>
                        Waiting for opponent to join...
                    </div>
                )}

                <hr className="my-8" />

                <div className="panel">
                    <div className="panel-content">
                        <CommentList questionId={id} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SingleProblem;
