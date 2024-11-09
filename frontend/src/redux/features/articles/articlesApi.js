import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const articleApi = createApi({
  reducerPath: 'articlesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api/',
    credentials: 'include'
   }),
  tagTypes: ['Articles'],
  endpoints: (builder) => (
    {
      fetchArticles : builder.query({
        query: ({search='', category='', location=''}) => `/articles?search=${search}&category=${category}&location${location}`,
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
      invalidatesTags: (result, error, { id }) => [{ type: 'Articles, id' }],
    }),
    deleteArticle: builder.mutation({
      query: (id) => ({
        url: `/articles/${id}`,
        method: "DELETE",
        credentials: "include"
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Articles, id' }],
    })
    }
  ),
})

export const {useFetchArticlesQuery, useFetchArticleByIdQuery, useFetchRelatedArticlesQuery, usePostArticleMutation, useUpdateArticleMutation, useDeleteArticleMutation} = articleApi;