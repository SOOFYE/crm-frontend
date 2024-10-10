import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchSingleCampaignType, updateCampaignType } from '../../services/campaignTypeService'; // Add your service
import { toast, Bounce } from 'react-toastify';
import CreatableSelect from 'react-select/creatable'; // For tag input

const EditCampaignType = () => {
  const { campaignTypeId } = useParams(); // Get the ID from URL params
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [requiredFields, setRequiredFields] = useState([]); // For tag input
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCampaignType = async () => {
      setLoading(true);
      try {
        const data = await fetchSingleCampaignType(campaignTypeId); // Fetch campaign type details by ID
        setName(data.name);
        setDescription(data.description);
        setRequiredFields(data.requiredFields.map(field => ({ value: field, label: field }))); // Convert to select format
      } catch (err) {
        setError('Failed to fetch campaign type');
      } finally {
        setLoading(false);
      }
    };
    loadCampaignType();
  }, [campaignTypeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedData = {
      name,
      description,
      requiredFields: requiredFields.map(field => field.value), // Convert tags to array of values
    };

    try {
      await updateCampaignType(campaignTypeId, updatedData); // Update the campaign type using the ID
      toast.success('Campaign Type updated successfully', {
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
      navigate('/admin/view-campaign-types');
    } catch (error) {
      toast.error('Failed to update campaign type', {
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

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Edit Campaign Type</h2>
      <form onSubmit={handleSubmit}>
        {/* Campaign Type Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Campaign Type Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            required
          />
        </div>

        {/* Campaign Type Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            required
          />
        </div>

        {/* Required Fields (Tag Input) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Required Fields</label>
          <CreatableSelect
            isMulti
            value={requiredFields}
            onChange={setRequiredFields}
            placeholder="Edit required fields"
            className="mt-1"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded"
          >
            Update Campaign Type
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCampaignType;