import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getFriends, getFriendRequests, getSentRequests, acceptFriendRequest, rejectFriendRequest, removeFriend } from '../service/api';

function FriendsPage() {
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('friends');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [friendsData, requestsData, sentData] = await Promise.all([
                getFriends(),
                getFriendRequests(),
                getSentRequests()
            ]);
            setFriends(friendsData);
            setRequests(requestsData);
            setSentRequests(sentData);
        } catch (err) {
            console.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (requestId) => {
        try {
            await acceptFriendRequest(requestId);
            fetchData();
        } catch (err) {
            alert('Failed to accept request');
        }
    };

    const handleReject = async (requestId) => {
        try {
            await rejectFriendRequest(requestId);
            fetchData();
        } catch (err) {
            alert('Failed to reject request');
        }
    };

    const handleRemoveFriend = async (friendId) => {
        if (!confirm('Are you sure you want to remove this friend?')) return;
        try {
            await removeFriend(friendId);
            fetchData();
        } catch (err) {
            alert('Failed to remove friend');
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

    const renderUserCard = (user, showRemove = false) => (
        <div key={user.id} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '12px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            marginBottom: '10px',
            background: '#fff'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: getRankColor(user.rank),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '16px'
                }}>
                    {user.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                    <Link to={`/users/${user.id}`} style={{ fontWeight: '600', color: '#3666b0' }}>
                        {user.username}
                    </Link>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                        <span style={{ color: getRankColor(user.rank) }}>{user.rating || 1200}</span>
                        {' • '}
                        {user.country || 'No country'}
                    </div>
                </div>
            </div>
            {showRemove && (
                <button 
                    onClick={() => handleRemoveFriend(user.id)}
                    className="cf-btn"
                    style={{ fontSize: '12px', color: '#dc3545' }}
                >
                    Remove
                </button>
            )}
        </div>
    );

    return (
        <div className="container">
            <Navbar />
            <div className="page-container">
                <h1 className="page-title">Friends</h1>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <button 
                        onClick={() => setActiveTab('friends')}
                        className={activeTab === 'friends' ? 'cf-btn-primary' : 'cf-btn'}
                    >
                        Friends ({friends.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('requests')}
                        className={activeTab === 'requests' ? 'cf-btn-primary' : 'cf-btn'}
                    >
                        Requests ({requests.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('sent')}
                        className={activeTab === 'sent' ? 'cf-btn-primary' : 'cf-btn'}
                    >
                        Sent ({sentRequests.length})
                    </button>
                </div>

                {loading ? (
                    <div className="loading-spinner">Loading...</div>
                ) : (
                    <>
                        {activeTab === 'friends' && (
                            <div className="panel">
                                <div className="panel-title">My Friends</div>
                                <div className="panel-content">
                                    {friends.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                                            You don't have any friends yet.
                                        </div>
                                    ) : (
                                        friends.map(friend => renderUserCard(friend, true))
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'requests' && (
                            <div className="panel">
                                <div className="panel-title">Friend Requests</div>
                                <div className="panel-content">
                                    {requests.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                                            No pending friend requests.
                                        </div>
                                    ) : (
                                        requests.map(req => (
                                            <div key={req.id} style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'space-between',
                                                padding: '12px',
                                                border: '1px solid #ccc',
                                                borderRadius: '5px',
                                                marginBottom: '10px',
                                                background: '#fff'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '50%',
                                                        background: getRankColor(req.sender.rank),
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#fff',
                                                        fontWeight: 'bold',
                                                        fontSize: '16px'
                                                    }}>
                                                        {req.sender.username?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                    <div>
                                                        <Link to={`/users/${req.sender.id}`} style={{ fontWeight: '600', color: '#3666b0' }}>
                                                            {req.sender.username}
                                                        </Link>
                                                        <div style={{ fontSize: '12px', color: '#888' }}>
                                                            wants to be your friend
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <button 
                                                        onClick={() => handleAccept(req.id)}
                                                        className="cf-btn-primary"
                                                        style={{ fontSize: '12px', padding: '6px 12px' }}
                                                    >
                                                        Accept
                                                    </button>
                                                    <button 
                                                        onClick={() => handleReject(req.id)}
                                                        className="cf-btn"
                                                        style={{ fontSize: '12px', padding: '6px 12px' }}
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'sent' && (
                            <div className="panel">
                                <div className="panel-title">Sent Requests</div>
                                <div className="panel-content">
                                    {sentRequests.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                                            You haven't sent any friend requests.
                                        </div>
                                    ) : (
                                        sentRequests.map(req => (
                                            <div key={req.id} style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'space-between',
                                                padding: '12px',
                                                border: '1px solid #ccc',
                                                borderRadius: '5px',
                                                marginBottom: '10px',
                                                background: '#fff'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '50%',
                                                        background: getRankColor(req.receiver.rank),
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#fff',
                                                        fontWeight: 'bold',
                                                        fontSize: '16px'
                                                    }}>
                                                        {req.receiver.username?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                    <div>
                                                        <Link to={`/users/${req.receiver.id}`} style={{ fontWeight: '600', color: '#3666b0' }}>
                                                            {req.receiver.username}
                                                        </Link>
                                                        <div style={{ fontSize: '12px', color: '#888' }}>
                                                            Request pending...
                                                        </div>
                                                    </div>
                                                </div>
                                                <span style={{ color: '#ff9800', fontSize: '12px' }}>Pending</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default FriendsPage;