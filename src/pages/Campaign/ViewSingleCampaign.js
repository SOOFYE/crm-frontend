import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchSingleCampaign } from '../../services/campaignService'; // Assume this service fetches campaign data
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faLink, faCopy } from '@fortawesome/free-solid-svg-icons';
import { toast, Bounce } from 'react-toastify';

const ViewSingleCampaign = () => {
  const { campaignId } = useParams(); // Campaign ID from URL
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [agentFormLink, setAgentFormLink] = useState('');

  useEffect(() => {
    loadCampaign();
  }, [campaignId]);

  // Fetch the campaign details
  const loadCampaign = async () => {
    try {
      const data = await fetchSingleCampaign(campaignId);
      setCampaign(data);

      // Generate the shareable link for agents
      if (data.form && data.id) {
        const shareableLink = `${window.location.origin}/agent/form/${data.id}/${data.form.id}`;
        setAgentFormLink(shareableLink);
      }
    } catch (error) {
      console.error('Failed to load campaign', error);
      toast.error('Failed to load campaign details', {
        position: 'top-right',
        autoClose: 5000,
        transition: Bounce,
      });
    }
  };

  // Navigate to the form view
  const navigateToForm = (formId) => {
    navigate(`/admin/view-single-form/${formId}`);
  };

  // Navigate to edit page
  const navigateToEdit = () => {
    navigate(`/admin/edit-campaign/${campaignId}`);
  };

  // Copy the shareable link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(agentFormLink);
    toast.success('Link copied to clipboard!', {
      position: 'top-right',
      autoClose: 3000,
      transition: Bounce,
    });
  };

  if (!campaign) {
    return <p>Loading campaign details...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">{campaign.name}</h2>
        <button
          onClick={navigateToEdit}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          <FontAwesomeIcon icon={faEdit} /> Edit Campaign
        </button>
      </div>

      {/* Campaign Description */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-700">Description</h3>
        <p className="text-gray-600">{campaign.description || 'No description provided.'}</p>
      </div>

      {/* Campaign Status */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-700">Status</h3>
        <p className={`text-lg ${campaign.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>
          {campaign.status}
        </p>
      </div>

      {/* Form Link */}
      {campaign.form && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-700">Form</h3>
          <button
            onClick={() => navigateToForm(campaign.form.id)}
            className="text-blue-500 hover:underline flex items-center"
          >
            <FontAwesomeIcon icon={faLink} className="mr-2" />
            View Linked Form: {campaign.form.name}
          </button>
        </div>
      )}

      {/* Assigned Agents */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-700">Assigned Agents</h3>
        {campaign.agents.length > 0 ? (
          <ul className="list-disc pl-5">
            {campaign.agents.map((agent) => (
              <li key={agent.id} className="text-gray-700">
                {agent.username} ({agent.firstname} {agent.lastname})
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No agents assigned.</p>
        )}
      </div>

      {/* Preprocessed Data */}
      {campaign.processedData && campaign.processedData.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700">Preprocessed Data</h3>
          <ul className="list-disc pl-5">
            {campaign.processedData.map((data) => (
              <li key={data.id} className="text-gray-700">
                <a href={data.s3Url} download className="text-blue-500 hover:underline">
                  {data.name} (Download)
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Agent Shareable Link */}
      {agentFormLink && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700">Shareable Link for Agents</h3>
          <div className="flex items-center">
            <input
              type="text"
              value={agentFormLink}
              readOnly
              className="border border-gray-300 px-3 py-2 rounded-l w-full"
            />
            <button
              onClick={copyToClipboard}
              className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 flex items-center"
            >
              <FontAwesomeIcon icon={faCopy} className="mr-2" />
              Copy Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewSingleCampaign;
