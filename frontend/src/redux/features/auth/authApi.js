import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/auth",
    credentials: "include",
    prepareHeaders: (headers) => {
      // Get token from localStorage or wherever you store it
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'CurrentUser'],
  endpoints: (builder) => ({
    // Existing endpoints
    registerUser: builder.mutation({
      query: (newUser) => ({
        url: "/register",
        method: "POST",
        body: newUser,
      }),
      transformResponse: (response) => {
        return {
          user: response.user,
          token: response.token
        };
      },
    }),
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
      // Add this to invalidate the current user cache after login
      invalidatesTags: ['CurrentUser']
    }),
    logoutUser: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      // Add this to invalidate the current user cache after logout
      invalidatesTags: ['CurrentUser']
    }),
    getUser: builder.query({
      query: () => ({
        url: "/users",
        method: "GET",
      }),
      transformResponse: (response) => {
        console.log('API Response:', response); // Debug log
        return response;
      },
      refetchOnMount: true,
      invalidatesTags: ["User"],
    }),
    getCurrentUser: builder.query({
      query: () => ({
        url: '/current-user',
        method: 'GET',
      }),
      transformResponse: (response) => {
        console.log('Current User Response:', response);
        return response.user;
      },
      providesTags: ['CurrentUser'],
      // Add these options
      refetchOnFocus: true,
      refetchOnReconnect: true
    }),
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: "DELETE",
      })
    }),
    updateUser: builder.mutation({
      query: ({userId, role, username}) => ({
        url: `/users/${userId}`,
        method: "PUT",
        body: {role, username},
      }),
      refetchOnMount: true,
      invalidatesTags: ["User"],
    }),
    sendOtp: builder.mutation({
      query: (data) => ({
        url: "/send-otp",
        method: "POST",
        body: data,
      }),
    }),
    sendOtpPasswordReset: builder.mutation({
      query: (data) => ({
        url: "/reset-password/send-otp",
        method: "POST",
        body: data,
      }),
    }),
    verifyOtp: builder.mutation({
      query: (data) => ({
        url: "/verify-otp",
        method: "POST",
        body: data,
      }),
    }),
    verifyOtpPasswordReset: builder.mutation({
      query: (data) => ({
        url: "/reset-password/verify-otp",
        method: "POST",
        body: data,
      }),
    }),
    resendOtp: builder.mutation({
      query: (data) => ({
        url: "/resend-otp",
        method: "POST",
        body: data,
      }),
    }),
    passwordReset: builder.mutation({
      query: (data) => ({
        url: "/reset-password/new-password",
        method: "POST",
        body: data,
      }),
    }),
    updateProfile: builder.mutation({
      query: (userData) => ({
        url: "/update-profile",
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: ['CurrentUser'],
    }),
  })
})

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useLogoutUserMutation,
  useGetUserQuery,
  useGetCurrentUserQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useSendOtpMutation,
  useSendOtpPasswordResetMutation,
  useVerifyOtpMutation,
  useVerifyOtpPasswordResetMutation,
  useResendOtpMutation,
  usePasswordResetMutation,
  useUpdateProfileMutation
} = authApi;

export default authApi;