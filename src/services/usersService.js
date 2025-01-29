// src/services/userService.js
import axios from 'axios';
import { getCookie } from '../utils/getcookie';

const API_URL = process.env.REACT_APP_BACKEND_URL + 'users';

export const fetchUsers = async (params) => {
    console.log(params)
    // Get the token from the cookie
    const token = getCookie('token');
  
    // Configure headers to include the Authorization header if token exists
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  
    // Make the request with the Authorization header
    const response = await axios.get(API_URL, {
      params,
      headers,
    });
  
    return response.data;
  };



  export const getAgentWorkingHoursAndBreakTime = async () => {
    const token = getCookie('token');
    const headers = {};
  
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  
    const API_URL = process.env.REACT_APP_BACKEND_URL + 'users/workingHours';
    const response = await axios.get(API_URL, { headers });
    
    return response.data;
  };



  export const createUser = async (userData) => {
    const token = getCookie('token');
    
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const API_URL = process.env.REACT_APP_BACKEND_URL + 'users';

  
    try {
      const response = await axios.post(API_URL, userData, { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  }


  export const getUserById = async (userId) => {
    const token = getCookie('token');
    const headers = {};
  
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const API_URL = process.env.REACT_APP_BACKEND_URL + 'users' + `/${userId}`;
  
    try {
      const response = await axios.get(`${API_URL}`, { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  };


  export const updateUser = async (userId,userData) => {
    const token = getCookie('token');
    
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const API_URL = process.env.REACT_APP_BACKEND_URL + 'users' + `/${userId}`;

  
    try {
      const response = await axios.patch(API_URL, userData, { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
