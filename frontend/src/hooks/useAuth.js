import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLoginUserMutation, useLogoutUserMutation, useGetUserQuery } from '../redux/features/auth/authApi';

function useAuth() {
  const dispatch = useDispatch();
  const { data: user, isLoading, error } = useGetUserQuery();
  const [loginUser] = useLoginUserMutation();
  const [logoutUser] = useLogoutUserMutation();

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (user) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [user]);

  const handleLogin
 = async (credentials) => {
    try {
      await loginUser(credentials);
    } catch (error) {
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
    }
  };

  return {
    isAuthenticated,
    isLoading,
    error,
    handleLogin,
    handleLogout,
  };
}

export default useAuth;