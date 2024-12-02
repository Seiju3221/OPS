import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const articleApi = createApi({
  reducerPath: 'articlesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api',
    credentials: 'include'
   }),
  tagTypes: ['Articles'],
  endpoints: (builder) => (
    {
    fetchArticles: builder.query({
      query: ({
        search = '',
        college = '',
        category = '',
        status = 'published',
        sortBy = 'createdAt',
        sortOrder = -1,
        page = 1,
        pageSize = 12
      }) => `/articles?search=${search}&college=${college}&category=${category}&status=${status}&sortBy=${sortBy}&sortOrder=${sortOrder}&page=${page}&pageSize=${pageSize}`,
      transformResponse: (response) => ({
        articles: response.articles || [],
        total: response.total || 0
      }), // Extract articles from response
      providesTags: ['Articles']
    }),
    fetchArticleById: builder.query({
      query: (id) => `/articles/${id}`
    }),
    fetchRelatedArticles: builder.query({
      query: (id) => `/articles/related/${id}`
    }),
    postArticle: builder.mutation({
      query: (newArticle) => ({
        url: `/articles/create-post`,
        method: "POST",
        body: newArticle,
        credentials: "include"
      }),
      invalidatesTags: ['Articles']
    }),
    updateArticle: builder.mutation({
      query: ({id, ...rest}) => ({
        url: `/articles/update-post/${id}`,
        method: "PATCH",
        body: rest,
        credentials: "include"
      }),
      invalidatesTags: ['Articles'], // Fix the invalidation
    }),
    deleteArticle: builder.mutation({
      query: (id) => ({
        url: `/articles/${id}`,
        method: "DELETE",
        credentials: "include"
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Articles, id' }],
    }),
    toggleLike: builder.mutation({
      query: (id) => ({
        url: `/articles/${id}/like`,
        method: 'POST',
        credentials: 'include'
      }),
      // Invalidate the specific article and the articles list to update the UI
      invalidatesTags: (result, error, id) => [
        { type: 'Articles' },
        { type: 'Articles', id }
      ]
    }),
    reviewArticle: builder.mutation({
      query: ({ id, status, revisionMessage, rejectionMessage }) => ({
        url: `/articles/review/${id}`,
        method: 'PATCH',
        body: {
          status,
          revisionMessage,
          rejectionMessage
        },
        // Ensure proper headers are set
        headers: {
          'Content-Type': 'application/json'
        }
      }),
      // Improve error handling
      transformErrorResponse: (response, meta, arg) => {
        return {
          status: response.status,
          message: response.data?.message || 'An error occurred',
          data: response.data
        };
      },
      invalidatesTags: ['Articles']
    }),
    }
  ),
});

const extendedArticleApi = articleApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: () => '/notifications',
      transformResponse: (response) => response.notifications,
      providesTags: ['Notifications']
    }),
    markNotificationRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/read/${id}`,
        method: 'PATCH'
      }),
      invalidatesTags: ['Notifications']
    }),
    clearNotifications: builder.mutation({
      query: () => ({
        url: '/notifications/clear',
        method: 'DELETE'
      }),
      invalidatesTags: ['Notifications']
    })
  })
});

const extendedApi = articleApi.injectEndpoints({
  endpoints: (builder) => ({
    subscribeToNewsletter: builder.mutation({
      query: (data) => ({
        url: '/subscriptions/subscribe',
        method: 'POST',
        body: data
      })
    })
  })
});

export const {useFetchArticlesQuery, useFetchArticleByIdQuery, useFetchRelatedArticlesQuery, usePostArticleMutation, useUpdateArticleMutation, useDeleteArticleMutation, useToggleLikeMutation, useReviewArticleMutation} = articleApi;

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useClearNotificationsMutation
} = extendedArticleApi;

export const { useSubscribeToNewsletterMutation } = extendedApi;