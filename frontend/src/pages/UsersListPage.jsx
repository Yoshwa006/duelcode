import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getUsers, searchUsers, sendFriendRequest, getCurrentUserProfile } from '../service/api';

function UsersListPage() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [search, setSearch] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const profile = await getCurrentUserProfile();
                setCurrentUser(profile);
            } catch (err) {
                console.error('Failed to fetch current user');
            }
        };
        fetchCurrentUser();
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [page]);

    const fetchUsers = async (searchQuery = '') => {
        setLoading(true);
        try {
            const data = await getUsers(page, 20, searchQuery);
            setUsers(data.content);
            setTotalPages(data.totalPages);
        } catch (err) {
            console.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(0);
        fetchUsers(search);
    };

    const handleSendRequest = async (receiverId) => {
        try {
            await sendFriendRequest(receiverId);
            alert('Friend request sent!');
            fetchUsers(search);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to send request');
        }
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
        <div className="container">
            <Navbar />
            <div className="page-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h1 className="page-title">Users</h1>
                </div>

                <div className="panel">
                    <div className="panel-content">
                        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by username..."
                                style={{ flex: 1, maxWidth: '300px' }}
                            />
                            <button type="submit" className="cf-btn-primary">Search</button>
                        </form>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-spinner">Loading users...</div>
                ) : (
                    <>
                        <div className="panel">
                            <table className="cf-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '50px' }}>#</th>
                                        <th>User</th>
                                        <th style={{ width: '100px' }}>Rank</th>
                                        <th style={{ width: '100px' }}>Rating</th>
                                        <th style={{ width: '150px' }}>Country</th>
                                        <th style={{ width: '120px' }}>Friends</th>
                                        <th style={{ width: '150px' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user, index) => (
                                        <tr key={user.id}>
                                            <td style={{ textAlign: 'center' }}>{page * 20 + index + 1}</td>
                                            <td>
                                                <Link to={`/users/${user.id}`} style={{ fontWeight: '600', color: '#3666b0' }}>
                                                    {user.username}
                                                </Link>
                                                <div style={{ fontSize: '12px', color: '#888' }}>{user.email}</div>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span style={{ 
                                                    background: getRankColor(user.rank), 
                                                    padding: '2px 8px', 
                                                    borderRadius: '3px',
                                                    fontSize: '11px',
                                                    color: '#fff'
                                                }}>
                                                    {user.rank || 'Newbie'}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'center', fontWeight: '600' }}>
                                                {user.rating || 1200}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                {user.country || '-'}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                {user.friendCount || 0}
                                            </td>
                                            <td>
                                                {currentUser && user.id !== currentUser.id && (
                                                    user.isFriend ? (
                                                        <span style={{ color: '#28a745', fontSize: '12px' }}>Friend</span>
                                                    ) : user.hasPendingRequest ? (
                                                        <span style={{ color: '#ff9800', fontSize: '12px' }}>Pending</span>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleSendRequest(user.id)}
                                                            className="cf-btn"
                                                            style={{ fontSize: '12px', padding: '4px 10px' }}
                                                        >
                                                            Add Friend
                                                        </button>
                                                    )
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>
                                                No users found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                                <button 
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="cf-btn"
                                >
                                    Previous
                                </button>
                                <span style={{ padding: '8px 15px' }}>
                                    Page {page + 1} of {totalPages}
                                </span>
                                <button 
                                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={page >= totalPages - 1}
                                    className="cf-btn"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default UsersListPage;