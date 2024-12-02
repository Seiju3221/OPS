import { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  useLoginUserMutation, 
  useLogoutUserMutation, 
  useGetUserQuery 
} from '../redux/features/auth/authApi';
import { 
  selectIsAuthenticated, 
  selectUser, 
  selectAuthInitialized,
  setUser,
  logout,
  initializeAuth
} from '../redux/features/auth/authSlice';

function useAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const initialized = useSelector(selectAuthInitialized);
  const [authError, setAuthError] = useState(null);
  const loginUser = useLoginUserMutation();
  const logoutUser = useLogoutUserMutation();

  const { 
    data: userData,
    isLoading: isUserLoading,
    error: userError
  } = useGetUserQuery(undefined, {
    skip: !isAuthenticated || initialized,
    refetchOnReconnect: true
  });

  useEffect(() => {
    if (userData) {
      dispatch(setUser({ user: userData }));
      dispatch(initializeAuth());
      console.log('Auth Effect Params:', {
        userData, 
        userError, 
        initialized, 
        isAuthenticated
      });
    } else if (userError) {
      dispatch(logout());
      dispatch(initializeAuth());
      console.log('Auth Effect Params:', {
        userData, 
        userError, 
        initialized, 
        isAuthenticated
      });
    } else if (initialized && !isAuthenticated) {
      dispatch(initializeAuth());
      console.log('Auth Effect Params:', {
        userData, 
        userError, 
        initialized, 
        isAuthenticated
      });
    }
  }, [userData, userError, initialized, isAuthenticated, dispatch]);

  return {
    isAuthenticated: !!userData || isAuthenticated,
    isLoading: isUserLoading && !initialized,
    authError: userError,
    user: userData || user,
    handleLogin: useCallback(async (credentials) => {
      try {
        const result = await loginUser(credentials).unwrap();
        if (result?.user) {
          navigate('/', { replace: true });
        }
        return result;
      } catch (error) {
        setAuthError(error);
        throw error;
      }
    }, [loginUser, navigate]),
    handleLogout: useCallback(async () => {
      try {
        await logoutUser().unwrap();
        navigate('/login', { replace: true });
      } catch (error) {
        throw error;
      }
    }, [logoutUser, navigate])
  };
}

export default useAuth;