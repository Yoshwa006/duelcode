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
      setError("Please enter the key !");
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

  const handleStartBattle = (problemId) => {
    if (activeSession) {
      navigate(`/match/${activeSession.token}`);
    } else {
      navigate(`/match/create/${problemId}`);
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
        <div className="loading-spinner">Loading problems...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <NavBar />
        <div className="alert alert-error">
          Error loading problems: {error}
          <br /><br />
          <button onClick={() => window.location.reload()} className="cf-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <NavBar />

      <div style={{ marginTop: '20px' }}>
        <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Problemset</div>
          <button 
            onClick={() => activeSession ? navigate(`/match/${activeSession.token}`) : navigate('/create-problem')} 
            className="cf-btn"
          >
            {activeSession ? 'Return to Battle' : 'Create Problem'}
          </button>
        </div>

        <table className="cf-table">
          <thead>
            <tr>
              <th style={{ width: '5%' }}>#</th>
              <th style={{ width: '70%' }}>Name</th>
              <th style={{ width: '25%' }}>Difficulty</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((problem, index) => (
              <tr key={problem.id}>
                <td style={{ textAlign: 'center' }}>{index + 1}</td>
                <td>
                  <span
                    className="problem-link"
                    onClick={() => handleProblemClick(problem.id)}
                  >
                    {problem.title}
                  </span>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                    {problem.description?.substring(0, 100)}...
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
                <td colSpan="3" style={{ textAlign: 'center', padding: '15px' }}>No problems available.</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="panel" style={{ marginTop: '30px' }}>
          <div className="panel-title">Join Battle Challenge</div>
          <div className="panel-content" style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter session token..."
              style={{ width: '200px' }}
            />
            <button onClick={handleSubmitKey} className="cf-btn">Join Match</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
