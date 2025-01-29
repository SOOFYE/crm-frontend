import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import { getUserById } from '../../services/usersService'; // Import the service
import { getSignedUrl } from '../../services/signedUrlService';
import moment from 'moment'; // For formatting dates and times

const SingleViewUser = () => {
  const { userId } = useParams(); // Get userId from URL params
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Initialize navigate function

  const fetchUserDetails = async () => {
    try {
      const userData = await getUserById(userId);
      console.log(userData);
      setUser(userData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails(); // Fetch user data on component mount
  }, [userId]);

  const handleDownload = async (s3Url) => {
    try {
      const response = await getSignedUrl(s3Url);
      window.open(response, '_blank'); // Open the signed URL to initiate the download
    } catch (error) {
      console.error('Error generating signed URL:', error);
    }
  };

  const handleEdit = () => {
    // Navigate to the edit page, assuming your edit route is `/admin/edit-user/:userId`
    navigate(`/admin/edit-user/${userId}`);
  };

  if (loading) {
    return <div>Loading...</div>; // Show a loading state while fetching data
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">User Details</h1>
        <button
          onClick={handleEdit}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Edit
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User Info Card */}
        <div className="p-6 bg-gray-50 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700">Personal Information</h2>
          <p className="mt-4 text-gray-600"><strong>First Name:</strong> {user?.firstname || 'N/A'}</p>
          <p className="mt-2 text-gray-600"><strong>Last Name:</strong> {user?.lastname || 'N/A'}</p>
          <p className="mt-2 text-gray-600"><strong>Username:</strong> {user?.username || 'N/A'}</p>
          <p className="mt-2 text-gray-600"><strong>Email:</strong> {user?.email || 'N/A'}</p>
          <p className="mt-2 text-gray-600"><strong>Phone Number:</strong> {user?.phoneNumber || 'N/A'}</p>
          <p className="mt-2 text-gray-600"><strong>Role:</strong> {user?.role || 'N/A'}</p>
        </div>

        {/* Bank and Emergency Info */}
        <div className="p-6 bg-gray-50 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700">Additional Information</h2>
          <p className="mt-4 text-gray-600"><strong>CNIC:</strong> {user?.cnic || 'N/A'}</p>
          <p className="mt-2 text-gray-600"><strong>Bank Account:</strong> {user?.bank_account || 'N/A'}</p>
          <p className="mt-2 text-gray-600"><strong>Address:</strong> {user?.address || 'N/A'}</p>
          <p className="mt-2 text-gray-600"><strong>Emergency Contact:</strong> {user?.emergency_no || 'N/A'}</p>
        </div>

        {/* Working Hours */}
        <div className="p-6 bg-gray-50 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700">Work Hours</h2>
          <p className="mt-4 text-gray-600"><strong>Start Time:</strong> {user?.workingStartTime ? moment(user.workingStartTime).format('h:mm A') : 'N/A'}</p>
          <p className="mt-2 text-gray-600"><strong>End Time:</strong> {user?.workingEndTime ? moment(user.workingEndTime).format('h:mm A') : 'N/A'}</p>
          <p className="mt-2 text-gray-600"><strong>Allowed Break Time Per Day:</strong> {user?.allowedBreakTimePerDay ? `${user.allowedBreakTimePerDay} minutes` : 'N/A'}</p>
        </div>

        {/* CNIC Photo Download */}
        <div className="p-6 bg-gray-50 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700">CNIC Photo</h2>
          {user?.cnic_photo ? (
            <button
              onClick={() => handleDownload(user.cnic_photo)}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Download CNIC Photo
            </button>
          ) : (
            <p className="mt-4 text-gray-600">No CNIC photo available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleViewUser;
