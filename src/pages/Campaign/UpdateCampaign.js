import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchSingleCampaign, updateCampaign } from '../../services/campaignService';
import { fetchCampaignTypes } from '../../services/campaignTypeService';
import { fetchUsers } from '../../services/usersService';
import { CampaignStatusEnum } from '../../common/CampaignStatusEnum';
import { toast, Bounce } from 'react-toastify';
import Papa from 'papaparse'; // To parse CSV files

const UpdateCampaign = () => {
    const [campaign, setCampaign] = useState(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('');
    const [agents, setAgents] = useState([]);
    const [campaignTypeId, setCampaignTypeId] = useState(null);
    const [filterField, setFilterField] = useState(''); // Comma-separated input
    const [fileCriteria, setFileCriteria] = useState(null); // CSV file
    const [csvHeaders, setCsvHeaders] = useState([]); // Store the CSV headers after parsing
    const [additionalFields, setAdditionalFields] = useState([]); // Store the additional fields for agents
    const [agentOptions, setAgentOptions] = useState([]);
    const [campaignTypeOptions, setCampaignTypeOptions] = useState([]);
    const { campaignId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        loadCampaign();
        loadAgents();
        loadCampaignTypes();
    }, [campaignId]);

    const loadCampaign = async () => {
        const data = await fetchSingleCampaign(campaignId);
        console.log(data)
        setCampaign(data);
        setName(data.name);
        setDescription(data.description);
        setStatus(data.status);
        setAgents(data.agents.map(agent => ({ value: agent.id, label: `${agent.username} - ${agent.firstname} ${agent.lastname}` })));
        setCampaignTypeId({ value: data.campaignType.id, label: data.campaignType.name });
        setFilterField(data.filterField ? data.filterField.join(',') : ''); // Set filterField as a comma-separated string
        setAdditionalFields( JSON.parse(data.additionalFields) || []); // Set additionalFields if they exist

        if (data.processedData !== null) {
            toast.info('Cannot change some fields since data is linked to this campaign.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "light",
            });
        }
    };

    const loadAgents = async () => {
        const data = await fetchUsers({
            page: 1,
            limit: 999999,
            searchField: ['firstname', 'lastname', 'username', 'phoneNumber'],
            filters: {
                role: 'agent',
            },
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
                setCsvHeaders(headers); // Set the headers for later validation
            },
            header: false // We just need to read raw rows for headers
        });
    };

    const handleFieldChange = (index, field, value) => {
        const updatedFields = [...additionalFields];
        updatedFields[index][field] = value;
        setAdditionalFields(updatedFields);
    };

    const handleAddField = () => {
        setAdditionalFields([...additionalFields, { name: '', type: '' }]);
    };

    const handleRemoveField = (index) => {
        const updatedFields = [...additionalFields];
        updatedFields.splice(index, 1);
        setAdditionalFields(updatedFields);
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
        } else {
            // If no file is uploaded, validate the filterField against the existing filterCriteria
            if (campaign?.filterCriteria) {
                const filterCriteriaKeys = Object.keys(campaign.filterCriteria);

                // Check if all filterField values are present in the filterCriteriaKeys
                const missingKeys = filterFieldArray.filter(field => !filterCriteriaKeys.includes(field));

                if (missingKeys.length > 0) {
                    toast.error(`The following fields are missing in the existing filter criteria: ${missingKeys.join(', ')}`, {
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
                    return; // Stop form submission if validation fails
                }
            }
        }

        if (filterFieldArray.length > 0) {
            formData.append('filterField', filterField);
        }

        // If a file is uploaded, append it to the formData
        if (fileCriteria) formData.append('fileCriteria', fileCriteria);

        // Append additionalFields to the formData as JSON string if present
        if (additionalFields.length > 0) {
            formData.append('additionalFields', JSON.stringify(additionalFields));
        }

        try {
            await updateCampaign(campaignId, formData);
            toast.success('Campaign updated successfully', {
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
            toast.error('Failed to update campaign', {
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
            console.error('Error updating campaign:', error);
        }
    };

    const isPreprocessedDataLinked = campaign?.preprocessedData !== null;

    return (
        <div className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Update Campaign</h2>
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
                        isDisabled={isPreprocessedDataLinked} // Disable if preprocessed data is linked
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Filter Fields (Comma-separated)</label>
                    <input
                        type="text"
                        value={filterField}
                        onChange={(e) => setFilterField(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
                        placeholder="e.g. zipcode, state"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Filter Criteria File (Optional)</label>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="mt-1 block w-full"
                        disabled={!filterField} // Disable file input if filterField is empty
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