import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { usePostCommentMutation, } from '../../redux/features/comments/commentApi';
import { useFetchArticleByIdQuery } from '../../redux/features/articles/articlesApi';
import { toast } from 'react-toastify';

const PostComment = () => {
  const { id } = useParams();
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [postComment, { isLoading }] = usePostCommentMutation();
  const { refetch } = useFetchArticleByIdQuery(id, { skip: !id });

  const validateComment = () => {
    if (!comment.trim()) {
      setError('Please enter a comment');
      return false;
    }
    if (comment.length < 3) {
      setError('Comment must be at least 3 characters long');
      return false;
    }
    if (comment.length > 1000) {
      setError('Comment must not exceed 1000 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('Please log in to comment on this post');
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    if (!validateComment()) {
      return;
    }

    const newComment = {
      comment: comment.trim(),
      user: user?._id,
      postId: id
    };

    toast.success('Comment posted successfully!');

    try {
      await postComment(newComment).unwrap();
      setComment('');
      refetch();
    } catch (err) {
      setError(err.data?.message || "An error occurred while posting your comment.");
    }
  };

  const remainingChars = 1000 - comment.length;
  const isOverLimit = remainingChars < 0;

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
            />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900">Leave a Comment</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg 
                    className="h-5 w-5 text-red-400" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <textarea
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                setError('');
              }}
              placeholder="Share your thoughts..."
              className={`w-full min-h-[150px] p-4 rounded-lg border ${
                isOverLimit 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              } focus:ring-2 focus:outline-none transition duration-200 resize-none`}
              disabled={isLoading}
            />
            <div className="flex justify-end">
              <span className={`text-sm ${
                isOverLimit ? 'text-red-500' : 'text-gray-500'
              }`}>
                {remainingChars} characters remaining
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isOverLimit}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition duration-200 
              ${isLoading || isOverLimit 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 transform hover:scale-[1.02]'
              } flex items-center justify-center`}
          >
            {isLoading ? (
              <>
                <svg 
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Posting...
              </>
            ) : (
              'Submit Comment'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostComment;