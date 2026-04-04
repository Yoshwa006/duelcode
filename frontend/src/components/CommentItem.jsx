import React, { useState } from 'react';
import CommentForm from './CommentForm';

const CommentItem = ({ comment, onReply }) => {
    const [showReplyForm, setShowReplyForm] = useState(false);

    const handleReplyClick = () => {
        setShowReplyForm(!showReplyForm);
    };

    return (
        <div style={{ 
            border: '1px solid var(--cf-border)', 
            borderRadius: '6px', 
            padding: '12px', 
            marginBottom: '10px',
            marginLeft: '20px',
            background: 'var(--cf-bg-tertiary)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, color: '#ddd', fontSize: '14px' }}>{comment.content}</div>
                <button 
                    style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        color: '#4a7fc7', 
                        cursor: 'pointer',
                        fontSize: '13px',
                        marginLeft: '10px'
                    }} 
                    onClick={handleReplyClick}
                >
                    Reply
                </button>
            </div>
            {showReplyForm && (
                <div style={{ marginTop: '10px' }}>
                    <CommentForm onSubmit={(content) => {
                        onReply(content, comment.id);
                        setShowReplyForm(false);
                    }} isReply={true} />
                </div>
            )}
            {comment.replies && comment.replies.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                    {comment.replies.map((reply) => (
                        <CommentItem key={reply.id} comment={reply} onReply={onReply} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentItem;