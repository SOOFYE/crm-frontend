import React, { useState } from 'react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import { toast, Bounce } from 'react-toastify';
import DatePicker from 'react-datepicker'; // For time selection
import 'react-datepicker/dist/react-datepicker.css'; // Datepicker CSS
import { createUser } from '../../services/usersService';

const AddUsers = () => {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [cnic, setCnic] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyNo, setEmergencyNo] = useState('');
  const [role, setRole] = useState(null);
  const [cnicPhoto, setCnicPhoto] = useState(null); // State for CNIC photo file
  const [workingStartTime, setWorkingStartTime] = useState(null); // Start time
  const [workingEndTime, setWorkingEndTime] = useState(null); // End time
  const [allowedBreakTimePerDay, setAllowedBreakTimePerDay] = useState(''); // Allowed break time

  const navigate = useNavigate();

  const roleOptions = [
    { value: 'agent', label: 'Agent' },
    // Add more roles here if necessary
  ];

  // Handle file change for CNIC photo
  const handleFileChange = (event) => {
    setCnicPhoto(event.target.files[0]); // Set the file in the state
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(); // Use FormData to handle both file and data
    formData.append('firstname', firstname);
    formData.append('lastname', lastname);
    formData.append('username', username);
    formData.append('email', email);
    formData.append('phoneNumber', phoneNumber);
    formData.append('password', password);
    formData.append('cnic', cnic);
    formData.append('bank_account', bankAccount);
    formData.append('address', address);
    formData.append('emergency_no', emergencyNo);
    formData.append('role', role?.value);

    // Append the CNIC photo file if provided
    if (cnicPhoto) {
      formData.append('cnic_photo', cnicPhoto);
    }

    // Append working hours and allowed break time
    formData.append('workingStartTime', workingStartTime ? workingStartTime.toISOString() : '');
    formData.append('workingEndTime', workingEndTime ? workingEndTime.toISOString() : '');
    formData.append('allowedBreakTimePerDay', allowedBreakTimePerDay);

    try {
      await createUser(formData); // Pass FormData to the service
      toast.success('User created successfully', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
        transition: Bounce,
      });
      navigate('/admin/view-users');
    } catch (error) {
      toast.error('Failed to create user', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
        transition: Bounce,
      });
      console.error('Error creating user:', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Add New User</h2>
      <form onSubmit={handleSubmit}>
        {/* First Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <input
            type="text"
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            required
          />
        </div>

        {/* Last Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Last Name</label>
          <input
            type="text"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            required
          />
        </div>

        {/* Username */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            required
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            required
          />
        </div>

        {/* Phone Number */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            required
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            required
          />
        </div>

        {/* CNIC */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">CNIC</label>
          <input
            type="text"
            value={cnic}
            onChange={(e) => setCnic(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            placeholder=""
          />
        </div>

        {/* CNIC Photo */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">CNIC Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange} // Handle file input
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            placeholder=""
          />
        </div>

        {/* Bank Account */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Bank Account</label>
          <input
            type="text"
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            placeholder=""
          />
        </div>

        {/* Address */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            placeholder=""
          />
        </div>

        {/* Emergency Number */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Emergency Contact Number</label>
          <input
            type="text"
            value={emergencyNo}
            onChange={(e) => setEmergencyNo(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            placeholder=""
          />
        </div>

        {/* Working Start Time */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Working Start Time</label>
          <DatePicker
            selected={workingStartTime}
            onChange={(date) => setWorkingStartTime(date)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="Start Time"
            dateFormat="h:mm aa"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            placeholderText="Select Start Time"
          />
        </div>

        {/* Working End Time */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Working End Time</label>
          <DatePicker
            selected={workingEndTime}
            onChange={(date) => setWorkingEndTime(date)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="End Time"
            dateFormat="h:mm aa"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            placeholderText="Select End Time"
          />
        </div>

        {/* Allowed Break Time */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Allowed Break Time (in minutes)</label>
          <input
            type="number"
            value={allowedBreakTimePerDay}
            onChange={(e) => setAllowedBreakTimePerDay(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            placeholder="Enter allowed break time"
            required
          />
        </div>

        {/* Role */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <Select
            options={roleOptions}
            value={role}
            onChange={setRole}
            className="mt-1"
            placeholder="Select user role"
            required
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded"
          >
            Create User
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUsers;
