import axios from 'axios';
import { getCookie } from '../utils/getcookie';

export const fetchForms = async ({ page, limit, searchKey, searchField, orderBy, orderDirection }) => {
    const token = getCookie('token'); // Assuming you handle token-based authentication
    const headers = {
      Authorization: `Bearer ${token}`,
      
    };

    const API_URL = `${process.env.REACT_APP_BACKEND_URL}`+ 'forms';
  
    const params = {
      page,
      limit,
      searchKey,
      searchField,
      orderBy,
      orderDirection,
    };
  
    const response = await axios.get(API_URL, { params, headers });
    return response.data;
  }

  export const fetchSingleForm = async (id) =>{

    const token = getCookie('token'); 
    const headers = {
      Authorization: `Bearer ${token}`,
      
    };

    const API_URL = `${process.env.REACT_APP_BACKEND_URL}`+ 'forms/' + `${id}`;

    const response = await axios.get(API_URL, {headers });

    return response.data

  }

export const createForm = async (form) => {
  const token = getCookie('token');
  
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const API_URL = `${process.env.REACT_APP_BACKEND_URL}`+ 'forms';

  const response = await axios.post(API_URL, form, { headers });

  return response.data;
};

export const updateForm = async (id,form) => {
  const token = getCookie('token');
  
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const API_URL = `${process.env.REACT_APP_BACKEND_URL}`+ 'forms/' + `${id}`;

  const response = await axios.patch(API_URL, form, { headers });

  return response.data;
};

export const deleteForm = async (formId) => {
    try {
      const token = getCookie('token'); // Get authentication token from cookies
      const headers = {};
  
      if (token) {
        headers['Authorization'] = `Bearer ${token}`; // Add the Authorization header if token exists
      }

      const API_URL = `${process.env.REACT_APP_BACKEND_URL}` + 'forms';
  
      const response = await axios.delete(`${API_URL}/${formId}`, {
        headers,
      });
  
      return response.data; // Return success response
    } catch (error) {
      console.error('Failed to delete form:', error);
      throw error; // Re-throw error for handling in the calling component
    }
  };



  export const fetchFormForAgent = async (campaignId, formId, phoneNumber) => {

    const token = getCookie('token'); // Assuming you handle token-based authentication
    const headers = {
      Authorization: `Bearer ${token}`,
      
    };


    const API_URL = `${process.env.REACT_APP_BACKEND_URL}`+ 'forms/fetch-form/';


    const response = await axios.get(`${API_URL}${campaignId}/${formId}/?phoneNumber=${phoneNumber}`, {
      headers
    });

    console.log(response.data)
    return response.data;
  };