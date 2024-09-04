import React, {useEffect, useState} from 'react'
import { toast, Bounce } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { BsSearch } from 'react-icons/bs';
import { customStyles } from '../../assets/table-styles';
import { fetchFilteredData, fetchSingleCampaign } from '../../services/campaignService';
import DataTable from 'react-data-table-component';
import Chip from '../../components/Chip';


function ViewSingleCampaign() {
    const { campaignId } = useParams(); // Get campaign ID from the URL
    const [campaign, setCampaign] = useState(null); // Campaign data
    const [filteredData, setFilteredData] = useState([]); // Filtered data array
    const [filteredResults, setFilteredResults] = useState([]); // Filtered data for the search
    const [searchTerm, setSearchTerm] = useState(''); // Search term
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [orderBy] = useState('createdAt');
    const [orderDirection] = useState('ASC');
    const navigate = useNavigate();
  
    // Fetch the single campaign and its filtered data
    useEffect(() => {
      const loadCampaignData = async () => {
        try {
          const campaignResponse = await fetchSingleCampaign(campaignId); // Fetch the campaign data
          setCampaign(campaignResponse);
          
          const filteredDataResponse = await fetchFilteredData(campaignId, { page, limit, searchKey: searchTerm, orderBy, orderDirection });
          setFilteredData(filteredDataResponse.data); // Assuming filtered data is in the `data` field
          setFilteredResults(filteredDataResponse.data); // Set initial filtered results
          setLoading(false);
        } catch (error) {
          console.error('Error fetching campaign data:', error);
          toast.error('Failed to load campaign data', {
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
          setLoading(false);
        }
      };
  
      loadCampaignData();
    }, [campaignId, page, limit, searchTerm, orderBy, orderDirection]);
  
    // Dynamic column generation based on filteredData keys
    const generateColumns = () => {
      if (filteredData.length === 0) return [];
  
      // Use the keys from the first item in the filtered data array to generate column definitions
      return Object.keys(filteredData[0]).map(key => ({
        name: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize the first letter of the column name
        selector: row => row[key] || '-',
        sortable: true,
      }));
    };
  
    // Handle search functionality
    useEffect(() => {
      if (searchTerm) {
        const results = filteredData.filter(item =>
          Object.values(item).some(val => val.toString().toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredResults(results);
      } else {
        setFilteredResults(filteredData);
      }
    }, [searchTerm, filteredData]);
  
    return (
      <div className="p-8 max-w-7xl mx-auto bg-gray-50 shadow-md rounded-md">
        {campaign && (
          <>
            {/* Campaign Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Name Card */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-2 text-gray-800">{campaign.name}</h2>
                <p className="text-sm text-gray-600">Campaign Name</p>
              </div>
  
              {/* Status Card */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-2">
                  <Chip color={campaign.status === 'active' ? 'success' : 'warning'} status={campaign.status} />
                </h2>
                <p className="text-sm text-gray-600">Campaign Status</p>
              </div>
  
              {/* Type Card */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-2 text-gray-800">{campaign.campaignType?.name || 'Unknown'}</h2>
                <p className="text-sm text-gray-600">Campaign Type</p>
              </div>
            </div>
  
            {/* Assigned Agents */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Assigned Agents</h3>
              <div className="flex flex-wrap gap-2">
                {campaign.agents && campaign.agents.length > 0 ? (
                  campaign.agents.map(agent => (
                    <span key={agent.id} className="text-lg font-semibold text-white bg-blue-500 py-1 px-3 rounded-full">
                      {`${agent.firstname} ${agent.lastname}`}
                    </span>
                  ))
                ) : (
                  <p className="text-lg text-gray-800">No agents assigned.</p>
                )}
              </div>
            </div>
  
            {/* Processed Data */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Processed Data</h3>
              {campaign.processedData ? (
                <div className="text-lg text-gray-800">
                  <p className="font-semibold">Name: {campaign.processedData.name}</p>
                  <a href={campaign.processedData.s3Url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                    Download
                  </a>
                </div>
              ) : (
                <p className="text-lg text-gray-800">No processed data available.</p>
              )}
            </div>
          </>
        )}
  
        {/* Filtered Data Section */}
        {!loading && filteredData.length > 0 ? (
          <>
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Filtered Data</h2>
              <div className="flex items-center space-x-2">
                <BsSearch className="text-gray-500" />
                <input
                  type="text"
                  placeholder="Search data..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <DataTable
              columns={generateColumns()} // Generate columns dynamically
              data={filteredResults}
              customStyles={customStyles}
              pagination
            />
          </>
        ) : !loading && (
          <div className="text-center mt-8">
            <p className="text-lg text-gray-600 mb-4">No filtered data available for this campaign.</p>
            <button
              onClick={() => navigate('/path/to/other-page')}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
            >
              Add Filtered Data
            </button>
          </div>
        )}
      </div>
    );
  }
  
  export default ViewSingleCampaign;