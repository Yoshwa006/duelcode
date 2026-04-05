import { useState } from "react";
import { login, register } from "../service/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
  };

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

              <div style={{ marginTop: '25px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  style={{ 
                    width: '100%', 
                    padding: '12px',
                    backgroundColor: '#fff',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    fontSize: '15px',
                    fontWeight: '500',
                    color: '#333'
                  }}
                >
                  <svg viewBox="0 0 48 48" style={{ width: '20px', height: '20px' }}>
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v4h4.611C26.63,30.28,22.524,36,16,36c-7.733,0-14-6.267-14-14s6.267-14,14-14c3.104,0,5.92,1.008,8.213,2.683l2.324-2.324C37.322,9.225,34.706,8,32,8c-8.837,0-16,7.163-16,16s7.163,16,16,16c6.629,0,12.629-4.389,14.963-10.611L43.611,20.083z"/>
                    <path fill="#FF3D00" d="M6.354,18.271l2.324,2.324C10.035,22.108,12.457,24,16,24c4.418,0,8.418-2.512,10.269-6.211l-4.269-4.269C19.764,14.786,17.943,14,16,14c-3.866,0-7,3.134-7,7S12.134,21,16,21c1.943,0,3.764-0.786,5.091-2.052l-4.269-4.269C15.635,15.786,13.893,15,12,15C8.134,15,5,18.134,5,22s3.134,7,7,7c1.893,0,3.635-0.786,4.822-2.052L15.822,24H24v-4h-4.269L6.354,18.271z"/>
                    <path fill="#4CAF50" d="M29,20h-4v4h4V20z"/>
                    <path fill="#1976D2" d="M25,20h-4v4h4V20z"/>
                  </svg>
                  Continue with Google
                </button>
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