import axios from 'axios';
import { getCookie } from '../utils/getcookie';


export const fetchTotalLeads = async (campaignId, startDate, endDate) => {
  const token = getCookie('token');
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const API_URL = `${process.env.REACT_APP_BACKEND_URL}` + 'leads/total-leads';

  const response = await axios.get(API_URL, {
    headers,
    params: { campaignId, startDate, endDate },
  });
  return response.data;
};

// Fetch Expected Revenue from pending leads
export const fetchExpectedRevenue = async (campaignId, startDate, endDate) => {
  const token = getCookie('token');
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const API_URL = `${process.env.REACT_APP_BACKEND_URL}` + 'leads/expected-revenue';

  const response = await axios.get(API_URL, {
    headers,
    params: { campaignId, startDate, endDate },
  });
  return response.data;
};

// Fetch Secured Revenue from approved leads
export const fetchSecuredRevenue = async (campaignId, startDate, endDate) => {
  const token = getCookie('token');
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const API_URL = `${process.env.REACT_APP_BACKEND_URL}` + 'leads/secured-revenue';

  const response = await axios.get(API_URL, {
    headers,
    params: { campaignId, startDate, endDate },
  });
  return response.data;
};

// Fetch total Inactive Leads
export const fetchInactiveLeads = async (campaignId, startDate, endDate) => {
  const token = getCookie('token');
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const API_URL = `${process.env.REACT_APP_BACKEND_URL}` + 'leads/inactive-leads';

  const response = await axios.get(API_URL, {
    headers,
    params: { campaignId, startDate, endDate },
  });
  return response.data;
};

export const fetchProcessedDataMetrics = async (processedDataId, startDate, endDate) => {
  const params = new URLSearchParams();
  params.append('startDate', startDate.toISOString());
  params.append('endDate', endDate.toISOString());

  const API_URL = `${process.env.REACT_APP_BACKEND_URL}` + `leads/processed-data-metrics/${processedDataId}`;

  const token = getCookie('token');
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const response = await axios.get(API_URL, {
    headers,
    params: {startDate, endDate },
  });
  return response.data;

};

// Fetch Leads Over Time for chart
export const fetchLeadsOverTime = async (startDate, endDate, groupBy, campaignId) => {
  const token = getCookie('token');
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const API_URL = `${process.env.REACT_APP_BACKEND_URL}` + 'leads/leads-over-time';

  const response = await axios.get(API_URL, {
    headers,
    params: { startDate, endDate, groupBy, campaignId },
  });
  return response.data;
};

// Fetch Revenue Over Time for chart
export const fetchRevenueOverTime = async (startDate, endDate, groupBy, campaignId) => {
  const token = getCookie('token');
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const API_URL = `${process.env.REACT_APP_BACKEND_URL}` + 'leads/revenue-over-time';

  const response = await axios.get(API_URL, {
    headers,
    params: { startDate, endDate, groupBy, campaignId },
  });
  return response.data;
};
