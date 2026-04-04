import React, { useEffect, useState } from 'react';
import { getComments, createComment } from '../service/api';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';

const CommentList = ({ questionId }) => {
    const [comments, setComments] = useState([]);
    const [page, setPage] = useState(0);
    const size = 10;

    const fetchComments = async () => {
        try {
            const data = await getComments(questionId, page, size);
            setComments(data.content || []);
        } catch (err) {
            console.error('Failed to load comments', err);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [questionId, page]);

    const handleAddComment = async (content, parentId = null) => {
        try {
            await createComment(questionId, { content, parentId });
            fetchComments();
        } catch (err) {
            console.error('Failed to add comment', err);
        }
    };

    return (
        <div style={{ marginTop: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', marginBottom: '15px' }}>
                💬 Comments ({comments.length})
            </h3>
            <CommentForm onSubmit={handleAddComment} />
            {comments.map((c) => (
                <CommentItem key={c.id} comment={c} onReply={handleAddComment} />
            ))}
            {comments.length === 0 && (
                <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                    No comments yet. Be the first to comment!
                </div>
            )}
        </div>
    );
};

export default CommentList;