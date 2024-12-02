import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const commentApi = createApi({
  reducerPath: "commentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/comments",
    credentials: "include",
  }),
  tagTypes: ['Comments'],
  endpoints: (builder) => ({
    getComments: builder.query({
      query: () => "/total-comments",
      providesTags: ['Comments'],
      // Fix the transformation to use the correct response structure
      transformResponse: (response) => ({
        totalComment: response.totalComment || 0
      }),
    }),
    postComment: builder.mutation({
      query: (commentData) => ({
        url: "/post-comment",
        method: "POST",
        body: commentData,
      }),
      invalidatesTags: ['Comments'],
    }),
    updateComment: builder.mutation({
      query: ({ commentId, comment }) => ({
        url: `/edit-comment/${commentId}`,
        method: "PUT",
        body: { comment },
      }),
      // Optimistic update
      async onQueryStarted({ commentId, comment }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          commentApi.util.updateQueryData('getComments', undefined, (draft) => {
            const updateCommentText = (comments) => {
              const targetComment = comments.find(c => c._id === commentId);
              if (targetComment) {
                targetComment.comment = comment;
                targetComment.isEdited = true;
                return true;
              }
              // Check replies if not found at top level
              return comments.some(parentComment => {
                if (parentComment.replies?.length) {
                  const reply = parentComment.replies.find(r => r._id === commentId);
                  if (reply) {
                    reply.comment = comment;
                    reply.isEdited = true;
                    return true;
                  }
                }
                return false;
              });
            };
            
            updateCommentText(draft);
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    deleteComment: builder.mutation({
      query: (id) => ({
        url: `/delete-comment/${id}`,
        method: "DELETE",
      }),
      // Optimistic update for delete
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        const patchResult = dispatch(
          commentApi.util.updateQueryData('getComments', undefined, (draft) => {
            // Handle both top-level comments and replies
            const removeComment = (comments) => {
              const index = comments.findIndex(c => c._id === id);
              if (index !== -1) {
                comments.splice(index, 1);
                return true;
              }
              // Check replies if not found at top level
              return comments.some(comment => {
                if (comment.replies?.length) {
                  const replyIndex = comment.replies.findIndex(r => r._id === id);
                  if (replyIndex !== -1) {
                    comment.replies.splice(replyIndex, 1);
                    return true;
                  }
                }
                return false;
              });
            };
            removeComment(draft);
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    likeComment: builder.mutation({
      query: (id) => ({
        url: `/like-comment/${id}`,
        method: "PUT",
      }),
      // Optimistic update for like
      async onQueryStarted(id, { dispatch, getState, queryFulfilled }) {
        const state = getState();
        const userId = state.auth.user?._id;

        const patchResult = dispatch(
          commentApi.util.updateQueryData('getComments', undefined, (draft) => {
            const updateLikes = (comment) => {
              if (!comment) return false;

              const dislikeIndex = comment.dislikes.indexOf(userId);
              if (dislikeIndex > -1) {
                comment.dislikes.splice(dislikeIndex, 1);
              }

              const likeIndex = comment.likes.indexOf(userId);
              if (likeIndex > -1) {
                comment.likes.splice(likeIndex, 1);
              } else {
                comment.likes.push(userId);
              }
              return true;
            };

            // Try to find and update the comment at top level
            const comment = draft.find(c => c._id === id);
            if (updateLikes(comment)) return;

            // If not found, look in replies
            draft.forEach(topComment => {
              if (topComment.replies?.length) {
                const reply = topComment.replies.find(r => r._id === id);
                if (reply) updateLikes(reply);
              }
            });
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    dislikeComment: builder.mutation({
      query: (id) => ({
        url: `/dislike-comment/${id}`,
        method: "PUT",
      }),
      // Optimistic update for dislike
      async onQueryStarted(id, { dispatch, getState, queryFulfilled }) {
        const state = getState();
        const userId = state.auth.user?._id;

        const patchResult = dispatch(
          commentApi.util.updateQueryData('getComments', undefined, (draft) => {
            const updateDislikes = (comment) => {
              if (!comment) return false;

              const likeIndex = comment.likes.indexOf(userId);
              if (likeIndex > -1) {
                comment.likes.splice(likeIndex, 1);
              }

              const dislikeIndex = comment.dislikes.indexOf(userId);
              if (dislikeIndex > -1) {
                comment.dislikes.splice(dislikeIndex, 1);
              } else {
                comment.dislikes.push(userId);
              }
              return true;
            };

            // Try to find and update the comment at top level
            const comment = draft.find(c => c._id === id);
            if (updateDislikes(comment)) return;

            // If not found, look in replies
            draft.forEach(topComment => {
              if (topComment.replies?.length) {
                const reply = topComment.replies.find(r => r._id === id);
                if (reply) updateDislikes(reply);
              }
            });
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useGetCommentsQuery,
  usePostCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useLikeCommentMutation,
  useDislikeCommentMutation,
} = commentApi;

export default commentApi;