import React, { useState } from 'react';

const CommentItem = ({ comment, onReply }) => {
    const [showReplyForm, setShowReplyForm] = useState(false);

    const handleReplyClick = () => {
        setShowReplyForm(!showReplyForm);
    };

    return (
        <div className="border rounded p-2 mb-2 ml-4">
            <div className="flex justify-between items-center">
                <div className="font-medium">{comment.content}</div>
                <button className="text-sm text-blue-500" onClick={handleReplyClick}>
                    Reply
                </button>
            </div>
            {showReplyForm && (
                <div className="mt-2">
                    <CommentForm onSubmit={(content) => {
                        onReply(content, comment.id);
                        setShowReplyForm(false);
                    }} />
                </div>
            )}
            {/* Render nested replies recursively */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="mt-2 ml-4">
                    {comment.replies.map((reply) => (
                        <CommentItem key={reply.id} comment={reply} onReply={onReply} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentItem;
