import React, { useState } from 'react';
import commenterIcon from "../../assets/commenter.png";
import { formatDate } from '../../utils/formatDate';
import PostComment from './PostComment';
import DeleteConfirmModal from '../../utils/DeleteConfirmModal';
import { useSelector } from 'react-redux';
import { useDeleteCommentMutation, useDislikeCommentMutation, useLikeCommentMutation, useUpdateCommentMutation } from '../../redux/features/comments/commentApi';
import { toast } from 'react-toastify';

const CommentItem = ({ comment, articleCreator }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedComment, setEditedComment] = useState(comment?.comment);
  const truncateLength = 300;
  const isLongComment = comment?.comment?.length > truncateLength;
  
  const user = useSelector((state) => state.auth.user);
  const [deleteComment] = useDeleteCommentMutation();
  const [likeComment] = useLikeCommentMutation();
  const [dislikeComment] = useDislikeCommentMutation();
  const [updateComment] = useUpdateCommentMutation();

  const isAdmin = user?.role === 'admin';
  const isCommentOwner = user?._id === comment?.user?._id;
  const isArticleCreator = comment?.user?._id === articleCreator?._id;
  const hasLiked = comment?.likes?.includes(user?._id);
  const hasDisliked = comment?.dislikes?.includes(user?._id);

  const handleDelete = async () => {
    try {
      await deleteComment(comment._id).unwrap();
      setShowDeleteModal(false);
      toast.success('Comment deleted successfully!');
    } catch (error) {
      console.error('Failed to delete comment:', error);
      toast.error('Failed to delete comment!');
    }
  };

  const handleLike = async () => {
    if (!user) return;
    try {
      await likeComment(comment._id).unwrap();
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const handleDislike = async () => {
    if (!user) return;
    try {
      await dislikeComment(comment._id).unwrap();
    } catch (error) {
      console.error('Failed to dislike comment:', error);
      toast.error('Failed to dislike comment!');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      await updateComment({
        commentId: comment._id,
        comment: editedComment
      }).unwrap();
      toast.success('Comment edited successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to edit comment:', error);
      toast.error('Failed to edit comment!');
    }
  };

  const handleCancelEdit = () => {
    setEditedComment(comment?.comment);
    setIsEditing(false);
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex gap-4 items-start group">
        <div className="relative">
          <img
            src={comment?.user?.avatar || commenterIcon}
            alt={comment?.user?.username}
            className="h-12 w-12 rounded-full shadow-md object-cover transition-transform duration-200 group-hover:scale-105"
            onError={(e) => {
              e.target.src = commenterIcon;
            }}
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-base font-semibold text-blue-600 hover:text-blue-700 cursor-pointer transition-colors">
              {comment?.user?.username}
            </p>
            {isArticleCreator && (
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                Author
              </span>
            )}
            <span className="text-xs text-gray-400">•</span>
            <time className="text-xs text-gray-500" dateTime={comment.createdAt}>
              {formatDate(comment.createdAt)}
            </time>
          </div>
          
          <div className="relative mt-2">
            {isEditing ? (
              <div className="mt-2">
                <textarea
                  value={editedComment}
                  onChange={(e) => setEditedComment(e.target.value)}
                  className="w-full min-h-[100px] p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className={`prose prose-sm max-w-none text-gray-700 ${
                !isExpanded && isLongComment ? 'line-clamp-3' : ''
              }`}>
                <p className="whitespace-pre-wrap break-words bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                  {comment?.comment}
                </p>
              </div>
            )}
            
            {!isEditing && isLongComment && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                {isExpanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
          
          <div className="mt-2 flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`text-sm flex items-center gap-1 transition-colors ${
                hasLiked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
              }`}
            >
              <svg
                className="w-4 h-4"
                fill={hasLiked ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                />
              </svg>
              {comment?.likes?.length || 0}
            </button>

            <button
              onClick={handleDislike}
              className={`text-sm flex items-center gap-1 transition-colors ${
                hasDisliked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
              }`}
            >
              <svg
                className="w-4 h-4"
                fill={hasDisliked ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                />
              </svg>
              {comment?.dislikes?.length || 0}
            </button>

            {isCommentOwner && !isEditing && (
              <button
                onClick={handleEdit}
                className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit
              </button>
            )}

            {(isAdmin || isCommentOwner) && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

const CommentCard = ({ comments, isLoading }) => {
  const user = useSelector((state) => state.auth.user);

  if (isLoading) {
    return (
      <div className="my-6 bg-white p-8 rounded-lg shadow-lg animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="mt-6 border-t pt-6">
            <div className="flex gap-4 items-center">
              <div className="h-12 w-12 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-16 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="mt-4">
              <div className="h-20 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="my-6 bg-white p-8 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl">
      {comments?.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Comments ({comments.length})
            </h3>
            <div className="flex gap-2">
              <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                Newest
              </button>
              <span className="text-gray-300">|</span>
              <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                Oldest
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {comments.map((comment, index) => (
              <div
                key={comment._id || index}
                className={`${index !== 0 ? 'border-t pt-6' : ''}`}
              >
                <CommentItem comment={comment} />
                {comment.replies?.length > 0 && (
                  <div className="ml-12 mt-4 space-y-4">
                    {comment.replies.map((reply) => (
                      <CommentItem
                        key={reply._id}
                        comment={reply}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <svg
            className="w-16 h-16 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="text-lg font-medium text-gray-600">No comments yet</p>
          <p className="text-sm text-gray-500 mt-1">Be the first to share your thoughts!</p>
        </div>
      )}

      {/* Comment input field */}
      <div className="mt-8">
        <PostComment />
      </div>
    </div>
  );
};

export default CommentCard;