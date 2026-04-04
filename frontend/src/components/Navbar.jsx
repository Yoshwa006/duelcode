import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyActiveSession } from '../service/api.js';

function Navbar() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeSession, setActiveSession] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('jwt');
            setIsLoggedIn(!!token);
            
            if (token) {
                try {
                    const session = await getMyActiveSession();
                    setActiveSession(session);
                } catch (e) {
                    setActiveSession(null);
                }
            } else {
                setActiveSession(null);
            }
        };
        checkAuth();
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('jwt');
        sessionStorage.removeItem('sessionToken');
        setIsLoggedIn(false);
        setActiveSession(null);
        navigate('/');
    };

    return (
        <>
            {activeSession && (
                <div style={{ 
                    backgroundColor: '#ff9800', 
                    color: '#000',
                    padding: '8px 20px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <span>⚔️ You are in an active battle!</span>
                    <span style={{ fontWeight: 'normal' }}>
                        ({activeSession.questionTitle})
                    </span>
                    <button 
                        onClick={() => navigate(`/match/${activeSession.token}`)}
                        style={{
                            backgroundColor: '#fff',
                            border: '1px solid #333',
                            padding: '3px 10px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Return to Battle →
                    </button>
                </div>
            )}
            
            <div className="cf-nav">
                <div className="cf-nav-brand">
                    <Link to="/">DuelCode</Link>
                </div>
                
                <div className="cf-nav-links">
                    <Link to="/" className="cf-nav-link">Problems</Link>
                    <Link to="/" className="cf-nav-link">Leaderboard</Link>
                    {isLoggedIn && (
                        <Link to="/create-problem" className="cf-nav-link">Create Problem</Link>
                    )}
                </div>

                <div className="cf-nav-user">
                    {isLoggedIn ? (
                        <>
                            <span>Logged in</span>
                            <span className="cf-divider">|</span>
                            <span onClick={handleLogout} style={{ color: '#0000BB', cursor: 'pointer' }}>
                                Logout
                            </span>
                        </>
                    ) : (
                        <>
                            <Link to="/auth" className="cf-nav-link">Sign In</Link>
                            <span className="cf-divider">|</span>
                            <Link to="/auth" className="cf-nav-link">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

export default Navbar;