import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getCurrentUserProfile, updateUserProfile } from '../service/api';

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
                const data = await getCurrentUserProfile();
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
            const updated = await updateUserProfile(formData);
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
            'Pupil': '#00FF00',
            'Specialist': '#00FFFF',
            'Expert': '#0000FF',
            'Candidate Master': '#8847FF',
            'Master': '#FF8C00',
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
                                    width: '150px',
                                    height: '150px',
                                    borderRadius: '50%',
                                    background: `linear-gradient(135deg, ${getRankColor(profile?.rank)} 0%, #333 100%)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '60px',
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
                                        <h2 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 10px 0', color: '#fff' }}>
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
                                            color: '#000'
                                        }}>
                                            {profile?.rank || 'Newbie'}
                                        </span>
                                        <span style={{ color: '#888', fontSize: '14px' }}>
                                            Rating: <span style={{ color: '#fff' }}>{profile?.rating || 1200}</span>
                                        </span>
                                        <span style={{ color: '#888', fontSize: '14px' }}>
                                            Max: <span style={{ color: '#fff' }}>{profile?.maxRating || 1200}</span>
                                        </span>
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
                                            <div style={{ color: '#666', fontSize: '12px', marginBottom: '3px' }}>Country</div>
                                            <div style={{ color: '#fff', fontSize: '15px' }}>{profile?.country || '-'}</div>
                                        </div>
                                        <div>
                                            <div style={{ color: '#666', fontSize: '12px', marginBottom: '3px' }}>City</div>
                                            <div style={{ color: '#fff', fontSize: '15px' }}>{profile?.city || '-'}</div>
                                        </div>
                                        <div>
                                            <div style={{ color: '#666', fontSize: '12px', marginBottom: '3px' }}>Organization</div>
                                            <div style={{ color: '#fff', fontSize: '15px' }}>{profile?.organization || '-'}</div>
                                        </div>
                                        <div>
                                            <div style={{ color: '#666', fontSize: '12px', marginBottom: '3px' }}>Contribution</div>
                                            <div style={{ color: '#fff', fontSize: '15px' }}>{profile?.contribution || 0}</div>
                                        </div>
                                    </div>

                                    {(profile?.website || profile?.twitter || profile?.github || profile?.linkedin) && (
                                        <div style={{ marginBottom: '20px' }}>
                                            <div style={{ color: '#666', fontSize: '12px', marginBottom: '8px' }}>Links</div>
                                            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                                {profile?.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" style={{ color: '#4a7fc7' }}>🌐 Website</a>}
                                                {profile?.twitter && <span style={{ color: '#4a7fc7' }}>🐦 @{profile.twitter}</span>}
                                                {profile?.github && <span style={{ color: '#4a7fc7' }}>💻 GitHub: {profile.github}</span>}
                                                {profile?.linkedin && <span style={{ color: '#4a7fc7' }}>💼 LinkedIn: {profile.linkedin}</span>}
                                            </div>
                                        </div>
                                    )}

                                    {profile?.bio && (
                                        <div style={{ marginBottom: '20px' }}>
                                            <div style={{ color: '#666', fontSize: '12px', marginBottom: '8px' }}>Bio</div>
                                            <div style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.6' }}>{profile.bio}</div>
                                        </div>
                                    )}
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
                                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#fff' }}>{profile?.eloRating || 1200}</div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>ELO Rating</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#4caf50' }}>{profile?.rankedWins || 0}</div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>Wins</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#f44336' }}>{profile?.rankedLosses || 0}</div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>Losses</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#4a7fc7' }}>{profile?.questionsSolved || 0}</div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>Problems Solved</div>
                                </div>
                            </div>
                            <div className="divider-line" style={{ margin: '20px 0' }}></div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', textAlign: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#4caf50' }}>{profile?.easySolved || 0}</div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>Easy</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#ff9800' }}>{profile?.mediumSolved || 0}</div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>Medium</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#f44336' }}>{profile?.hardSolved || 0}</div>
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