import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/Navbar.jsx";
import get, { enterToken } from "../service/api.js";

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
        const data = await get();
        setQuestions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getDifficultyBg = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-600 bg-green-50 border border-green-200";
      case "Medium":
        return "text-orange-600 bg-orange-50 border border-orange-200";
      case "Hard":
        return "text-red-600 bg-red-50 border border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border border-gray-200";
    }
  };

  const clearVariables = () => {
    const jwt = localStorage.getItem("jwt");
    localStorage.clear();
    if (jwt) localStorage.setItem("jwt", jwt);
  };

  const handleTokenSubmit = async () => {
    if (!token.trim()) {
      setError("Please enter a token");
      return;
    }

    try {
      const res = await enterToken({ token });
      setToken("");
      if (res !== -1) {
        navigate(`/${res}`);
      } else {
        setError("Invalid token or session full.");
      }
    } catch {
      setError("Error submitting token.");
    }
  };

  const handleProblemClick = (problemId) => {
    navigate(`/${problemId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-gray-900 pt-16">
        <NavBar />
        <div className="flex items-center justify-center py-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading problems...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white text-gray-900 pt-16">
        <NavBar />
        <div className="flex items-center justify-center py-10">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-2">Error loading problems</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
             
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 pt-16 mt-7">
      <NavBar />
      <main>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
              <div className="col-span-1">#</div>
              <div className="col-span-7">Title</div>
              <div className="col-span-4">Difficulty</div>
            </div>
          </div>
                 <button
                onClick={clearVariables}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
              >
                Clear Variables
              </button>
          {/* Problems List */}
          <div className="divide-y divide-gray-200">
            {questions.map((problem, index) => (
              <div
                key={problem.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleProblemClick(problem.id)}
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-1">
                    <span className="text-gray-500 text-sm">{index + 1}</span>
                  </div>
                  <div className="col-span-7">
                    <div className="flex flex-col">
                      <span className="text-black hover:text-blue-800 font-medium mb-1 transition-colors">
                        {problem.title}
                      </span>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                        {problem.description}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyBg(
                        problem.difficulty
                      )}`}
                    >
                      {problem.difficulty}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Token Input */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter a token"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleTokenSubmit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Submit Token
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
