import React, { useState, useContext } from 'react';
import { Input, Button, Card, Spacer } from '@nextui-org/react';
import { AuthContext } from '../context/AuthContext'; // Adjust the import path as necessary
import { loginService } from '../services/authService'; // Import the login service
import { useCookies } from 'react-cookie'; // Import cookies handling
import { toast,Bounce } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const [cookies, setCookie] = useCookies(['userToken']); // Initialize cookies
  const navigate = useNavigate(); // Initialize useNavigate

  const handleLogin = async () => {

    try {
      const response = await loginService(username, password);
      console.log(response)
      const token = response.data.accessToken;
      const fullName = response.data.user.firstName + response.data.user.lastName
      const role = response.data.user.role

      // Set the token in cookies
      setCookie('token', token, { path: '/' });

      // Set the user data in context
      login({ fullName, role, token, });

      toast.success('Successfully logged in', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
        });

        const defaultRoute = role === 'admin' ? '/admin/view-campaign' : '/agent/leads';
        navigate(defaultRoute);
     
      console.log(`Logged in as ${fullName} with roles: ${role}`);
    } catch (error) {
      console.error('Login failed:', error);
      toast.error(error.response?.data?.message || "Server Error", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
    });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-200 to-white">
      <Card className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-center text-gray-800">
            Login to Your Account
          </h2>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>
        <button
          onClick={handleLogin}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Login
        </button>
      </Card>
    </div>
  );
};

export default LoginPage;