import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Added useNavigate
import { fetchSingleCampaignType } from '../../services/campaignTypeService'; 
import moment from 'moment';

const SingleCampaignType = () => {
  const { campaignTypeId } = useParams(); 
  const [campaignType, setCampaignType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // To navigate to the edit page

  useEffect(() => {
    const loadCampaignType = async () => {
      setLoading(true);
      try {
        const data = await fetchSingleCampaignType(campaignTypeId); 
        setCampaignType(data);
      } catch (err) {
        setError('Failed to fetch campaign type');
      } finally {
        setLoading(false);
      }
    };
    loadCampaignType();
  }, [campaignTypeId]);

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  const handleEdit = () => {
    navigate(`/admin/edit-campaign-type/${campaignTypeId}`); // Redirect to the edit page
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Campaign Type Details</h2>
        {/* Edit Button */}
        <button
          onClick={handleEdit}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
        >
          Edit
        </button>
      </div>
      
      {campaignType && (
        <div className="grid grid-cols-1 gap-6">
          {/* Campaign Type Name */}
          <div className="bg-white shadow-md rounded-lg p-4">
            <h3 className="text-lg font-semibold">Campaign Type Name</h3>
            <p className="text-gray-700">{campaignType.name}</p>
          </div>

          {/* Campaign Type Description */}
          <div className="bg-white shadow-md rounded-lg p-4">
            <h3 className="text-lg font-semibold">Description</h3>
            <p className="text-gray-700">{campaignType.description}</p>
          </div>

          {/* Required Fields */}
          <div className="bg-white shadow-md rounded-lg p-4">
            <h3 className="text-lg font-semibold">Required Fields</h3>
            {campaignType.requiredFields && campaignType.requiredFields.length > 0 ? (
              <ul className="list-disc list-inside text-gray-700">
                {campaignType.requiredFields.map((field, index) => (
                  <li key={index}>{field}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No required fields specified.</p>
            )}
          </div>

          {/* Created At */}
          <div className="bg-white shadow-md rounded-lg p-4">
            <h3 className="text-lg font-semibold">Created At</h3>
            <p className="text-gray-700">{moment(campaignType.createdAt).format('MMMM Do YYYY, h:mm:ss a')}</p>
          </div>

          {/* Updated At */}
          <div className="bg-white shadow-md rounded-lg p-4">
            <h3 className="text-lg font-semibold">Last Updated At</h3>
            <p className="text-gray-700">{moment(campaignType.updatedAt).format('MMMM Do YYYY, h:mm:ss a')}</p>
          </div>

          {/* Deleted At (if applicable) */}
          {campaignType.deletedAt && (
            <div className="bg-white shadow-md rounded-lg p-4">
              <h3 className="text-lg font-semibold">Deleted At</h3>
              <p className="text-red-600">{moment(campaignType.deletedAt).format('MMMM Do YYYY, h:mm:ss a')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SingleCampaignType;