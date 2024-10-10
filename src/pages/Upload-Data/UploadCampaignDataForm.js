import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { uploadCampaignData } from '../../services/originalDataService';
import { fetchCampaignTypes } from '../../services/campaignTypeService';
import Papa from 'papaparse'; // For CSV parsing
import { toast, Bounce } from 'react-toastify';
import { FaQuestionCircle } from 'react-icons/fa';
import { Tooltip as ReactTooltip } from 'react-tooltip';

const UploadCampaignDataForm = () => {
  const [dataFile, setDataFile] = useState(null);
  const [filteringCriteriaFile, setFilteringCriteriaFile] = useState(null); // Filtering criteria file (optional)
  const [campaignTypeId, setCampaignTypeId] = useState('');
  const [duplicateFieldCheck, setDuplicateFieldCheck] = useState([]);
  const [campaignTypes, setCampaignTypes] = useState([]);
  const [requiredFields, setRequiredFields] = useState([]); // Store required fields from campaign type
  const [includeExclude, setIncludeExclude] = useState('include'); // Radio button for include/exclude
  const [page, setPage] = useState(1);
  const [limit] = useState(99999999);
  const [searchKey, setSearchKey] = useState('');
  const [csvHeaders, setCsvHeaders] = useState([]); // Store the headers from the data CSV file
  const [filteringHeaders, setFilteringHeaders] = useState([]); // Store the headers from the filtering criteria CSV file
  const [isDuplicateFieldEnabled, setIsDuplicateFieldEnabled] = useState(false); // Disable duplicate field input until file upload
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Refs for file inputs to reset them
  const dataFileInputRef = useRef(null);
  const filteringFileInputRef = useRef(null);

  useEffect(() => {
    loadCampaignTypes();
  }, [page, searchKey]);

  const loadCampaignTypes = async () => {
    try {
      const data = await fetchCampaignTypes({ page, limit, searchKey, searchField: ['name'] });
      setCampaignTypes(
        data.data.map((type) => ({
          value: type.id,
          label: type.name,
          requiredFields: type.requiredFields, // Include required fields
        }))
      );
    } catch (error) {
      console.error('Error fetching campaign types:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setDataFile(file);

    // Parse the CSV to extract headers
    Papa.parse(file, {
      complete: (results) => {
        setCsvHeaders(results.data[0]); // Store the headers from the data CSV
        setIsDuplicateFieldEnabled(true); // Enable duplicate field check after file upload
      },
      header: false,
    });
  };

  const handleFilteringCriteriaChange = (e) => {
    const file = e.target.files[0];
    setFilteringCriteriaFile(file);

    // Parse the CSV to extract headers
    Papa.parse(file, {
      complete: (results) => {
        setFilteringHeaders(results.data[0]); // Store the headers from the filtering criteria CSV
      },
      header: false,
    });
  };

  const handleRemoveFile = (type) => {
    if (type === 'data') {
      setDataFile(null); // Remove data file
      setCsvHeaders([]); // Clear CSV headers
      setIsDuplicateFieldEnabled(false); // Disable duplicate field check
      dataFileInputRef.current.value = ''; // Reset input field
    } else if (type === 'filtering') {
      setFilteringCriteriaFile(null); // Remove filtering criteria file
      setFilteringHeaders([]); // Clear filtering headers
      filteringFileInputRef.current.value = ''; // Reset input field
    }
  };

  const handleCampaignTypeChange = (selectedOption) => {
    setCampaignTypeId(selectedOption.value);
    setRequiredFields(selectedOption.requiredFields); // Update required fields from the campaign type
  };

  const handleInputChange = (inputValue) => {
    setSearchKey(inputValue);
  };

  const handleIncludeExcludeChange = (e) => {
    setIncludeExclude(e.target.value);
  };

  const validateCsvHeaders = () => {
    // Validate if the required fields exist in the CSV headers
    const missingFields = requiredFields.filter((field) => !csvHeaders.includes(field));
    if (missingFields.length > 0) {
      toast.error(`Missing required fields in the data CSV: ${missingFields.join(', ')}`, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
        transition: Bounce,
      });
      return false;
    }

    // If filtering criteria file is provided, validate its headers
    if (filteringCriteriaFile && filteringHeaders.length > 0) {
      const missingCriteriaHeaders = filteringHeaders.filter((header) => !csvHeaders.includes(header));
      if (missingCriteriaHeaders.length > 0) {
        toast.error(`Missing filtering criteria headers in the data CSV: ${missingCriteriaHeaders.join(', ')}`, {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'light',
          transition: Bounce,
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    if (!validateCsvHeaders()) {
      setIsSubmitting(false);
      return; // Stop form submission if validation fails
    }

    const formData = new FormData();
    formData.append('originalData', dataFile);
    if (filteringCriteriaFile) formData.append('filteringCriteria', filteringCriteriaFile); // Optional filtering criteria
    formData.append('campaignTypeId', campaignTypeId);
    formData.append('duplicateFieldCheck', duplicateFieldCheck.map((option) => option.value)); // Send as comma-separated values
    formData.append('filteringIncludeOrExclude', includeExclude); // Include the include/exclude option

    try {
      await uploadCampaignData(formData);
      toast.success('Campaign data uploaded successfully', {
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
      navigate('/admin/upload-data');
    } catch (error) {
      toast.error('Failed to upload data', {
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

      console.error('Error uploading campaign data:', error);
    } finally {
      setIsSubmitting(false); // Reset submitting state after form submission completes
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-md max-w-3xl mx-auto">
      <ReactTooltip place="bottom" id="FaQCircleUploadData" />

      <h1 className="text-2xl font-bold mb-6">Upload Campaign Data</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Campaign Type</label>
          <Select
            options={campaignTypes}
            onChange={handleCampaignTypeChange}
            onInputChange={handleInputChange}
            className="mt-1"
            placeholder="Select Campaign Type"
            isSearchable
            required
          />
        </div>

        {/* File Upload for Data File */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Data File
            <FaQuestionCircle
              className="inline mx-2"
              data-tooltip-id="FaQCircleUploadData"
              data-tooltip-content={`Required Fields: ${requiredFields.length > 0 ? requiredFields.join(', ') : 'None'}`}
              size={12}
              color="gray"
            />
          </label>
          <div className="flex items-center">
            <input
              ref={dataFileInputRef}
              type="file"
              onChange={handleFileChange}
              className="mt-1 block w-full"
              disabled={!campaignTypeId} // Disable file upload until campaign type is selected
              required
            />
            {dataFile && (
              <button
                type="button"
                onClick={() => handleRemoveFile('data')}
                className="ml-4 bg-red-500 text-white p-1 rounded hover:bg-red-600"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {/* Duplicate Field Check */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Specify the fields you want to check for duplicates:
          </label>
          <Select
            isMulti
            options={csvHeaders.map((header) => ({ value: header, label: header }))}
            onChange={setDuplicateFieldCheck}
            isDisabled={!isDuplicateFieldEnabled} // Enable only after data file upload
            className="mt-1"
            placeholder="Select fields"
            required
          />
        </div>

        {/* Filtering Criteria File Upload (Optional) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Filtering Criteria File (Optional)</label>
          <div className="flex items-center">
            <input
              ref={filteringFileInputRef}
              type="file"
              onChange={handleFilteringCriteriaChange}
              className="mt-1 block w-full"
            />
            {filteringCriteriaFile && (
              <button
                type="button"
                onClick={() => handleRemoveFile('filtering')}
                className="ml-4 bg-red-500 text-white p-1 rounded hover:bg-red-600"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {/* Radio Buttons for Include/Exclude */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Apply filtering criteria to:</label>
          <div className="flex items-center mb-2">
            <input
              type="radio"
              name="includeExclude"
              value="include"
              checked={includeExclude === 'include'}
              onChange={handleIncludeExcludeChange}
              className="mr-2"
            />
            <label className="text-gray-700">Include</label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              name="includeExclude"
              value="exclude"
              checked={includeExclude === 'exclude'}
              onChange={handleIncludeExcludeChange}
              className="mr-2"
            />
            <label className="text-gray-700">Exclude</label>
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600"
          disabled={isSubmitting} // Disable the button when submitting
        >
          {isSubmitting ? 'Uploading...' : 'Upload'} {/* Update button text */}
        </button>
      </form>
    </div>
  );
};

export default UploadCampaignDataForm;
