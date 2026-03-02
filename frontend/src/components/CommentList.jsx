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
        <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Comments</h3>
            <CommentForm onSubmit={handleAddComment} />
            {comments.map((c) => (
                <CommentItem key={c.id} comment={c} onReply={handleAddComment} />
            ))}
            {/* Pagination controls could be added here */}
        </div>
    );
};

export default CommentList;
