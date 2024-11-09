import { configureStore } from '@reduxjs/toolkit'
import { articleApi } from './features/articles/articlesApi';
import authApi from './features/auth/authApi';
import authReducer from "./features/auth/authSlice";
import commentApi from './features/comments/commentApi';

export const store = configureStore({
  reducer: {
    [articleApi.reducerPath]: articleApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [commentApi.reducerPath]: commentApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(articleApi.middleware, authApi.middleware, commentApi.middleware),
});