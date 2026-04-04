import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CommentForm = ({ onSubmit, isReply = false, parentId = null }) => {
    const [content, setContent] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('jwt');
        setIsLoggedIn(!!token);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        
        if (isReply && parentId) {
            await onSubmit(content.trim(), parentId);
        } else {
            await onSubmit(content.trim(), null);
        }
        setContent('');
    };

    if (!isLoggedIn) {
        return (
            <div style={{ 
                padding: '20px', 
                textAlign: 'center', 
                background: 'var(--cf-bg-tertiary)', 
                borderRadius: '8px',
                border: '1px solid var(--cf-border)'
            }}>
                <p style={{ color: '#888', marginBottom: '15px' }}>
                    You must be signed in to post comments.
                </p>
                <Link to="/auth" className="cf-btn-primary" style={{ display: 'inline-block' }}>
                    Sign In
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} style={{ marginBottom: '15px' }}>
            <textarea
                style={{
                    width: '100%',
                    border: '1px solid var(--cf-border)',
                    borderRadius: '6px',
                    padding: '10px',
                    background: 'var(--cf-bg-secondary)',
                    color: '#fff',
                    fontSize: '14px',
                    resize: 'vertical'
                }}
                rows="3"
                placeholder={isReply ? "Write a reply..." : "Write a comment..."}
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />
            <button 
                type="submit" 
                className="cf-btn-primary"
                style={{ marginTop: '8px', fontSize: '13px' }}
            >
                {isReply ? "Post Reply" : "Post Comment"}
            </button>
        </form>
    );
};

export default CommentForm;