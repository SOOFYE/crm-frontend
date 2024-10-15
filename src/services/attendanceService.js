import axios from 'axios';
import { getCookie } from '../utils/getcookie';


import { saveAs } from 'file-saver'; 




// Fetch attendance logs for the last 30 days
export const fetchAttendanceLogs = async () => {
    const token = getCookie('token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const API_URL = process.env.REACT_APP_BACKEND_URL + 'attendance/logs?days=30';
    const response = await axios.get(API_URL, { headers });
    return response.data;
  };
  
  // Fetch holidays for a specific month and year
  export const getHolidaysByMonth = async (month, year) => {
    const token = getCookie('token'); // Assuming you have a function to get token from cookies
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`; // Include token in the Authorization header
    }
  
    const API_URL = process.env.REACT_APP_BACKEND_URL + 'holidays/month';
    try {
      const response = await axios.get(API_URL, {
        params: { month, year },
        headers,  // Pass the headers object with Authorization token
      });
      return response.data; // Return the holidays data
    } catch (error) {
      console.error('Error fetching holidays:', error);
      throw error;
    }
  };
  
  // Clock in functionality for an agent
  export const clockIn = async () => {
    const token = getCookie('token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const API_URL = process.env.REACT_APP_BACKEND_URL + 'attendance/clock-in';
    try {
      const response = await axios.post(API_URL, {}, { headers });
      return response.data;
    } catch (error) {
      console.error('Error during clock-in:', error);
      throw error;
    }
  };
  
  // // Start break functionality for an agent
  // export const startBreak = async () => {
  //   const token = getCookie('token');
  //   const headers = {};
  //   if (token) {
  //     headers['Authorization'] = `Bearer ${token}`;
  //   }
  //   const API_URL = process.env.REACT_APP_BACKEND_URL + 'attendance/start-break';
  //   try {
  //     const response = await axios.patch(API_URL, {}, { headers });
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error during starting break:', error);
  //     throw error;
  //   }
  // };
  
  // // End break functionality for an agent
  // export const endBreak = async () => {
  //   const token = getCookie('token');
  //   const headers = {};
  //   if (token) {
  //     headers['Authorization'] = `Bearer ${token}`;
  //   }
  //   const API_URL = process.env.REACT_APP_BACKEND_URL + 'attendance/end-break';
  //   try {
  //     const response = await axios.patch(API_URL, {}, { headers });
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error during ending break:', error);
  //     throw error;
  //   }


  // };


  export const getAgentStatus = async () => {
    const token = getCookie('token');
  
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  
    const API_URL = `${process.env.REACT_APP_BACKEND_URL}attendance/status`;
  
    try {
      const response = await axios.get(API_URL, { headers });
      return response.data; // Return agent status and details
    } catch (error) {
      console.error('Error fetching agent status:', error);
      throw error;
    }


}


// Clock out functionality for an agent
export const clockOut = async () => {
    const token = getCookie('token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const API_URL = process.env.REACT_APP_BACKEND_URL + 'attendance/clock-out';
    try {
      const response = await axios.patch(API_URL, {}, { headers });
      return response.data;
    } catch (error) {
      console.error('Error during clock-out:', error);
      throw error;
    }
}





export const fetchAttendanceLogsAdmin = async (agentId, startDate, endDate) => {
  const token = getCookie('token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const API_URL = process.env.REACT_APP_BACKEND_URL + `attendance/view?agentId=${agentId}&startDate=${startDate}${endDate ? `&endDate=${endDate}` : ''}`;
  const response = await axios.get(API_URL, { headers });
  return response.data;
};


export const editAttendanceLog = async (logId, agentId, date, updateData) => {
  const token = getCookie('token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const API_URL = process.env.REACT_APP_BACKEND_URL + 'attendance/edit';
  const response = await axios.post(API_URL, {logId, agentId, date, ...updateData }, { headers });
  return response.data;
};

export const markAsLeave = async (logId,agentId, date) => {
  return editAttendanceLog(logId,agentId, date, { absen: 'leave' });
};

export const markAsAbsent = async (logId, agentId, date) => {
  return editAttendanceLog(logId, agentId, date, { status: 'absent' });
};

export const createAttendanceLog = async (agentId, date, logData) => {
  const token = getCookie('token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const API_URL = process.env.REACT_APP_BACKEND_URL + 'attendance/create-log';
  try {
    const response = await axios.post(API_URL, { agentId, date, ...logData }, { headers });
    return response.data;
  } catch (error) {
    console.error('Error creating attendance log:', error);
    throw error;
  }
}



  export const downloadAttendanceLogsCSV = async () => {
    const token = getCookie('token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const API_URL = process.env.REACT_APP_BACKEND_URL + 'attendance/download';
  
    try {
      const response = await axios.get(API_URL, {
        headers,
        responseType: 'blob', // Set response type to blob to handle binary data
      });
  
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, 'attendance_logs.csv'); // Trigger file download with file-saver
  
    } catch (error) {
      console.error('Error downloading CSV file:', error);
      throw error;
    }
  };

