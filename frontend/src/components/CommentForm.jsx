import React, { useState } from 'react';

const CommentForm = ({ onSubmit }) => {
    const [content, setContent] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        await onSubmit(content.trim());
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
