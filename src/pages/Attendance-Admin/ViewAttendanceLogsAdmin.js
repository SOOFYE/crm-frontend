import React, { useState, useEffect } from 'react';
import {
  fetchAttendanceLogsAdmin,
  markAsLeave,
  markAsAbsent,
  editAttendanceLog,
  createAttendanceLog,
  downloadAttendanceLogsCSV
} from '../../services/attendanceService';
import { fetchUsers } from '../../services/usersService';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DataTable from 'react-data-table-component'; // Import ReactDataTable
import DropDown from '../../components/DropDownComp';
import { toast } from 'react-toastify';
import { saveAs } from 'file-saver'; // For saving the CSV
import { TABLEcustomStyles } from '../../styles/table-styles';

function ViewAttendanceLogsAdmin() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(null);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editLog, setEditLog] = useState(null);
  const [newClockIn, setNewClockIn] = useState(null);
  const [newClockOut, setNewClockOut] = useState(null);
  const [newLogDate, setNewLogDate] = useState(new Date());
  const [logStatus, setLogStatus] = useState('clock'); // New field to set status (Clock In, Absent, Leave)

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    const data = await fetchUsers({
      page: 1,
      limit: 999999,
      searchField: ['firstname', 'lastname', 'username', 'phoneNumber'],
      filters: { role: 'agent' },
    });
    const agents = data.data;
    setAgents(
      agents.map((agent) => ({
        value: agent.id,
        label: `${agent.username} - ${agent.firstname} ${agent.lastname}`,
      }))
    );
  };

  const fetchLogs = async () => {
    if (!selectedAgent) {
      toast.error('Please select an agent');
      return;
    }
    setLoading(true);
    const logs = await fetchAttendanceLogsAdmin(
      selectedAgent.value,
      startDate.toISOString(),
      endDate?.toISOString()
    );
    setAttendanceLogs(logs);
    setLoading(false);
  };

  const handleMarkLeave = async (log) => {
    await markAsLeave(log.id, log.agent.id, log.date);
    fetchLogs();
  };

  const handleMarkAbsent = async (log) => {
    await markAsAbsent(log.id, log.agent.id, log.date);
    fetchLogs();
  };

  const handleEditLog = (log) => {
    if (!selectedAgent) {
      toast.error('Please select an agent');
      return;
    }
    setEditLog(log);
    setNewClockIn(log.clockIn ? new Date(log.clockIn) : null);
    setNewClockOut(log.clockOut ? new Date(log.clockOut) : null);
    setNewLogDate(log.date ? new Date(log.date) : new Date());
    setLogStatus('clock'); // Default to Clock In/Out status
    setIsEditing(true);
  };

  const saveEditLog = async () => {
    console.log(editLog)
    return
    try {
      await editAttendanceLog(editLog.id, editLog.agent.id, newLogDate, {
        clockIn: newClockIn ? newClockIn.toISOString() : null,
        clockOut: newClockOut ? newClockOut.toISOString() : null,
        date: newLogDate.toISOString(),
        absenteeStatus: logStatus==='clock'?'present':logStatus,  // Pass absenteeStatus correctly
      });
      setIsEditing(false);
      fetchLogs(); // Reload logs after edit
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const handleCreateLog = async () => {
    if (!selectedAgent) {
      toast.error('Please select an agent');
      return;
    }
    try {
      await createAttendanceLog(selectedAgent.value, newLogDate, {
        clockIn: newClockIn ? newClockIn.toISOString() : null,
        clockOut: newClockOut ? newClockOut.toISOString() : null,
        date: newLogDate.toISOString(),
        absenteeStatus: logStatus,  // Use logStatus for absentee status
      });
      setIsEditing(false);
      fetchLogs();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const openCreateLogModal = () => {
    setIsEditing(true);
    setEditLog(null);
    setNewClockIn(null);
    setNewClockOut(null);
    setNewLogDate(new Date());
    setLogStatus('clock'); // Default to Clock In/Out status
  };

  const calculateHoursWorked = (clockIn, clockOut) => {
    if (!clockIn || !clockOut) return '-';
    const startTime = new Date(clockIn);
    const endTime = new Date(clockOut);
    const hoursWorked = (endTime - startTime) / 1000 / 60 / 60;
    return hoursWorked.toFixed(2);
  };

  const downloadLogs = async () => {
    try {
      const csvData = await downloadAttendanceLogsCSV(); // Fetch CSV data from backend
      //const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      //saveAs(blob, 'attendance_logs.csv'); // Trigger download using file-saver
    } catch (error) {
      toast.error('Failed to download logs');
    }
  };

  const formatTime = (date) => {

  let formatedDate = date ? new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A';

    return formatedDate
}


const dropdownOptions = [
  { label: 'Edit', onClick: handleEditLog },
];


const columns = [
  {
    name: 'Agent Name',
    selector: (log) => `${log.agent.firstname} ${log.agent.lastname}`,
  },
  {
    name: 'Date',
    selector: (log) => new Date(log.date).toLocaleDateString(),
  },
  {
    name: 'Clock In',
    selector: (log) => formatTime(log.clockIn),
  },
  {
    name: 'Clock Out',
    selector: (log) => formatTime(log.clockOut),
  },
  {
    name: 'Hours Worked',
    selector: (log) => calculateHoursWorked(log.clockIn, log.clockOut),
  },
  {
    name: 'Absentee Status',
    selector: (log) => log.absenteeStatus || 'N/A', // Display absenteeStatus (absent, leave, present)
  },
  {
    name: 'Clock In Status',
    selector: (log) => log.clockInStatus || 'N/A', // Show clock-in status (early, late, on time)
  },
  {
    name: 'Clock Out Status',
    selector: (log) => log.clockOutStatus || 'N/A', // Show clock-out status (early, on time)
  },
  {
    name: 'Actions',
    cell: (log) => (
      <DropDown 
        options={dropdownOptions}
        row={log}
      />
    ),
  },
];

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Attendance Logs Admin</h2>

      <div className="flex space-x-4 mb-4">
        <Select
          options={agents}
          onChange={setSelectedAgent}
          placeholder="Select Agent"
          className="w-1/3"
        />
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          className="p-2 border rounded-md"
          placeholderText="Start Date"
        />
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          className="p-2 border rounded-md"
          placeholderText="End Date (optional)"
        />
        <button onClick={fetchLogs} className="bg-blue-500 text-white px-4 py-2 rounded-md">
          Fetch Logs
        </button>
        <button onClick={openCreateLogModal} className="bg-[#059669] text-white px-4 py-2 rounded-md">
          Create Log
        </button>
        <button onClick={downloadLogs} className="bg-[#059669] text-white px-4 py-2 rounded-md">
          Download Logs
        </button>
      </div>

      
      <DataTable
                    columns={columns}
                    data={attendanceLogs}
                    progressPending={loading}
                    highlightOnHover
                    pointerOnHover
                    customStyles={TABLEcustomStyles}
                />
            

      {isEditing && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center">
          <div className="bg-white p-8 rounded-md shadow-md">
            <h3 className="text-xl font-bold mb-4">{editLog ? 'Edit Attendance Log' : 'Create Attendance Log'}</h3>
            <div className="mb-4">
              <label className="block text-gray-700">Date</label>
              <DatePicker
                selected={newLogDate}
                onChange={(date) => setNewLogDate(date)}
                className="p-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Clock In</label>
              <DatePicker
                selected={newClockIn}
                onChange={(date) => setNewClockIn(date)}
                showTimeSelect
                dateFormat="Pp"
                className="p-2 border rounded-md"
                disabled={logStatus !== 'clock'} // Disable if status is not clock-in
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Clock Out</label>
              <DatePicker
                selected={newClockOut}
                onChange={(date) => setNewClockOut(date)}
                showTimeSelect
                dateFormat="Pp"
                className="p-2 border rounded-md"
                disabled={logStatus !== 'clock'} // Disable if status is not clock-out
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Status</label>
              <div className="flex space-x-4">
                <label>
                  <input
                    type="radio"
                    value="clock"
                    checked={logStatus === 'clock'}
                    onChange={() => setLogStatus('clock')}
                  />{' '}
                  Clock In/Out
                </label>
                <label>
                  <input
                    type="radio"
                    value="absent"
                    checked={logStatus === 'absent'}
                    onChange={() => setLogStatus('absent')}
                  />{' '}
                  Absent
                </label>
                <label>
                  <input
                    type="radio"
                    value="leave"
                    checked={logStatus === 'leave'}
                    onChange={() => setLogStatus('leave')}
                  />{' '}
                  Leave
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={editLog ? saveEditLog : handleCreateLog}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewAttendanceLogsAdmin;
