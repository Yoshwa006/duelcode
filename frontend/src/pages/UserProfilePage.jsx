import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getUserProfile, sendFriendRequest, getCurrentUserProfile } from '../service/api';

function UserProfilePage() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userData, currentData] = await Promise.all([
                    getUserProfile(parseInt(userId)),
                    getCurrentUserProfile()
                ]);
                setUser(userData);
                setCurrentUser(currentData);
            } catch (err) {
                setMessage({ type: 'error', text: 'Failed to load user profile' });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userId]);

    const handleSendFriendRequest = async () => {
        try {
            await sendFriendRequest(parseInt(userId));
            setMessage({ type: 'success', text: 'Friend request sent!' });
            const updatedUser = await getUserProfile(parseInt(userId));
            setUser(updatedUser);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to send request' });
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

    if (loading) {
        return (
            <div className="container">
                <Navbar />
                <div className="loading-spinner">Loading profile...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container">
                <Navbar />
                <div className="page-container">
                    <div className="alert alert-error">User not found</div>
                </div>
            </div>
        );
    }

    const isOwnProfile = currentUser?.id === user.id;

    return (
        <div className="container">
            <Navbar />
            <div className="page-container">
                {message && (
                    <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                        {message.text}
                    </div>
                )}

                <div className="panel slide-up">
                    <div className="panel-title">
                        <span>👤</span> {user.username}'s Profile
                        {isOwnProfile && (
                            <button 
                                onClick={() => navigate('/profile')} 
                                className="cf-btn"
                                style={{ marginLeft: 'auto', fontSize: '12px' }}
                            >
                                Edit My Profile
                            </button>
                        )}
                    </div>
                    <div className="panel-content">
                        <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <div style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                background: getRankColor(user.rank),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '48px',
                                fontWeight: 'bold',
                                color: '#fff',
                                flexShrink: 0
                            }}>
                                {user.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h2 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 10px 0', color: '#000' }}>
                                    {user.username}
                                </h2>
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <span style={{ 
                                        background: getRankColor(user.rank), 
                                        padding: '3px 10px', 
                                        borderRadius: '4px', 
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: '#fff'
                                    }}>
                                        {user.rank || 'Newbie'}
                                    </span>
                                    <span style={{ color: '#666', fontSize: '14px' }}>
                                        Rating: <span style={{ color: '#000', fontWeight: '600' }}>{user.rating || 1200}</span>
                                    </span>
                                    <span style={{ color: '#666', fontSize: '14px' }}>
                                        Max: <span style={{ color: '#000', fontWeight: '600' }}>{user.maxRating || 1200}</span>
                                    </span>
                                </div>
                                <div style={{ marginTop: '8px', color: '#888', fontSize: '13px' }}>
                                    {user.email}
                                </div>
                            </div>
                            {!isOwnProfile && (
                                <div>
                                    {user.isFriend ? (
                                        <span style={{ color: '#28a745', fontWeight: '600' }}>Friend</span>
                                    ) : user.hasPendingRequest ? (
                                        <span style={{ color: '#ff9800', fontWeight: '600' }}>Request Pending</span>
                                    ) : (
                                        <button 
                                            onClick={handleSendFriendRequest}
                                            className="cf-btn-primary"
                                        >
                                            Add Friend
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="divider-line"></div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <div>
                                <div style={{ color: '#888', fontSize: '12px', marginBottom: '3px' }}>From</div>
                                <div style={{ color: '#000', fontSize: '15px' }}>{user.country || '-'}{user.city ? `, ${user.city}` : ''}</div>
                            </div>
                            <div>
                                <div style={{ color: '#888', fontSize: '12px', marginBottom: '3px' }}>Organization</div>
                                <div style={{ color: '#000', fontSize: '15px' }}>{user.organization || '-'}</div>
                            </div>
                            <div>
                                <div style={{ color: '#888', fontSize: '12px', marginBottom: '3px' }}>Contribution</div>
                                <div style={{ color: '#000', fontSize: '15px' }}>{user.contribution || 0}</div>
                            </div>
                            <div>
                                <div style={{ color: '#888', fontSize: '12px', marginBottom: '3px' }}>Friends</div>
                                <div style={{ color: '#000', fontSize: '15px' }}>{user.friendCount || 0}</div>
                            </div>
                        </div>

                        {(user.website || user.twitter || user.github || user.linkedin) && (
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>Contacts</div>
                                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                    {user.website && (
                                        <a href={user.website.startsWith('http') ? user.website : `https://${user.website}`} target="_blank" rel="noopener noreferrer" style={{ color: '#3666b0' }}>
                                            🌐 {user.website}
                                        </a>
                                    )}
                                    {user.twitter && <span style={{ color: '#3666b0' }}>🐦 @{user.twitter}</span>}
                                    {user.github && <span style={{ color: '#3666b0' }}>💻 github.com/{user.github}</span>}
                                    {user.linkedin && <span style={{ color: '#3666b0' }}>💼 {user.linkedin}</span>}
                                </div>
                            </div>
                        )}

                        {user.bio && (
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>Bio</div>
                                <div style={{ color: '#333', fontSize: '14px', lineHeight: '1.6' }}>{user.bio}</div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="panel slide-up" style={{ marginTop: '20px' }}>
                    <div className="panel-title">
                        <span>📊</span> Statistics
                    </div>
                    <div className="panel-content">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', textAlign: 'center' }}>
                            <div>
                                <div style={{ fontSize: '24px', fontWeight: '700', color: '#000' }}>{user.eloRating || 1200}</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>ELO Rating</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '24px', fontWeight: '700', color: '#28a745' }}>{user.rankedWins || 0}</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Wins</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc3545' }}>{user.rankedLosses || 0}</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Losses</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '24px', fontWeight: '700', color: '#3666b0' }}>{user.questionsSolved || 0}</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Problems Solved</div>
                            </div>
                        </div>
                        <div className="divider-line" style={{ margin: '20px 0' }}></div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', textAlign: 'center' }}>
                            <div>
                                <div style={{ fontSize: '18px', fontWeight: '600', color: '#28a745' }}>{user.easySolved || 0}</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Easy</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '18px', fontWeight: '600', color: '#ff9800' }}>{user.mediumSolved || 0}</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Medium</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '18px', fontWeight: '600', color: '#dc3545' }}>{user.hardSolved || 0}</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Hard</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserProfilePage;