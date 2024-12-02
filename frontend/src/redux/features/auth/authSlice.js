import { createSlice } from '@reduxjs/toolkit';

// Utility function to check if the token exists in cookies
const isTokenPresentInCookies = () => {
  const token = document.cookie.split(';').find(cookie => cookie.trim().startsWith('token='));
  return !!token;
};

// Utility function to get the initial state with persistent check
const loadInitialState = () => {
  try {
    const hasToken = isTokenPresentInCookies();
    const serializedUser = localStorage.getItem('user');
    const persistedAuth = localStorage.getItem('auth_state');

    return {
      user: serializedUser ? JSON.parse(serializedUser) : null,
      isAuthenticated: hasToken && persistedAuth ? JSON.parse(persistedAuth).isAuthenticated : false,
      initialized: false  // Start with initialized as false
    };
  } catch (err) {
    console.error('Error loading initial auth state:', err);
    return { user: null, isAuthenticated: false, initialized: false };
  }
};

const initialState = loadInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState: loadInitialState(),
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.initialized = true;
      // Save both user and auth state
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('auth_state', JSON.stringify({ isAuthenticated: true }));
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.initialized = true;
      // Clear both storages
      localStorage.removeItem('user');
      localStorage.removeItem('auth_state');
    },
    initializeAuth: (state) => {
      state.initialized = true;
    }
  },
});

export const { setUser, logout, initializeAuth } = authSlice.actions;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthInitialized = (state) => state.auth.initialized;
export default authSlice.reducer;