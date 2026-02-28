import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        navigate('/auth');
    };

    return (
        <div style={{ backgroundColor: '#fff', padding: '10px 15px', borderBottom: '1px solid #b9b9b9', marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <Link to="/" style={{ fontWeight: 'bold', fontSize: '18px', color: '#111' }}>
                        DuelCode
                    </Link>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <Link to="/">Problems</Link>
                        <Link to="/">Leaderboard</Link>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    {isLoggedIn ? (
                        <>
                            <span style={{ color: '#555' }}>Logged in</span>
                            <span>|</span>
                            <span
                                onClick={handleLogout}
                                style={{ color: '#0055BB', cursor: 'pointer' }}
                            >
                                Logout
                            </span>
                        </>
                    ) : (
                        <>
                            <Link to="/auth">Sign In</Link>
                            <span>|</span>
                            <Link to="/auth">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Navbar;
