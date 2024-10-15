import React, { useState, useEffect } from 'react';
import { getAgentStatus, clockIn, clockOut, fetchAttendanceLogs } from '../../services/attendanceService';
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css for the confirm dialog
import { getAgentWorkingHoursAndBreakTime } from '../../services/usersService';
const AttendanceDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('no-record'); // Initial status
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false); // Loading state for buttons
  const [currentTime, setCurrentTime] = useState(new Date());
  const [agentInfo, setAgentInfo] = useState(null); // For displaying agent's working hours and break time

  // Load attendance logs and agent status
  useEffect(() => {
    loadAttendanceData();
    loadAgentHours();
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  async function loadAgentHours() {
    try{
      let agentInfo = await getAgentWorkingHoursAndBreakTime();
      let wt = formatTime(agentInfo.workingStartTime);
      let et = formatTime(agentInfo.workingEndTime);
      setAgentInfo({ workStartTime: wt, workEndTime: et }); 
      console.log(agentInfo)

    }catch(error){
      console.log(error);
      toast.error('Failed to load agent info');
    }
  }

  async function loadAttendanceData() {
    try {
      setLoading(true);
      const logsData = await fetchAttendanceLogs(); // Fetch attendance logs
      const statusData = await getAgentStatus(); // Fetch agent's status

      console.log(logsData);
      console.log(statusData);

      setLogs(logsData);
      setStatus(statusData.status); // Set clock-in status
      setMessage(statusData.message); // Set status message

      
      // Set the agent's working hours and break time
    } catch (err) {
      console.log(err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  const handleClockIn = async () => {
    try {
      setButtonLoading(true); // Set button loading state
      await clockIn();
      loadAttendanceData(); // Reload data after clock-in
      toast.success('Clocked in successfully!');
    } catch (err) {
      toast.error('Clock-In failed');
    } finally {
      setButtonLoading(false); // Reset button loading state
    }
  };

  const handleClockOut = async () => {
    try {
      setButtonLoading(true); // Set button loading state
      await clockOut();
      loadAttendanceData(); // Reload data after clock-out
      toast.success('Clocked out successfully!');
    } catch (err) {
      toast.error('Clock-Out failed');
    } finally {
      setButtonLoading(false); // Reset button loading state
    }
  };

  // Confirmation dialog for clock-out
  const confirmClockOut = () => {
    confirmAlert({
      title: 'Confirm Clock Out',
      message: 'Are you sure you want to clock out?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => handleClockOut(),
        },
        {
          label: 'No',
          onClick: () => {
            // Do nothing if No is clicked
          },
        },
      ],
    });
  };

  // Helper to format time in 12-hour format
  const formatTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  };

  // Helper to calculate hours worked
  const calculateHoursWorked = (clockIn, clockOut) => {
    if (!clockIn || !clockOut) return '-';
    const startTime = new Date(clockIn);
    const endTime = new Date(clockOut);
    const hoursWorked = (endTime - startTime) / 1000 / 60 / 60; // Convert milliseconds to hours
    return hoursWorked.toFixed(2); // Return the number of hours worked, formatted to 2 decimal places
  };

  // Render logs
  const renderLogs = () => (
    <div className="overflow-y-auto max-h-64">
      {logs.length > 0 ? (
        logs.map((log, index) => {
          const formattedClockIn = formatTime(log.clockIn);
          const formattedClockOut = formatTime(log.clockOut);
          const hoursWorked = calculateHoursWorked(log.clockIn, log.clockOut);
  
          return (
              <div
              key={index}
              className={`p-4 mb-2 rounded-lg shadow-md transition ${
              log.absenteeStatus === 'absent' 
                ? 'bg-red-100 hover:bg-red-200' // Absent case
                : log.absenteeStatus === 'leave' 
                ? 'bg-sky-100 hover:bg-sky-200' // On leave case with sky blue background
                : 'bg-gray-100 hover:bg-gray-200' // Default case
              }`}
              >
              <div className="flex justify-between items-center">
                <p className="font-semibold">Date: {new Date(log.date).toLocaleDateString()}</p>
  
                {log.absenteeStatus === 'absent' ? (
                  // If marked absent, only show the date and "Marked Absent" text
                  <div className="flex justify-center items-center w-full">
                    <p className="font-bold text-red-600 text-xl">MARKED ABSENT</p>
                  </div>
                ) : log.absenteeStatus === 'leave' ? (
                  // If on leave, show "ON LEAVE"
                  <div className="flex justify-center items-center w-full">
                    <p className="font-bold text-blue-600 text-xl">ON LEAVE</p>
                  </div>
                ) : (
                  // Show Clock In, Clock Out, status, and Hours Worked if not absent or on leave
                  <div className="flex space-x-8">
                    <p className="font-light text-lg mr-5 text-emerald-600">Clock In: {formattedClockIn}</p>
                    <p className="font-light text-lg text-red-600">Clock Out: {formattedClockOut}</p>
                    <p className="font-light text-lg text-blue-600">Hours Worked: {hoursWorked}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-gray-500">No attendance logs available for the past 30 days.</p>
      )}
    </div>
  );

  // Display loading screen while data is being fetched
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Big clock display */}
      <div className="flex justify-center mb-6">
        <div className="text-5xl font-bold">{currentTime.toLocaleTimeString('en-US', { hour12: true })}</div>
      </div>

      {/* Agent Info Display
      {agentInfo && (
        <div className="absolute top-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-md">
          <h4 className="text-lg font-bold mb-2">Agent Info</h4>
          <p>Work Start: {agentInfo.workStartTime}</p>
          <p>Work End: {agentInfo.workEndTime}</p>
        </div>
      )} */}

      {/* Clock In / Clock Out Button */}
      <div className="flex justify-center m-10">
        {status === 'clocked-in' ? (
          <button
            onClick={confirmClockOut}
            className="bg-red-500 text-white px-6 py-3 rounded-lg text-xl"
            disabled={buttonLoading}
          >
            {buttonLoading ? 'Processing...' : 'Clock Out'}
          </button>
        ) : status === 'absent' ? (
          <button disabled className="bg-gray-500 text-white px-6 py-3 rounded-lg text-xl">
            You are marked absent today
          </button>
        ) : status === 'leave' ? (
          <button disabled className="bg-gray-500 text-white px-6 py-3 rounded-lg text-xl">
            You are on leave today
          </button>
        ) : status === 'not-clocked-in' || status === 'no-record' ? (
          <button
            onClick={handleClockIn}
            className="bg-green-500 text-white px-6 py-3 rounded-lg text-xl"
            disabled={buttonLoading}
          >
            {buttonLoading ? 'Processing...' : 'Clock In'}
          </button>
        ) : (
          <button disabled className="bg-gray-500 text-white px-6 py-3 rounded-lg text-xl">
            {message}
          </button>
        )}
      </div>

      {/* Attendance Logs */}
      <h3 className="text-lg font-semibold mb-4 text-center">Last 30 Days</h3>
      {renderLogs()}
    </div>
  );
};

export default AttendanceDashboard;
