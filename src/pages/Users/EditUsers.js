import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import { getUserById, updateUser } from '../../services/usersService';
import { toast, Bounce } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const EditUsers = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

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
  const [cnicPhoto, setCnicPhoto] = useState(null); // New CNIC photo
  const [existingCnicPhoto, setExistingCnicPhoto] = useState(null); // Old CNIC photo
  const [useOldCnicPhoto, setUseOldCnicPhoto] = useState(true); // State to toggle between old and new CNIC photo
  const [workingStartTime, setWorkingStartTime] = useState(null);
  const [workingEndTime, setWorkingEndTime] = useState(null);
  const [allowedBreakTimePerDay, setAllowedBreakTimePerDay] = useState('');

  const roleOptions = [
    { value: 'agent', label: 'Agent' },
    // Add more roles if necessary
  ];

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      const userData = await getUserById(userId);
      setFirstname(userData.firstname);
      setLastname(userData.lastname);
      setUsername(userData.username);
      setEmail(userData.email);
      setPhoneNumber(userData.phoneNumber);
      setCnic(userData.cnic);
      setBankAccount(userData.bank_account);
      setAddress(userData.address);
      setEmergencyNo(userData.emergency_no);
      setRole(roleOptions.find((role) => role.value === userData.role));
      setExistingCnicPhoto(userData.cnic_photo);
      setWorkingStartTime(userData.workingStartTime ? new Date(userData.workingStartTime) : null);
      setWorkingEndTime(userData.workingEndTime ? new Date(userData.workingEndTime) : null);
      setAllowedBreakTimePerDay(userData.allowedBreakTimePerDay || '');
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleFileChange = (event) => {
    setCnicPhoto(event.target.files[0]);
    setUseOldCnicPhoto(false); // Switch to new CNIC photo
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('firstname', firstname);
    formData.append('lastname', lastname);
    formData.append('username', username);
    formData.append('email', email);
    formData.append('phoneNumber', phoneNumber);
    formData.append('cnic', cnic);
    formData.append('bank_account', bankAccount);
    formData.append('address', address);
    formData.append('emergency_no', emergencyNo);
    formData.append('role', role?.value);
    formData.append('workingStartTime', workingStartTime ? workingStartTime.toISOString() : '');
    formData.append('workingEndTime', workingEndTime ? workingEndTime.toISOString() : '');
    formData.append('allowedBreakTimePerDay', allowedBreakTimePerDay.toString());

    // If a new password is provided, append it
    if (password) {
      formData.append('password', password);
    }

    // Append the new CNIC photo if provided, otherwise keep the old one
    if (!useOldCnicPhoto && cnicPhoto) {
      formData.append('cnic_photo', cnicPhoto);
    } else {
      formData.append('keepOldCnicPhoto', 'true'); // Flag to indicate that old CNIC photo should be kept
    }

    try {
      await updateUser(userId, formData);
      toast.success('User updated successfully', {
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
      toast.error('Failed to update user', {
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
      console.error('Error updating user:', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Edit User</h2>
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

        {/* Password (Optional) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Password (optional)</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
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
            onChange={handleFileChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
          />
          {existingCnicPhoto && useOldCnicPhoto && (
            <p className="mt-2 text-gray-600">
              Using existing CNIC photo.{' '}
              <span
                className="text-blue-500 underline cursor-pointer"
                onClick={() => setUseOldCnicPhoto(false)}
              >
                Upload new one
              </span>
            </p>
          )}
          {!useOldCnicPhoto && (
            <p className="mt-2 text-gray-600">
              <span
                className="text-blue-500 underline cursor-pointer"
                onClick={() => setUseOldCnicPhoto(true)}
              >
                Revert to old CNIC photo
              </span>
            </p>
          )}
        </div>

        {/* Bank Account */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Bank Account</label>
          <input
            type="text"
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
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
          <label className="block text-sm font-medium text-gray-700">Allowed Break Time Per Day (minutes)</label>
          <input
            type="number"
            value={allowedBreakTimePerDay}
            onChange={(e) => setAllowedBreakTimePerDay(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            placeholder="Enter break time (in minutes)"
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
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            Update User
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUsers;
