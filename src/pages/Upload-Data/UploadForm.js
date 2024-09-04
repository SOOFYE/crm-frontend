import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { uploadCampaignData } from '../../services/dataService';
import { fetchCampaignTypes } from '../../services/campaignTypeService';
import { toast, Bounce } from 'react-toastify';

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [campaignTypeId, setCampaignTypeId] = useState('');
  const [duplicateFieldCheck, setDuplicateFieldCheck] = useState('');
  const [campaignTypes, setCampaignTypes] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(99999999); // Adjust the limit as needed
  const [searchKey, setSearchKey] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadCampaignTypes();
  }, [page, searchKey]);

  const loadCampaignTypes = async () => {
    try {
      const data = await fetchCampaignTypes({ page, limit, searchKey, searchField: ['name'] });
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

  const handleInputChange = (inputValue) => {
    setSearchKey(inputValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('campaignTypeId', campaignTypeId);
    formData.append('duplicateFieldCheck', duplicateFieldCheck);


    try {
      await uploadCampaignData(formData);
      toast.success('Campaign data uploaded successfully', {
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
      navigate('/admin/upload-data');
    } catch (error) {
      toast.error('Failed to upload data', {
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
      console.error('Error uploading campaign data:', error);
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-md max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Upload Campaign Data</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Campaign Type
          </label>
          <Select
            options={campaignTypes}
            onChange={handleCampaignTypeChange}
            onInputChange={handleInputChange} // Handle input changes for search
            className="mt-1"
            placeholder="Select Campaign Type"
            isSearchable
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Specify the fields you want to check for duplicates. This will help prevent errors and ensure data integrity.
          </label>
          <input
            type="text"
            value={duplicateFieldCheck}
            onChange={(e) => setDuplicateFieldCheck(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            placeholder="e.g., field1, field2"
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
          className="bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600"
        >
          Upload
        </button>
      </form>
    </div>
  );
};

export default UploadForm;
