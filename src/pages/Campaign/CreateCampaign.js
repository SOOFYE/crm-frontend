import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import { createCampaign } from '../../services/campaignService';
import { fetchCampaignTypes } from '../../services/campaignTypeService';
import { fetchUsers } from '../../services/usersService';
import { CampaignStatusEnum } from '../../common/CampaignStatusEnum';
import { toast, Bounce } from 'react-toastify';

const CreateCampaign = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('');
    const [agents, setAgents] = useState([]);
    const [campaignTypeId, setCampaignTypeId] = useState(null);
    const [filterField, setFilterField] = useState([]);
    const [fileCriteria, setFileCriteria] = useState(null);
    const [agentOptions, setAgentOptions] = useState([]);
    const [campaignTypeOptions, setCampaignTypeOptions] = useState([]);
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
        filters: {
          role: 'agent',
        }
      });
      const agents = data.data;
      setAgentOptions(agents.map(agent => ({ value: agent.id, label: `${agent.username} - ${agent.firstname} ${agent.lastname}` })));
    };
  
    const loadCampaignTypes = async () => {
      const data = await fetchCampaignTypes({ page: 1, limit: 999999, searchField: ['name'] });
      setCampaignTypeOptions(data.data.map(type => ({ value: type.id, label: type.name })));
    };
  
    const handleFileChange = (e) => {
      setFileCriteria(e.target.files[0]);
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();


      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('status', status);
      agents.forEach(agent => formData.append('agents[]', agent.value));
      formData.append('campaignTypeId', campaignTypeId?.value);
      formData.append('filterField', JSON.stringify(filterField)); // Convert array to JSON string
      formData.append('fileCriteria', fileCriteria);
  
      setTimeout(() => {
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
          }
      }, 10000);
    

      try {
        await createCampaign(formData);
        toast.success('Campaign created successfully', {
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
        navigate('/admin/view-campaign');
      } catch (error) {
        toast.error('Failed to create campaign ', {
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
        console.error('Error creating campaign:', error);
      }
    };
  
    return (
      <div className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Create New Campaign</h2>
        <form onSubmit={handleSubmit}>
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
  
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            />
          </div>
  
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
  
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Filter Fields (Comma-separated)</label>
            <input
              type="text"
              value={filterField}
              onChange={(e) => setFilterField(e.target.value.split(','))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
              placeholder="e.g. field1,field2"
              required
            />
          </div>
  
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Filter Criteria File</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="mt-1 block w-full"
              required
            />
          </div>
  
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