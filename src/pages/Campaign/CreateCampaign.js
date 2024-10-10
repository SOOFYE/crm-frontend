import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import { createCampaign } from '../../services/campaignService';
import { fetchCampaignTypes } from '../../services/campaignTypeService';
import { fetchUsers } from '../../services/usersService';
import { fetchForms } from '../../services/formBuilderService'; // Service to fetch forms
import { fetchCampaignDataInfo } from '../../services/campaignDataService'; // Update service call
import { CampaignStatusEnum } from '../../common/CampaignStatusEnum';
import { toast, Bounce } from 'react-toastify';

const CreateCampaign = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(CampaignStatusEnum.INACTIVE); // Default to inactive
  const [agents, setAgents] = useState([]);
  const [campaignTypeId, setCampaignTypeId] = useState(null); // Track selected campaign type
  const [formId, setFormId] = useState(null); // Optional form selection
  const [processedDataIds, setProcessedDataIds] = useState([]); // Optional processed data selection
  const [agentOptions, setAgentOptions] = useState([]);
  const [campaignTypeOptions, setCampaignTypeOptions] = useState([]);
  const [formOptions, setFormOptions] = useState([]);
  const [processedDataOptions, setProcessedDataOptions] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    loadAgents();
    loadCampaignTypes();
    loadForms();
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

  const loadForms = async () => {
    const data = await fetchForms({ page: 1, limit: 999999, searchField: ['name'] });
    setFormOptions(data.data.map(form => ({ value: form.id, label: form.name })));
  };

  const loadCampaignData = async (campaignTypeId) => {
    if (!campaignTypeId) return;
    try {
      const data = await fetchCampaignDataInfo(campaignTypeId); // Fetch processed data based on campaign type
      setProcessedDataOptions(
        data.map(campaignData => ({
          value: campaignData.id,
          label: campaignData.name,
        }))
      );
    } catch (error) {
      toast.error('Failed to fetch processed data', {
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

    // Ensure processed data is selected
    if (processedDataIds.length === 0) {
      toast.error('Please select at least one processed data entry.', {
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
      return;
    }

    const formData = {
      name,
      description,
      status,
      agentIds: agents.map(agent => agent.value), // Convert selected agents to their UUIDs
      campaignTypeId: campaignTypeId?.value, // Selected campaign type
      formId: formId?.value, // Optional form ID
      processedDataIds: processedDataIds.map(data => data.value), // Required processed data IDs
    };

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
            placeholder="Optional"
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
            onChange={(selected) => {
              setCampaignTypeId(selected);
              loadCampaignData(selected?.value); // Load processed data for the selected campaign type
            }}
            className="mt-1"
            placeholder="Search and select campaign type"
            required
          />
        </div>

        {/* Form (Optional) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Form (Optional)</label>
          <Select
            options={formOptions}
            value={formId}
            onChange={setFormId}
            className="mt-1"
            placeholder="Search and select form"
          />
        </div>

        {/* Processed Data (Mandatory) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Processed Data</label>
          <Select
            isMulti
            options={processedDataOptions}
            value={processedDataIds}
            onChange={(selectedOptions) => setProcessedDataIds(selectedOptions || [])}
            className="mt-1"
            placeholder="Select processed data"
            required
            isDisabled={!campaignTypeId} // Disable until campaign type is selected
          />
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