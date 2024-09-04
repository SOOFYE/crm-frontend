// src/services/campaignTypeService.js
import axios from 'axios';
import { getCookie } from '../utils/getcookie';



export const fetchCampaignIDList = async () => {
 
    const token = getCookie('token');

    const API_URL = process.env.REACT_APP_BACKEND_URL + 'campaigns/campaign-ids';
  
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  
    // Make the request with the Authorization header
    const response = await axios.get(API_URL, {
      headers,
    });
  
    return response.data;
};


export const fetchCampaigns = async (params) => {

  console.log(params)
 
    const token = getCookie('token');

    const API_URL = process.env.REACT_APP_BACKEND_URL + 'campaigns';
  
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  
    const response = await axios.get(API_URL, {
      params,
      headers,
    });
  
    return response.data;
};



export const createCampaign = async (formData) => {
    
    const token = getCookie('token');

    const API_URL = process.env.REACT_APP_BACKEND_URL + 'campaigns/create';
   
    const headers = {
        'Content-Type': 'multipart/form-data',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  
    // Make the request with the Authorization header
    const response = await axios.post(API_URL, formData, {
      headers,
    });
  
    return response.data;
};



export const fetchFilteredData = async (campaignId, queryParams) => {

  const token = getCookie('token');

  const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }


  const { page = 1, limit = 10, searchKey = '', orderBy = 'name', orderDirection = 'ASC' } = queryParams;

  const API_URL = process.env.REACT_APP_BACKEND_URL + `campaigns/${campaignId}/filtered-data`;

  const response = await axios.get(API_URL, {
    params: {
      page,
      limit,
      searchKey,
      orderBy,
      orderDirection,
    },
    headers
  });

  return response.data;
};


export const fetchSingleCampaign = async (campaignId) => {

  const token = getCookie('token');

  const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }


  const API_URL = process.env.REACT_APP_BACKEND_URL + `campaigns/${campaignId}`;

  const response = await axios.get(API_URL, {
    headers
  });

  return response.data;
};