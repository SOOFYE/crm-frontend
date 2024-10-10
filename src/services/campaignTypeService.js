// src/services/campaignTypeService.js
import axios from 'axios';
import { getCookie } from '../utils/getcookie';



export const fetchCampaignTypes = async (params) => {
    
    const token = getCookie('token');
  
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const API_URL = process.env.REACT_APP_BACKEND_URL + 'campaign-types';
  
    
    const response = await axios.get(API_URL, {
      params,
      headers,
    });
  
    return response.data;
};


export const createCampaignTypes = async (data) => {
  
  const token = getCookie('token');

  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const API_URL = process.env.REACT_APP_BACKEND_URL + 'campaign-types';

  const response = await axios.post(API_URL, data, {
    headers,
  });

  return response.data;
};


export const fetchSingleCampaignType = async (id) => {

  const token = getCookie('token');

  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const API_URL = process.env.REACT_APP_BACKEND_URL + 'campaign-types' + `/${id}`;

  const response = await axios.get(API_URL, {

    headers,
  });


  return response.data

}


export const updateCampaignType = async (id, updatedData) => {

  const token = getCookie('token');

  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const API_URL = process.env.REACT_APP_BACKEND_URL + 'campaign-types' + `/${id}`;

  const response = await axios.patch(API_URL, updatedData, {
    headers,
  });


  return response.data

}