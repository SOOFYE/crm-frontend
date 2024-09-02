import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { uploadCampaignData } from '../../services/dataService';
import { fetchCampaignTypes } from '../../services/campaignTypeService';

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [campaignTypeId, setCampaignTypeId] = useState('');
  const [duplicateFieldCheck, setDuplicateFieldCheck] = useState('');
  const [campaignTypes, setCampaignTypes] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(99999999); // You can adjust the limit as needed
  const [searchKey, setSearchKey] = useState('');
  const [orderBy] = useState('name');
  const [orderDirection] = useState('ASC');
  const navigate = useNavigate();

  useEffect(() => {
    loadCampaignTypes();
  }, [page, searchKey]);

  const loadCampaignTypes = async () => {
    let searchField = ['name']
    try {
      const data = await fetchCampaignTypes({ page, limit, searchKey, orderBy, orderDirection, searchField });
      console.log(data)
      setCampaignTypes(data.data.map((type) => ({
        value: type.id,
        label: type.name,
      })));
    } catch (error) {
      console.error('Error fetching campaign types:', error);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleCampaignTypeChange = (selectedOption) => {
    setCampaignTypeId(selectedOption.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('campaignTypeId', campaignTypeId);
    formData.append('duplicateFieldCheck', duplicateFieldCheck);

    try {
      await uploadCampaignData(formData);
      navigate('/admin/upload-data');
    } catch (error) {
      console.error('Error uploading campaign data:', error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Upload Campaign Data</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Campaign Type
          </label>
          <Select
            options={campaignTypes}
            onChange={handleCampaignTypeChange}
            className="mt-1"
            placeholder="Select Campaign Type"
            isSearchable
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Duplicate Field Check (Comma-separated)
          </label>
          <input
            type="text"
            value={duplicateFieldCheck}
            onChange={(e) => setDuplicateFieldCheck(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            File
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            className="mt-1 block w-full"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded"
        >
          Upload
        </button>
      </form>
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setPage(page > 1 ? page - 1 : 1)}
          className="bg-gray-300 text-gray-700 p-2 rounded"
        >
          Previous
        </button>
        <button
          onClick={() => setPage(page + 1)}
          className="bg-gray-300 text-gray-700 p-2 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default UploadForm;