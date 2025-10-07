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
        <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex justify-between h-14 items-center text-1xl">
                    <div className="flex items-center space-x-8">
                        <Link to="/" className="font-semibold text-white">
                            Yoshwa
                        </Link>
                        <div className="hidden md:flex items-center space-x-6">
                            <Link to="/" className="text-white hover:text-gray-700 transition">
                                Problems
                            </Link>
                            <Link to="/" className="text-black hover:text-gray-700 transition">
                                Contact
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        {isLoggedIn ? (
                            <button
                                onClick={handleLogout}
                                className="text-white border border-gray-300 px-3 py-1 rounded hover:bg-blue-500 transition"
                            >
                                Logout
                            </button>
                        ) : (
                            <>
                                <Link
                                    to="/auth"
                                    className="text-black border border-gray-300 px-3 py-1 rounded hover:bg-gray-100 transition"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/auth"
                                    className="text-black border border-gray-300 px-3 py-1 rounded hover:bg-gray-100 transition"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
