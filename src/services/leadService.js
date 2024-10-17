import axios from 'axios';
import { getCookie } from '../utils/getcookie';

export const fetchLeads = async (filters) => {
  const token = getCookie('token'); // Assuming token-based authentication
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const { paginatedOptions, agents, statuses, campaignIds, lists, dateRange } = filters;


  const params = {
    page: paginatedOptions.page,
    limit: paginatedOptions.limit,
    searchKey: paginatedOptions.searchKey,
    searchField: paginatedOptions.searchField,
    orderBy: paginatedOptions.orderBy,
    orderDirection: paginatedOptions.orderDirection,
    agents: agents.length ? agents : undefined, // Only include if not empty
    statuses: statuses.length ? statuses : undefined,
    campaignIds: campaignIds.length ? campaignIds : undefined,
    lists: lists.length ? lists : undefined,
    startDate: dateRange?.start, // Send if dateRange exists
    endDate: dateRange?.end,
  };

  const API_URL = `${process.env.REACT_APP_BACKEND_URL}`+'leads';

  const response = await axios.get(API_URL, { headers, params });

  console.log(response)
  return response.data;
};

  export const submitLead = async (leadData) => {
    const token = getCookie('token'); // Assuming token-based authentication
  
    const headers = {
      Authorization: `Bearer ${token}`,
    };
  
    const API_URL = `${process.env.REACT_APP_BACKEND_URL}`+'leads';
  
    const response = await axios.post(API_URL, leadData, { headers });
    return response.data;
  };


  export const getLeadById = async (leadId) => {
    const token = getCookie('token'); // Assuming token-based authentication
    
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    
    const API_URL = `${process.env.REACT_APP_BACKEND_URL}` + `leads/${leadId}`;
    
    try {
      const response = await axios.get(API_URL, { headers });
      return response.data;
    } catch (error) {
      console.error('Error fetching lead:', error);
      throw error;
    }
  }


  export const updateLead = async (leadId, formData) => {

    try {
      const API_URL = `${process.env.REACT_APP_BACKEND_URL}` + `leads/${leadId}`;
  
      // Send the PATCH request with the form data
      const response = await axios.patch(API_URL, formData);
  
      console.log('Lead updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating lead:', error);
      throw error; // Handle errors as needed
    }


  };
 

  export const updateLeadStatus = async (leadId, newStatus) => {
    console.log(leadId)
    const token = getCookie('token'); // Assuming token-based authentication
  
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',  // Ensure JSON content type
    };
  
    try {
      const API_URL = `${process.env.REACT_APP_BACKEND_URL}leads/${leadId}/status`;
  
      // Send the PATCH request with the new status
      const response = await axios.patch(API_URL, { status: newStatus }, { headers });
  
      console.log('Lead status updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating lead status:', error);
      throw error; // Handle errors as needed
    }
  };