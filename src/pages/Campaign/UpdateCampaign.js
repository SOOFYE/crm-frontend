import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchSingleCampaign, updateCampaign } from '../../services/campaignService';
import { fetchCampaignTypes } from '../../services/campaignTypeService';
import { fetchUsers } from '../../services/usersService';
import { fetchForms } from '../../services/formBuilderService'; // Service to fetch forms
import { fetchCampaignDataInfo } from '../../services/campaignDataService'; // Fetch campaign data
import { CampaignStatusEnum } from '../../common/CampaignStatusEnum';
import { toast, Bounce } from 'react-toastify';

const UpdateCampaign = () => {
  const { campaignId } = useParams(); // Campaign ID from URL
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(CampaignStatusEnum.INACTIVE); // Default to inactive
  const [agents, setAgents] = useState([]);
  const [campaignTypeId, setCampaignTypeId] = useState(null);
  const [formId, setFormId] = useState(null); // Optional form selection
  const [processedDataIds, setProcessedDataIds] = useState([]); // Optional processed data selection

  const [agentOptions, setAgentOptions] = useState([]);
  const [campaignTypeOptions, setCampaignTypeOptions] = useState([]);
  const [formOptions, setFormOptions] = useState([]);
  const [processedDataOptions, setProcessedDataOptions] = useState([]);

  // Load initial data when the component is mounted
  useEffect(() => {
    loadCampaign();
    loadAgents();
    loadCampaignTypes();
    loadForms();
  },[]);


//   useEffect(()=>{
//     if(campaignTypeId?.value)
//         loadCampaignData(campaignTypeId?.value)
//   }, [campaignTypeId])

  // Fetch single campaign data
  const loadCampaign = async () => {
    try {
      const data = await fetchSingleCampaign(campaignId);
      console.log(data)
      setName(data.name);
      setDescription(data.description);
      setStatus(data.status);
      setAgents(
        data.agents.map(agent => ({
          value: agent.id,
          label: `${agent.username} - ${agent.firstname} ${agent.lastname}`,
        }))
      );
      setCampaignTypeId({ value: data.campaignType.id, label: data.campaignType.name });
      setFormId(data.form ? { value: data.form.id, label: data.form.name } : null);
      setProcessedDataIds(
        data.processedData.map(data => ({
          value: data.id,
          label: data.name,
        }))
      );

      loadCampaignData(data.campaignType.id);

    } catch (error) {
      console.error('Failed to load campaign', error);
      toast.error('Failed to load campaign details', {
        position: 'top-right',
        autoClose: 5000,
        transition: Bounce,
      });
    }
  };

  // Fetch users (agents)
  const loadAgents = async () => {
    const data = await fetchUsers({
      page: 1,
      limit: 999999,
      searchField: ['firstname', 'lastname', 'username', 'phoneNumber'],
      filters: { role: 'agent' },
    });
    setAgentOptions(
      data.data.map(agent => ({
        value: agent.id,
        label: `${agent.username} - ${agent.firstname} ${agent.lastname}`,
      }))
    );
  };

  // Fetch campaign types
  const loadCampaignTypes = async () => {
    const data = await fetchCampaignTypes({ page: 1, limit: 999999, searchField: ['name'] });
    setCampaignTypeOptions(
      data.data.map(type => ({ value: type.id, label: type.name }))
    );
  };

  // Fetch forms for optional form selection
  const loadForms = async () => {
    const data = await fetchForms({ page: 1, limit: 999999, searchField: ['name'] });
    setFormOptions(
      data.data.map(form => ({ value: form.id, label: form.name }))
    );
  };

  // Fetch processed data for the dropdown
  const loadCampaignData = async (campaignTypeId) => {
    
    const data = await fetchCampaignDataInfo(campaignTypeId); // Load by campaign type ID
    console.log(data)
    setProcessedDataOptions(
      data.map(campaignData => ({
        value: campaignData.id,
        label: campaignData.name,
      }))
    );
  };

  // Handle form submission to update campaign
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      name,
      description,
      status,
      agentIds: agents.map(agent => agent.value), // Convert selected agents to their UUIDs
      campaignTypeId: campaignTypeId?.value, // Selected campaign type
      formId: formId?.value, // Optional form ID
      processedDataIds: processedDataIds.map(data => data.value), // Optional processed data IDs
    };

    console.log(formData)

    try {
      await updateCampaign(campaignId, formData);
      toast.success('Campaign updated successfully', {
        position: 'top-right',
        autoClose: 5000,
        transition: Bounce,
      });
      navigate('/admin/view-campaign');
    } catch (error) {
      toast.error('Failed to update campaign', {
        position: 'top-right',
        autoClose: 5000,
        transition: Bounce,
      });
      console.error('Error updating campaign:', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Update Campaign</h2>
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
            onChange={(selectedOption) => {
                // Check if the selected option is different from the current campaignTypeId
                if (selectedOption?.value !== campaignTypeId?.value) {
                  setProcessedDataIds([]); // Reset processedDataIds to an empty array
                  setCampaignTypeId(selectedOption); // Update campaignTypeId with the selected option
                  loadCampaignData(selectedOption?.value)
                }
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

        {/* Processed Data (Optional) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Processed Data (Optional)</label>
          <Select
            isMulti
            options={processedDataOptions}
            value={processedDataIds}
            onChange={setProcessedDataIds}
            className="mt-1"
            placeholder="Select processed data"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded"
          >
            Update Campaign
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateCampaign;