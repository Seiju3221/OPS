/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react';
import { useLoginUserMutation, useLogoutUserMutation } from '../../redux/features/auth/authApi';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/features/auth/authSlice';

const Login = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const dispatch = useDispatch();

  const [loginUser, { isLoading: loginLoading }] = useLoginUserMutation();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const data = {
      email,
      password,
    };

    try {
      const response = await loginUser(data).unwrap();
      const { token, user } = response;
      dispatch(setUser({ user }));
      alert('Login successful');
      navigate('/');
    } catch (err) {
      setMessage("Please provide a valid email and password!");
    }
  };

  return (
    <div className='max-w-sm bg-white mx-auto p-8 mt-36'>
      <h2 className='text-2xl font-semibold pt-5'>Login</h2>
      <form onSubmit={handleLogin} className='space-y-5 max-w-sm mx-auto pt-8'>
        <input
          type="text"
          value={email}
          className='w-full bg-bgPrimary focus:outline-none px-5 py-3'
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            className='w-full bg-bgPrimary focus:outline-none px-5 py-3 pr-10' // Add pr-10 for right padding
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <i className="fa fa-eye"></i>
            ) : (
              <i className="fa fa-eye-slash"></i>
            )}
          </button>
        </div>

        {message && <p className="text-red-500">{message}</p>} {/* Display error message if any */}
        <button type="submit" disabled={loginLoading} className='w-full mt-5 bg-primary hover:bg-indigo-500 text-white font-medium py-3 rounded-md'>Login</button>
      </form>

      <p className='my-5 text-center'>Don't have an account?
        <Link to="/register" className='text-red-700 italic'> Sign Up </Link> here.
      </p>
    </div>
  );
};

export default Login;