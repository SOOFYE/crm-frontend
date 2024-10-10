import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCampaignTypes } from '../../services/campaignTypeService'; // Add your service
import { toast, Bounce } from 'react-toastify';
import CreatableSelect from 'react-select/creatable'; // For tag input

const CreateCampaignTypes = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const defaultField = { label: 'phoneNumber', value: 'phoneNumber' }; // Default required field
  const [requiredFields, setRequiredFields] = useState([defaultField]); // Initialize with default field

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create the request payload
    const payload = {
      name,
      description,
      requiredFields: requiredFields.map(field => field.value), 
    };

    try {
      await createCampaignTypes(payload);
      toast.success('Campaign Type created successfully', {
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
      toast.error('Failed to create campaign type', {
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
      console.error('Error creating campaign type:', error);
    }
  };

  // Handle the required fields, ensuring the default field is always present
  const handleFieldChange = (newValue) => {
    if (!newValue.find((field) => field.value === defaultField.value)) {
      newValue = [defaultField, ...newValue]; // Re-add the default field if removed
    }
    setRequiredFields(newValue);
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Create New Campaign Type</h2>
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
            onChange={handleFieldChange}
            placeholder="Add required fields"
            className="mt-1"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded"
          >
            Create Campaign Type
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCampaignTypes;