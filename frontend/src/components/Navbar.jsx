import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getMyActiveSession } from '../service/api.js';

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeSession, setActiveSession] = useState(null);

    const isMatchPage = location.pathname.startsWith('/match');

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
            {activeSession && !isMatchPage && (
                <div className="battle-banner">
                    <span className="battle-banner-icon">⚔️</span>
                    <span>You are in an active battle!</span>
                    <span style={{ fontWeight: 'normal', opacity: 0.9 }}>
                        ({activeSession.questionTitle})
                    </span>
                    <button 
                        onClick={() => navigate(`/match/${activeSession.token}`)}
                        style={{
                            backgroundColor: '#fff',
                            color: '#ff8c00',
                            border: 'none',
                            padding: '5px 15px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            borderRadius: '4px',
                            marginLeft: '10px'
                        }}
                    >
                        Return to Battle →
                    </button>
                </div>
            )}
            
            <div className="cf-nav">
                <div className="cf-nav-brand">
                    <div className="cf-brand-icon">D</div>
                    <Link to="/">DuelCode</Link>
                </div>
                
                <div className="cf-nav-links">
                    <Link to="/" className="cf-nav-link">Problems</Link>
                    <Link to="/" className="cf-nav-link">Contests</Link>
                    <Link to="/" className="cf-nav-link">Leaderboard</Link>
                    {isLoggedIn && (
                        <Link to="/create-problem" className="cf-nav-link">Create Problem</Link>
                    )}
                </div>

                <div className="cf-nav-user">
                    {isLoggedIn ? (
                        <>
                            <div className="avatar">U</div>
                            <span>User</span>
                            <span className="cf-divider">|</span>
                            <span onClick={handleLogout} style={{ color: '#ff6666', cursor: 'pointer' }}>
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