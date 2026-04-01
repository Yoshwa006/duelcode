import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/Navbar.jsx";
import { getQuestions, enterToken } from "../service/api.js";

function Home() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getQuestions();
        setQuestions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const clearVariables = () => {
    const jwt = localStorage.getItem("jwt");
    localStorage.clear();
    if (jwt) localStorage.setItem("jwt", jwt);
  };

  const handleSubmitKey = async () => {
    if (!token.trim()) {
      setError("Please enter the key !");
      return;
    }

    try {
      const res = await enterToken({ token });
      if (res.status === "SUCCESS" || res.errorCode === 0) {
        navigate(`/match/${token}`);
      } else {
        setError(res.message || "Invalid key or session already full.");
      }
    } catch (err) {
      setError(err.message || "Error submitting key.");
    }
  };

  const handleProblemClick = (problemId) => {
    navigate(`/${problemId}`);
  };

  if (loading) {
    return (
      <div className="container">
        <NavBar />
        <div style={{ padding: '20px', textAlign: 'center' }}>
          Loading problems...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <NavBar />
        <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>
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
          <button onClick={clearVariables} className="cf-btn">Clear Variables</button>
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
                    style={{ color: '#0055BB', cursor: 'pointer', fontWeight: 'bold' }}
                    onClick={() => handleProblemClick(problem.id)}
                  >
                    {problem.title}
                  </span>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                    {problem.description?.substring(0, 100)}...
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span style={{
                    color: problem.difficulty === 'Hard' ? 'red' :
                      problem.difficulty === 'Medium' ? 'orange' : 'green'
                  }}>
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
