import React, { useState } from 'react';

const CommentForm = ({ onSubmit, isReply = false, parentId = null }) => {
    const [content, setContent] = useState('');

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

    return (
        <form onSubmit={handleSubmit} className="mb-4">
            <textarea
                className="w-full border rounded p-2"
                rows="3"
                placeholder="Write a comment..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />
            <button type="submit" className="mt-2 cf-btn">
                Post Comment
            </button>
        </form>
    );
};

export default CommentForm;
