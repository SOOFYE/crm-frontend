import React, {useEffect, useState} from 'react'
import { toast, Bounce } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { BsSearch } from 'react-icons/bs';
import { TABLEcustomStyles } from '../../styles/table-styles';
import { fetchFilteredData, fetchSingleCampaign, downloadFilteredData } from '../../services/campaignService';
import DataTable from 'react-data-table-component';
import Chip from '../../components/Chip';
import { AiOutlineDownload } from 'react-icons/ai'; // Import download icon
import { getSignedUrl } from '../../services/signedUrlService';

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

  // Function to generate search keys dynamically from the first entry in filteredData
  const generateSearchKeys = (data) => {
    if (data.length > 0) {
      // Extract keys from the first object in filteredData (this will act as keyof T[])
      return Object.keys(data[0]);
    }
    return [];
  };

  // Fetch the single campaign and its filtered data
  useEffect(() => {
    const loadCampaignData = async () => {
      try {
        const campaignResponse = await fetchSingleCampaign(campaignId); // Fetch the campaign data
        setCampaign(campaignResponse);

        // Fetch filtered data
        const filteredDataResponse = await fetchFilteredData(campaignId, {
          page,
          limit,
          searchKey: searchTerm,
          searchField: [], // Default empty array for now
          orderBy,
          orderDirection,
        });

        const data = filteredDataResponse.data || [];
        setFilteredData(data); // Assuming filtered data is in the `data` field
        setFilteredResults(data); // Set initial filtered results

        // Dynamically generate search fields based on the keys of the filtered data
        const searchKeys = generateSearchKeys(data);
        if (searchKeys.length > 0) {
          // Update filtered data with dynamic searchField keys
          const updatedFilteredData = await fetchFilteredData(campaignId, {
            page,
            limit,
            searchKey: searchTerm,
            searchField: searchKeys, // Use generated search keys
            orderBy,
            orderDirection,
          });
          setFilteredData(updatedFilteredData.data);
          setFilteredResults(updatedFilteredData.data);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching campaign data:', error);
        toast.error('Failed to load campaign data', {
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
        setLoading(false);
      }
    };

    loadCampaignData();
  }, [campaignId, page, limit, searchTerm, orderBy, orderDirection]);

  const handleDownloadFilteredData = async () => {
    try {
      const csvData = await downloadFilteredData(campaignId);

      // Create a URL for the blob data
      const url = window.URL.createObjectURL(new Blob([csvData]));

      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `filtered-data-${campaignId}.csv`); // Set the file name

      // Append the link to the document and trigger the download
      document.body.appendChild(link);
      link.click();

      // Clean up the link after the download
      document.body.removeChild(link);

      // Revoke the URL object to free up memory
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading filtered data:', error);
    }
  };

  // Dynamic column generation based on filteredData keys
  const generateColumns = () => {
    if (filteredData.length === 0) return [];

    // Use the keys from the first item in the filtered data array to generate column definitions
    return Object.keys(filteredData[0]).map((key) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize the first letter of the column name
      selector: (row) => row[key] || '-',
      sortable: true,
    }));
  };


  const handlePreprocessedDataDownload = async (s3Url)=>{

    try {
      const response = await getSignedUrl(s3Url);
      const signedUrl = response;
      window.open(signedUrl, '_blank'); // Open the signed URL to initiate the download
    } catch (error) {
      console.error('Error generating signed URL:', error);
    }

  }

  // Handle search functionality
  useEffect(() => {
    if (searchTerm) {
      const results = filteredData.filter(item =>
        Object.values(item).some(val => val && val.toString().toLowerCase().includes(searchTerm.toLowerCase()))
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
                campaign.agents.map((agent) => (
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
                <a
                  // href={campaign.processedData.s3Url}
                  onClick={() => handlePreprocessedDataDownload(campaign?.processedData?.s3Url)} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:cursor-pointer text-blue-500 underline"
                >
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
            <div className="flex items-center space-x-4">
              {/* Search Input */}
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
              {/* Download Button */}
              <button
                onClick={handleDownloadFilteredData}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
              >
                <AiOutlineDownload className="inline-block mr-2" /> Download Data
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
          <DataTable
            columns={generateColumns()} // Generate columns dynamically
            data={filteredResults}
            customStyles={TABLEcustomStyles}
            pagination
          />
          </div>
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