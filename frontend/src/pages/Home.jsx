import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/Navbar.jsx";
import { getQuestions, enterToken, getMyActiveSession } from "../service/api.js";

function Home() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState("");
  const [activeSession, setActiveSession] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getQuestions();
        setQuestions(data);
        
        const session = await getMyActiveSession();
        setActiveSession(session);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmitKey = async () => {
    if (!token.trim()) {
      setError("Please enter the key!");
      return;
    }

    try {
      const res = await enterToken(token.trim());
      if (res.status === "SUCCESS" || res.errorCode === 0) {
        navigate(`/match/${token.trim()}`);
      } else {
        setError(res.message || "Invalid key or session already full.");
      }
    } catch (err) {
      setError(err.message || "Error submitting key.");
    }
  };

  const handleProblemClick = (problemId) => {
    if (activeSession) {
      navigate(`/match/${activeSession.token}`);
    } else {
      navigate(`/${problemId}`);
    }
  };

  const getDifficultyClass = (difficulty) => {
    switch(difficulty?.toUpperCase()) {
      case 'HARD': return 'difficulty-hard';
      case 'MEDIUM': return 'difficulty-medium';
      case 'EASY': return 'difficulty-easy';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="container">
        <NavBar />
        <div className="loading-spinner">
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span>Loading problems...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <NavBar />
        <div className="page-container">
          <div className="alert alert-error">
            <strong>Error:</strong> {error}
            <br /><br />
            <button onClick={() => window.location.reload()} className="cf-btn">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <NavBar />

      <div className="page-container">
        <div className="flex-row">
          <h1 className="page-title">Problemset</h1>
          <button 
            onClick={() => activeSession ? navigate(`/match/${activeSession.token}`) : navigate('/create-problem')} 
            className="cf-btn-primary btn-icon"
          >
            <span>⚔️</span>
            {activeSession ? 'Return to Battle' : 'Create Problem'}
          </button>
        </div>

        <div className="panel">
          <table className="cf-table">
            <thead>
              <tr>
                <th style={{ width: '60px', textAlign: 'center' }}>#</th>
                <th>Name</th>
                <th style={{ width: '120px', textAlign: 'center' }}>Difficulty</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((problem, index) => (
                <tr key={problem.id}>
                  <td style={{ textAlign: 'center', color: '#666' }}>{index + 1}</td>
                  <td>
                    <span
                      className="problem-link"
                      onClick={() => handleProblemClick(problem.id)}
                    >
                      {problem.title}
                    </span>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      {problem.description?.substring(0, 80)}...
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={getDifficultyClass(problem.difficulty)}>
                      {problem.difficulty}
                    </span>
                  </td>
                </tr>
              ))}
              {questions.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                    No problems available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="panel slide-up" style={{ marginTop: '30px' }}>
          <div className="panel-title">
            <span>🎯</span> Join Battle Challenge
          </div>
          <div className="panel-content" style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter session token..."
              style={{ width: '250px', padding: '10px 15px' }}
            />
            <button onClick={handleSubmitKey} className="cf-btn-primary">
              Join Match
            </button>
            {error && <span style={{ color: '#ff6666', fontSize: '13px' }}>{error}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;