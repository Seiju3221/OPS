import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterUserMutation } from '../../redux/features/auth/authApi';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [registerUser, {isLoading}] = useRegisterUserMutation();

  const navigate = useNavigate();

  const [error, setError] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    const data = {
      username,
      email,
      password
    };

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!passwordRegex.test(password)) {
      setError('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number.');
      return;
    }

    try {
      await registerUser(data).unwrap()
      alert("Sign up successful!")
      navigate("/login")
    } catch (error) {
      setMessage("Sign up failed! Try again later.")
    }
  }

  return (
    <div className='max-w-sm bg-white mx-auto p-8 mt-36'>
      <h2 className='text-2xl font-semibold pt-5'>Create an Account</h2>
      <form onSubmit={handleRegister} className='space-y-5 max-w-sm mx-auto pt-8'>
        <input onChange={(e) => setUsername(e.target.value)} type="text" value={username} className='w-full bg-bgPrimary focus:outline-none px-5 py-3' placeholder='Username' required/>
        <input onChange={(e) => setEmail(e.target.value)} type="email" value={email} className='w-full bg-bgPrimary focus:outline-none px-5 py-3' placeholder='Email' required/>
        <div className="relative">
        <input
          onChange={(e) => setPassword(e.target.value)}
          type={showPassword ? "text" : "password"}
          value={password}
          className="w-full bg-bgPrimary focus:outline-none px-5 py-3"
          placeholder='Password'
          required
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <i class="fa fa-eye"></i>
          ) : (
            <i class="fa fa-eye-slash"></i>
          )}
        </button>
      </div>
      {error && <p className="text-red-500">{error}</p>}
        {
          message && <p className='text-red-500'>{message}</p>
        }
        <button className='w-full mt-5 bg-primary hover:bg-indigo-500 text-white font-medium py-3 rounded-md'>Sign Up</button>
      </form>
      <p className='my-5 text-center'>Already have an account? <Link className='text-red-700 italic' to="/login">Login</Link></p>
    </div>
  )
}

export default Register
