import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { usersApi } from '../service/api';

function ProfilePage() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    const [formData, setFormData] = useState({
        username: '',
        country: '',
        city: '',
        organization: '',
        website: '',
        twitter: '',
        github: '',
        linkedin: '',
        bio: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await usersApi.getCurrent();
                setProfile(data);
                setFormData({
                    username: data.username || '',
                    country: data.country || '',
                    city: data.city || '',
                    organization: data.organization || '',
                    website: data.website || '',
                    twitter: data.twitter || '',
                    github: data.github || '',
                    linkedin: data.linkedin || '',
                    bio: data.bio || ''
                });
            } catch (err) {
                setMessage({ type: 'error', text: 'Failed to load profile' });
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const updated = await usersApi.update(formData);
            setProfile(updated);
            setEditing(false);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setSaving(false);
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
                <div className="loading-spinner">
                    <div className="loading-dots">
                        <span></span><span></span><span></span>
                    </div>
                    <span>Loading profile...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <Navbar />
            <div className="page-container">
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div className="panel slide-up">
                        <div className="panel-title">
                            <span>👤</span> Profile
                            {!editing && (
                                <button 
                                    onClick={() => setEditing(true)} 
                                    className="cf-btn"
                                    style={{ marginLeft: 'auto', fontSize: '12px' }}
                                >
                                    ✏️ Edit Profile
                                </button>
                            )}
                        </div>
                        <div className="panel-content">
                            {message && (
                                <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                                    {message.text}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', marginBottom: '20px' }}>
                                <div style={{
                                    width: '120px',
                                    height: '120px',
                                    borderRadius: '50%',
                                    background: getRankColor(profile?.rank),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '48px',
                                    fontWeight: 'bold',
                                    color: '#fff',
                                    flexShrink: 0
                                }}>
                                    {profile?.username?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    {editing ? (
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="Username"
                                            style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px', width: '100%' }}
                                        />
                                    ) : (
                                        <h2 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 10px 0', color: '#000' }}>
                                            {profile?.username || 'User'}
                                        </h2>
                                    )}
                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <span style={{ 
                                            background: getRankColor(profile?.rank), 
                                            padding: '3px 10px', 
                                            borderRadius: '4px', 
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            color: '#fff'
                                        }}>
                                            {profile?.rank || 'Newbie'}
                                        </span>
                                        <span style={{ color: '#666', fontSize: '14px' }}>
                                            Rating: <span style={{ color: '#000', fontWeight: '600' }}>{profile?.rating || 1200}</span>
                                        </span>
                                        <span style={{ color: '#666', fontSize: '14px' }}>
                                            Max: <span style={{ color: '#000', fontWeight: '600' }}>{profile?.maxRating || 1200}</span>
                                        </span>
                                    </div>
                                    <div style={{ marginTop: '8px', color: '#666', fontSize: '13px' }}>
                                        {profile?.email}
                                    </div>
                                </div>
                            </div>

                            <div className="divider-line"></div>

                            {editing ? (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div className="form-group">
                                        <label className="form-label">Country</label>
                                        <input type="text" name="country" value={formData.country} onChange={handleChange} className="form-input" placeholder="Country" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">City</label>
                                        <input type="text" name="city" value={formData.city} onChange={handleChange} className="form-input" placeholder="City" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Organization</label>
                                        <input type="text" name="organization" value={formData.organization} onChange={handleChange} className="form-input" placeholder="Organization" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Website</label>
                                        <input type="text" name="website" value={formData.website} onChange={handleChange} className="form-input" placeholder="https://..." />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Twitter</label>
                                        <input type="text" name="twitter" value={formData.twitter} onChange={handleChange} className="form-input" placeholder="@username" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">GitHub</label>
                                        <input type="text" name="github" value={formData.github} onChange={handleChange} className="form-input" placeholder="username" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">LinkedIn</label>
                                        <input type="text" name="linkedin" value={formData.linkedin} onChange={handleChange} className="form-input" placeholder="username" />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label className="form-label">Bio</label>
                                        <textarea name="bio" value={formData.bio} onChange={handleChange} className="form-input" rows={3} placeholder="Tell us about yourself..." />
                                    </div>
                                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                        <button onClick={() => setEditing(false)} className="cf-btn">Cancel</button>
                                        <button onClick={handleSave} disabled={saving} className="cf-btn-primary">
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                        <div>
                                            <div style={{ color: '#888', fontSize: '12px', marginBottom: '3px' }}>From</div>
                                            <div style={{ color: '#000', fontSize: '15px' }}>{profile?.country || '-'}{profile?.city ? `, ${profile.city}` : ''}</div>
                                        </div>
                                        <div>
                                            <div style={{ color: '#888', fontSize: '12px', marginBottom: '3px' }}>Organization</div>
                                            <div style={{ color: '#000', fontSize: '15px' }}>{profile?.organization || '-'}</div>
                                        </div>
                                        <div>
                                            <div style={{ color: '#888', fontSize: '12px', marginBottom: '3px' }}>Contribution</div>
                                            <div style={{ color: '#000', fontSize: '15px' }}>{profile?.contribution || 0}</div>
                                        </div>
                                        <div>
                                            <div style={{ color: '#888', fontSize: '12px', marginBottom: '3px' }}>Friends</div>
                                            <div style={{ color: '#000', fontSize: '15px' }}>{profile?.friendCount || 0}</div>
                                        </div>
                                    </div>

                                    {(profile?.website || profile?.twitter || profile?.github || profile?.linkedin) && (
                                        <div style={{ marginBottom: '20px' }}>
                                            <div style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>Contacts</div>
                                            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                                {profile?.website && (
                                                    <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" style={{ color: '#3666b0' }}>
                                                        🌐 {profile.website}
                                                    </a>
                                                )}
                                                {profile?.twitter && <span style={{ color: '#3666b0' }}>🐦 @{profile.twitter}</span>}
                                                {profile?.github && <span style={{ color: '#3666b0' }}>💻 github.com/{profile.github}</span>}
                                                {profile?.linkedin && <span style={{ color: '#3666b0' }}>💼 {profile.linkedin}</span>}
                                            </div>
                                        </div>
                                    )}

                                    {profile?.bio && (
                                        <div style={{ marginBottom: '20px' }}>
                                            <div style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>Bio</div>
                                            <div style={{ color: '#333', fontSize: '14px', lineHeight: '1.6' }}>{profile.bio}</div>
                                        </div>
                                    )}

                                    <div style={{ color: '#888', fontSize: '12px' }}>
                                        Registered: {profile?.registrationTime ? new Date(profile.registrationTime).toLocaleDateString() : 'N/A'}
                                        {profile?.lastOnlineTime && ` | Last seen: ${new Date(profile.lastOnlineTime).toLocaleDateString()}`}
                                    </div>
                                </>
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
                                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#000' }}>{profile?.eloRating || 1200}</div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>ELO Rating</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#28a745' }}>{profile?.rankedWins || 0}</div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>Wins</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc3545' }}>{profile?.rankedLosses || 0}</div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>Losses</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#3666b0' }}>{profile?.questionsSolved || 0}</div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>Problems Solved</div>
                                </div>
                            </div>
                            <div className="divider-line" style={{ margin: '20px 0' }}></div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', textAlign: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#28a745' }}>{profile?.easySolved || 0}</div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>Easy</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#ff9800' }}>{profile?.mediumSolved || 0}</div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>Medium</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#dc3545' }}>{profile?.hardSolved || 0}</div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>Hard</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;