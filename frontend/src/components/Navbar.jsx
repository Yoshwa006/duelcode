import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getMyActiveSession, getCurrentUserProfile } from '../service/api.js';

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeSession, setActiveSession] = useState(null);
    const [userProfile, setUserProfile] = useState(null);

    const isMatchPage = location.pathname.startsWith('/match');

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('jwt');
            setIsLoggedIn(!!token);
            
            if (token) {
                try {
                    const [session, profile] = await Promise.all([
                        getMyActiveSession(),
                        getCurrentUserProfile()
                    ]);
                    setActiveSession(session);
                    setUserProfile(profile);
                } catch (e) {
                    setActiveSession(null);
                    setUserProfile(null);
                }
            } else {
                setActiveSession(null);
                setUserProfile(null);
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
        setUserProfile(null);
        navigate('/');
    };

    const getRankColor = (rank) => {
        const colors = {
            'Newbie': '#808080',
            'Pupil': '#00CC00',
            'Specialist': '#00CCCC',
            'Expert': '#0000FF',
            'Candidate Master': '#9900FF',
            'Master': '#FFA500',
            'Grandmaster': '#FF0000',
            'Legendary Grandmaster': '#FFD700'
        };
        return colors[rank] || '#808080';
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
                    <Link to="/">
                        <div className="cf-brand-icon">D</div>
                    </Link>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div 
                                onClick={() => navigate('/profile')}
                                style={{ 
                                    cursor: 'pointer',
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '10px' 
                                }}
                            >
                                <div 
                                    style={{
                                        width: '30px',
                                        height: '30px',
                                        borderRadius: '50%',
                                        background: getRankColor(userProfile?.rank),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        color: '#fff'
                                    }}
                                >
                                    {userProfile?.username?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <span style={{ color: '#000', fontSize: '14px', fontWeight: '500' }}>
                                    {userProfile?.username || 'User'}
                                </span>
                            </div>
                            <span style={{ color: '#888' }}>|</span>
                            <span onClick={handleLogout} style={{ color: '#3666b0', cursor: 'pointer', fontSize: '13px' }}>
                                Logout
                            </span>
                        </div>
                    ) : (
                        <>
                            <Link to="/auth" className="cf-nav-link">Sign In</Link>
                            <span style={{ color: '#888' }}>|</span>
                            <Link to="/auth" className="cf-nav-link">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

export default Navbar;