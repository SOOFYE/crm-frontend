import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchActiveCampaignsForAgent } from '../../services/campaignService'; // Import the service
import ManNotFound from '../../assets/svg/ManNotFound';

const ActiveCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]); // State for storing campaigns
  const [loading, setLoading] = useState(true);   // State to show loading state
  const [error, setError] = useState(null);       // State to store any error message
  const navigate = useNavigate();

  // Function to navigate to the form filling page
  const handleCampaignClick = (campaignId, formId) => {
    navigate(`/agent/campaign/${campaignId}/form/${formId}`);
  };

  // Fetch campaigns on component mount
  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const campaigns = await fetchActiveCampaignsForAgent();
        console.log(campaigns);
        if (campaigns.length === 0) {
          setError('No active campaigns.');
        } else {
          setCampaigns(campaigns);
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        setError('Failed to load active campaigns.');
      } finally {
        setLoading(false);
      }
    };

    loadCampaigns();
  }, []);

  // Display loading state
  if (loading) {
    return <p className="text-center text-gray-500">Loading active campaigns...</p>;
  }

  // Friendly message when no campaigns found
  if (error === 'No active campaigns.') {
    return (
      <div className="max-w-4xl mx-auto text-center py-12 px-4 sm:px-6 lg:px-8">
          <ManNotFound title='No Active Campaigns Available' desc='You are currently not part of any active campaigns. Please check back later or contact your administrator for further assistance.'/>
      </div>
    );
  }

  // Display error message if there's any other error
  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  // Display the campaigns
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold text-center mb-10">Your Active Campaigns</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="bg-white shadow-md rounded-lg p-6 cursor-pointer hover:bg-blue-50 transition duration-300"
            onClick={() => handleCampaignClick(campaign.id, campaign.form.id)}
          >
            <h3 className="text-xl font-bold text-blue-600 mb-2">{campaign.name}</h3>
            <p className="text-gray-700 mb-4">{campaign.description || 'No description available.'}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-green-500">Active</span>
              <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Fill Form
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveCampaigns;