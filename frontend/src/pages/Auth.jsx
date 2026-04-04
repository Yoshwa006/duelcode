import { useState } from "react";
import { login, register } from "../service/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      if (mode === "register") {
        if (password.length < 6) {
          setMsg("Password must be at least 6 characters");
          setStatus("error");
          setLoading(false);
          return;
        }
        await register({ email, password });
        setMsg("Registered! Now sign in.");
        setStatus("success");
        setMode("login");
      } else {
        const token = await login({ email, password });
        setMsg("Login successful!");
        setStatus("success");
        setTimeout(() => navigate('/'), 500);
      }
      setEmail("");
      setPassword("");
    } catch (err) {
      setMsg(err.response?.data?.message || err.message || "Something went wrong.");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Navbar />
      <div className="page-container">
        <div style={{ maxWidth: '420px', margin: '40px auto' }}>
          <div className="panel slide-up">
            <div className="panel-title">
              <span>🔐</span> {mode === "register" ? "Create Account" : "Sign In"}
            </div>

            <div className="panel-content">
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    required
                    minLength={mode === "register" ? 6 : undefined}
                    disabled={loading}
                  />
                  {mode === "register" && (
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                      Password must be at least 6 characters
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="cf-btn-primary"
                  style={{ padding: '12px', fontSize: '15px', fontWeight: '600' }}
                >
                  {loading ? (
                    <span>
                      <span className="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </span> Processing...
                    </span>
                  ) : mode === "register" ? "Register" : "Login"}
                </button>
              </form>

              <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#888' }}>
                <span
                  onClick={() => {
                    setMode(mode === "login" ? "register" : "login");
                    setMsg("");
                    setStatus(null);
                  }}
                  style={{ color: '#4a7fc7', cursor: 'pointer' }}
                >
                  {mode === "login" ? "Need an account? Register" : "Have an account? Sign in"}
                </span>
              </div>

              {msg && (
                <div className={`alert ${status === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginTop: '20px' }}>
                  {msg}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}