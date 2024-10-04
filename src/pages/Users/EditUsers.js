import React, {useState, useEffect} from 'react'
import { fetchSingleUser, updateUser } from '../../services/usersService';
import { toast, Bounce } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';

const EditUsers = () => {
    const { userId } = useParams(); // Get userId from URL
    const [user,setUser] = useState()
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [cnic, setCnic] = useState('');
    const [bankName, setBankName] = useState('');
    const [bankAccount, setBankAccount] = useState('');
    const [address, setAddress] = useState('');
    const [emergencyPhoneNumber, setEmergencyPhoneNumber] = useState('');
    const [role, setRole] = useState(null);
    const [roleOptions, setRoleOptions] = useState([
      { value: 'ADMIN', label: 'Admin' },
      { value: 'AGENT', label: 'Agent' },
    ]);
    const navigate = useNavigate();
  
    useEffect(() => {
      loadUserData();
    }, [userId]);
  
    const loadUserData = async () => {
      try {
        const user = await fetchSingleUser(userId); // Fetch single user by ID
        setUser(user)
        setFirstname(user.firstname);
        setLastname(user.lastname);
        setUsername(user.username);
        setEmail(user.email);
        setPhoneNumber(user.phoneNumber);
        setCnic(user.cnic);
        setBankName(user.bankName);
        setBankAccount(user.bankAccount);
        setAddress(user.address);
        setEmergencyPhoneNumber(user.emergencyPhoneNumber);
        setRole({ value: user.role, label: user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() });
      } catch (error) {
        console.error('Error loading user data:', error);
        toast.error('Failed to load user data', {
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
      }
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      const updatedUserData = {
        firstname,
        lastname,
        username,
        email,
        phoneNumber,
        cnic,
        bankName,
        bankAccount,
        address,
        emergencyPhoneNumber,
        role: role?.value,
      };

      if (password){
        updatedUserData.password = password
      }


  
      try {
        await updateUser(userId, updatedUserData); // Update user by ID
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
        navigate('/admin/view-users'); // Redirect to view users page
      } catch (error) {
        console.error('Error updating user:', error);
        toast.error(error.response.data.error,'Failed to update user', {
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
  
          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
              placeholder="Leave blank to keep the current password"
              maxLength={8}
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
            />
          </div>
  
          {/* Bank Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Bank Name</label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
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
  
          {/* Emergency Phone Number */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Emergency Phone Number</label>
            <input
              type="text"
              value={emergencyPhoneNumber}
              onChange={(e) => setEmergencyPhoneNumber(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
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
              placeholder="Select Role"
              required
            />
          </div>
  
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded"
            >
              Update User
            </button>
          </div>
        </form>
      </div>
    );
  };
  
  export default EditUsers;