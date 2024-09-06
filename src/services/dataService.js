import axios from 'axios';
import { getCookie } from '../utils/getcookie';



export const fetchCampaignDataInfo = async (params) => {
  // Get the token from the cookie
  const token = getCookie('token');

  // Configure headers to include the Authorization header if token exists
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const API_URL = process.env.REACT_APP_BACKEND_URL + 'original-campaign-data';

  // Make the request with the Authorization header
  const response = await axios.get(API_URL, {
    params,
    headers,
    
  });

  return response.data;
};

export const uploadCampaignData = async (formData) => {
 
  const token = getCookie('token');

 
  const headers = {
    'Content-Type': 'multipart/form-data',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const API_URL = process.env.REACT_APP_BACKEND_URL + 'original-campaign-data/upload';

  const response = await axios.post(`${API_URL}`, formData, {
    headers,
    
  });

  return response.data;
};


export const linkCampaign  = async (campaignDataId,campaignId)=>{

  const token = getCookie('token');

 
  const headers = {
    
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const API_URL = process.env.REACT_APP_BACKEND_URL + `campaign-data/${campaignDataId}/link-campaign/${campaignId}`;

  const response = await axios.post(`${API_URL}`, {
    headers,
  
  });

  return response.data

}

export const unLinkCampaign  = async (campaignDataId)=>{

  const token = getCookie('token');

  const headers = {
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const API_URL = process.env.REACT_APP_BACKEND_URL + `campaign-data/${campaignDataId}/unlink-campaign`;

  const response = await axios.post(`${API_URL}`, {
    headers,
  
  });

  return response.data

}


export const deleteOriginalData  = async (campaignDataId)=>{

  const token = getCookie('token');

  const headers = {
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const API_URL = process.env.REACT_APP_BACKEND_URL + `original-campaign-data/${campaignDataId}`;

  const response = await axios.delete(`${API_URL}`, {
    headers,
  
  });

  return response.data

}

