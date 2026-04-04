import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('jwt');
            setIsLoggedIn(!!token);
        };
        checkAuth();
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('jwt');
        sessionStorage.removeItem('sessionToken');
        setIsLoggedIn(false);
        navigate('/');
    };

    return (
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
    );
}

export default Navbar;