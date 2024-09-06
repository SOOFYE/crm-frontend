import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import { createCampaign } from '../../services/campaignService';
import { fetchCampaignTypes } from '../../services/campaignTypeService';
import { fetchUsers } from '../../services/usersService';
import { CampaignStatusEnum } from '../../common/CampaignStatusEnum';
import { toast, Bounce } from 'react-toastify';

import Papa from 'papaparse'; // To parse CSV files

const CreateCampaign = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [agents, setAgents] = useState([]);
  const [campaignTypeId, setCampaignTypeId] = useState(null);
  const [filterField, setFilterField] = useState('');
  const [fileCriteria, setFileCriteria] = useState(null);
  const [csvHeaders, setCsvHeaders] = useState([]); // Store the CSV headers after parsing
  const [agentOptions, setAgentOptions] = useState([]);
  const [campaignTypeOptions, setCampaignTypeOptions] = useState([]);

  // Additional Fields State
  const [additionalFields, setAdditionalFields] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    loadAgents();
    loadCampaignTypes();
  }, []);

  const loadAgents = async () => {
    const data = await fetchUsers({
      page: 1,
      limit: 999999,
      searchField: ['firstname', 'lastname', 'username', 'phoneNumber'],
      filters: { role: 'agent' },
    });
    const agents = data.data;
    setAgentOptions(agents.map(agent => ({ value: agent.id, label: `${agent.username} - ${agent.firstname} ${agent.lastname}` })));
  };

  const loadCampaignTypes = async () => {
    const data = await fetchCampaignTypes({ page: 1, limit: 999999, searchField: ['name'] });
    setCampaignTypeOptions(data.data.map(type => ({ value: type.id, label: type.name })));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileCriteria(file); // Store the CSV file
    
    // Parse CSV to extract headers
    Papa.parse(file, {
      complete: function(results) {
        const headers = results.data[0]; // Get the first row as headers
        setCsvHeaders(headers); // Set the headers for validation
      },
      header: false, // We just need to read raw rows for headers
    });
  };

  const handleAddField = () => {
    setAdditionalFields([...additionalFields, { name: '', type: '' }]);
  };

  const handleRemoveField = (index) => {
    const newFields = [...additionalFields];
    newFields.splice(index, 1);
    setAdditionalFields(newFields);
  };

  const handleFieldChange = (index, field, value) => {
    const newFields = [...additionalFields];
    newFields[index][field] = value;
    setAdditionalFields(newFields);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('status', status);
    agents.forEach(agent => formData.append('agents[]', agent.value));
    formData.append('campaignTypeId', campaignTypeId?.value);

    // Convert the comma-separated filterField string to an array
    const filterFieldArray = filterField ? filterField.split(',').map(field => field.trim()) : [];

    // If a file is uploaded, validate the CSV headers
    if (fileCriteria) {
      const missingHeaders = filterFieldArray.filter(field => !csvHeaders.includes(field));
      
      if (missingHeaders.length > 0) {
        toast.error(`The uploaded CSV is missing the following headers: ${missingHeaders.join(', ')}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
        return; // Stop form submission if headers don't match
      }
    }

    formData.append('filterField', filterField); // Use comma-separated string for filterField
    if (fileCriteria) {
      formData.append('fileCriteria', fileCriteria);
    }
    formData.append('additionalFields', JSON.stringify(additionalFields)); // Send additional fields as JSON
    
    try {
      await createCampaign(formData);
      toast.success('Campaign created successfully', {
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
      navigate('/admin/view-campaign');
    } catch (error) {
      toast.error('Failed to create campaign', {
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
      console.error('Error creating campaign:', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Create New Campaign</h2>
      <form onSubmit={handleSubmit}>
        {/* Campaign Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Campaign Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            required
          />
        </div>

        {/* Campaign Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
          />
        </div>

        {/* Campaign Status */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            required
          >
            <option value="" disabled>Select Status</option>
            <option value={CampaignStatusEnum.ACTIVE}>Active</option>
            <option value={CampaignStatusEnum.INACTIVE}>Inactive</option>
          </select>
        </div>

        {/* Assign Agents */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Assign Agents</label>
          <Select
            options={agentOptions}
            isMulti
            value={agents}
            onChange={setAgents}
            className="mt-1"
            placeholder="Search and select agents"
            required
          />
        </div>

        {/* Campaign Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Campaign Type</label>
          <Select
            options={campaignTypeOptions}
            value={campaignTypeId}
            onChange={setCampaignTypeId}
            className="mt-1"
            placeholder="Search and select campaign type"
            required
          />
        </div>

        {/* Filter Fields */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Filter Fields (Comma-separated)</label>
          <input
            type="text"
            value={filterField}
            onChange={(e) => setFilterField(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            placeholder="e.g. field1,field2"
          />
        </div>

        {/* File Criteria */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Filter Criteria File</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="mt-1 block w-full"
            disabled={!filterField} // Disable if filterField is empty
          />
        </div>

        {/* Additional Fields */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Additional Fields for Agents</label>
          {additionalFields.map((field, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={field.name}
                onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                placeholder="Field Name"
                className="w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
                required
              />
              <select
                value={field.type}
                onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
                className="w-1/4 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
                required
              >
                <option value="" disabled>Select Type</option>
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="email">Email</option>
              </select>
              {additionalFields.length > 1 && (
                <button
                  type="button"
                  className="text-red-600"
                  onClick={() => handleRemoveField(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="text-blue-500"
            onClick={handleAddField}
          >
            + Add Field
          </button>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded"
          >
            Create Campaign
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCampaign;