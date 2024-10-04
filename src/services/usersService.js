// src/services/userService.js
import axios from 'axios';
import { getCookie } from '../utils/getcookie';



export const fetchUsers = async (params) => {
    console.log(params)
    // Get the token from the cookie
    const token = getCookie('token');
  
    // Configure headers to include the Authorization header if token exists
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const API_URL = process.env.REACT_APP_BACKEND_URL + 'users';
  
    // Make the request with the Authorization header
    const response = await axios.get(API_URL, {
      params,
      headers,
    });

    console.log(response)
  
    return response.data;
  };


  export const createUser = async (userData) => {
    const token = getCookie('token');
  
    const headers = {
        'Content-Type': 'application/json',
    };
  
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const API_URL = process.env.REACT_APP_BACKEND_URL + 'users';

    try {
        // Make the POST request to create a new user
        const response = await axios.post(API_URL, userData, { headers });
        return response.data;
    } catch (error) {
        console.error('Error creating user:', error.response ? error.response.data : error.message);
        throw error;  // Rethrow the error to handle it in the calling component
    }

    


};


export const fetchSingleUser = async (userId) => {
 
  // Get the token from the cookie
  const token = getCookie('token');

  // Configure headers to include the Authorization header if token exists
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const API_URL = process.env.REACT_APP_BACKEND_URL + `users/${userId}`;

  // Make the request with the Authorization header
  const response = await axios.get(API_URL, {
    headers,
  });

  console.log(response)

  return response.data;
};



export const updateUser = async (userId,userData) => {
 
  // Get the token from the cookie
  const token = getCookie('token');

  // Configure headers to include the Authorization header if token exists
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const API_URL = process.env.REACT_APP_BACKEND_URL + `users/${userId}`;

  // Make the request with the Authorization header
  const response = await axios.patch(API_URL, userData, {
    headers,
  });

  console.log(response)

  return response.data;
};


export const deleteUser = async (userId) => {
 
  // Get the token from the cookie
  const token = getCookie('token');

  // Configure headers to include the Authorization header if token exists
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const API_URL = process.env.REACT_APP_BACKEND_URL + `users/${userId}`;

  // Make the request with the Authorization header
  const response = await axios.delete(API_URL, {
    headers,
  });

  console.log(response)

  return response.data;
};