import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { questionsApi, matchApi } from "../service/api";
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
                const problemData = await questionsApi.getById(id);
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

    const handleGenerateKey = async () => {
        try {
            setWaiting(true);

            const generated_key = await matchApi.generateKey(id);
            
            const token = typeof generated_key === 'string' ? generated_key : generated_key.token || JSON.stringify(generated_key);
            
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

    const getDifficultyClass = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy':
                return 'difficulty-easy';
            case 'medium':
                return 'difficulty-medium';
            case 'hard':
                return 'difficulty-hard';
            default:
                return '';
        }
    };

    const isLoggedIn = () => !!localStorage.getItem('jwt');

    const handleCreateBattle = () => {
        if (!isLoggedIn()) {
            navigate('/auth');
            return;
        }
        handleGenerateKey();
    };

    if (loading) return (
        <div className="container">
            <Navbar />
            <div className="loading-spinner">
                <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <span>Loading problem...</span>
            </div>
        </div>
    );

    if (error) return (
        <div className="container">
            <Navbar />
            <div className="page-container">
                <div className="alert alert-error">
                    <strong>Error:</strong> {error}
                </div>
            </div>
        </div>
    );

    if (!problem) return (
        <div className="container">
            <Navbar />
            <div className="page-container">
                <div className="alert alert-warning">Problem not found.</div>
            </div>
        </div>
    );

    return (
        <div className="container">
            <Navbar />
            <div className="page-container">
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ color: '#4a7fc7', margin: '0 0 15px 0', fontSize: '28px', fontWeight: '700' }}>
                        {problem.title}
                    </h2>
                    <div style={{ fontSize: '13px', color: '#888', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                        <span>⏱️ 2 seconds</span>
                        <span>💾 256 MB</span>
                        <span>📊 Difficulty: <span className={getDifficultyClass(problem.difficulty)}>{problem.difficulty}</span></span>
                    </div>
                </div>

                <div className="panel slide-up">
                    <div className="panel-title">
                        <span>📖</span> Problem Statement
                    </div>
                    <div className="panel-content" style={{ lineHeight: '1.8', fontSize: '14px', color: '#ddd' }}>
                        <p style={{ whiteSpace: 'pre-wrap', marginBottom: '25px' }}>
                            {problem.description}
                        </p>

                        {problem.stdIn && (
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#ff8c00', marginBottom: '10px' }}>
                                    📥 Input
                                </div>
                                <pre className="code-block">{problem.stdIn}</pre>
                            </div>
                        )}

                        {problem.expectedOutput && (
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#4caf50', marginBottom: '10px' }}>
                                    📤 Output
                                </div>
                                <pre className="code-block">{problem.expectedOutput}</pre>
                            </div>
                        )}
                    </div>
                </div>

                <div className="panel" style={{ marginTop: '25px' }}>
                    <div className="panel-title">
                        <span>⚔️</span> Actions
                    </div>
                    <div className="panel-content" style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Link to={`/${id}/edit`}>
                            <button className="cf-btn-primary btn-icon">
                                <span>📝</span> Submit Code
                            </button>
                        </Link>

                        <button onClick={handleCreateBattle} className="cf-btn-primary btn-icon">
                            <span>⚔️</span> Create 1v1 Battle
                        </button>

                        {battleStarted && (
                            <button
                                onClick={() => {
                                    if (window.confirm("Are you sure you want to quit the battle?")) {
                                        localStorage.removeItem("sessionToken");
                                        setBattleStarted(false);
                                        navigate('/');
                                    }
                                }}
                                className="cf-btn-danger"
                            >
                                🏳️ Quit Battle
                            </button>
                        )}
                    </div>
                </div>

                {showKey && (
                    <div className="panel slide-up" style={{ marginTop: '20px' }}>
                        <div className="panel-title" style={{ background: 'linear-gradient(90deg, #28a745 0%, #20c997 100%)' }}>
                            🎉 Battle Created
                        </div>
                        <div className="panel-content" style={{ textAlign: 'center' }}>
                            <p style={{ color: '#888', marginBottom: '15px' }}>Share this token with your opponent to start the battle:</p>
                            <h3 style={{ 
                                fontFamily: 'monospace', 
                                fontSize: '28px', 
                                letterSpacing: '3px', 
                                background: 'var(--cf-bg-tertiary)', 
                                display: 'inline-block', 
                                padding: '15px 30px', 
                                border: '2px solid var(--cf-blue)',
                                borderRadius: '8px',
                                color: '#fff'
                            }}>
                                {key}
                            </h3>
                        </div>
                    </div>
                )}

                {waiting && (
                    <div className="alert alert-warning" style={{ marginTop: '20px', textAlign: 'center' }}>
                        ⏳ Waiting for opponent to join...
                    </div>
                )}

                <div className="divider-line"></div>

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