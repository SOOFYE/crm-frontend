import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLeadById } from '../../services/leadService';
import { getSignedUrl } from '../../services/signedUrlService';
import moment from 'moment';

function ViewSingleLead() {
  const { leadId } = useParams(); // Get lead ID from URL
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // For navigation

  useEffect(() => {
    // Fetch lead data by ID when component mounts
    const fetchLead = async () => {
      try {
        const response = await getLeadById(leadId); // Fetch lead data
        console.log(response)
        setLead(response); // Set lead data
      } catch (error) {
        console.error('Error fetching lead:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [leadId]);

  // Helper function to detect if URL is from an S3 bucket
  const isS3Url = (url) => {
    const regex = /s3\.[\w-]+\.amazonaws\.com/;
    return regex.test(url);
  };

  // Function to handle downloading files from S3
  const handleDownload = async (s3Url) => {
    try {
      const response = await getSignedUrl(s3Url);
      window.open(response, '_blank'); // Open the signed URL to initiate the download
    } catch (error) {
      console.error('Error generating signed URL:', error);
    }
  };

  // Calculate total revenue from selected products
  const calculateTotalRevenue = () => {
    if (!lead || !lead.form || !lead.form.productsAndPrices || !lead.selectedProducts) return '0.00';
    return lead.form.productsAndPrices
      .filter(product => lead.selectedProducts.includes(product.name))
      .reduce((total, product) => total + parseFloat(product.price), 0)
      .toFixed(2);
  };

  // Render products and prices
  const renderProducts = () => {
    if (!lead || !lead.form || !lead.form.productsAndPrices) return null;
  
    return lead.form.productsAndPrices.map((product, index) => {
      const isSelected = lead.selectedProducts.includes(product.name);
      return (
        <div key={index} className="p-4 bg-white rounded-lg shadow-md mb-4">
          <p className="text-lg text-gray-700">
            {product.name}:{" "}
            <span className={isSelected ? "text-green-700" : "text-gray-500"}>
              ${parseFloat(product.price).toFixed(2)}
            </span>
            {isSelected && (
              <span className="text-blue-600 ml-2">(Selected)</span>
            )}
          </p>
        </div>
      );
    });
  };

  if (loading) {
    return <p>Loading lead details...</p>;
  }

  if (!lead) {
    return <p>No lead data found.</p>;
  }

  // Navigate to edit page
  const handleEdit = () => {
    navigate(`/admin/edit-lead/${lead.id}`);
  };

  const renderFormField = (label, value, fieldType) => {
    if (typeof value === 'object' && value !== null) {
      let { selectedOptions, Other } = value;
  
      // Ensure selectedOptions is an array
      selectedOptions = Array.isArray(selectedOptions) ? selectedOptions : [];
  
      return (
        <div key={label} className="p-4 bg-white rounded-lg shadow-md mb-4">
          <strong className="block text-lg text-gray-700">{label}:</strong>
          <ul className="list-disc list-inside mt-2">
            {/* Show options if there are any, excluding "Other" */}
            {selectedOptions.length > 0 && selectedOptions.some(option => option !== 'Other') ? (
              selectedOptions.map((option, idx) => (
                option !== 'Other' ? <li key={idx}>{option}</li> : null
              ))
            ) : (
              // Show "No options selected" only if "Other" is also empty
              (!Other || !Other.trim()) && <li>No options selected.</li>
            )}
          </ul>
  
          {/* Display "Other" if it has a value, even if selectedOptions is empty */}
          {Other && Other.trim() && (
            <p className="mt-2 text-gray-800">
              <strong>Other:</strong> {Other}
            </p>
          )}
        </div>
      );
    } else if (isS3Url(value)) {
      // Handle S3 URL for file downloads
      return (
        <div key={label} className="p-4 bg-white rounded-lg shadow-md mb-4">
          <strong className="block text-lg text-gray-700">{label}:</strong>
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            Download File
          </a>
        </div>
      );
    } else {
      // For non-object fields (like text, etc.)
      return (
        <div key={label} className="p-4 bg-white rounded-lg shadow-md mb-4">
          <strong className="block text-lg text-gray-700">{label}:</strong>
          <p className="block text-gray-800 mt-1">{value || '-'}</p>
        </div>
      );
    }
  };
  

  
  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-100 rounded-lg shadow-lg relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Lead Details</h1>
        <button
          onClick={handleEdit}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Edit
        </button>
      </div>

      {/* Basic Lead Information in Cards */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <div className="p-4 bg-white rounded-lg shadow-md">
          <p className="text-xl"><strong>Lead ID:</strong> {lead.id}</p>
          <p className="text-xl"><strong>Campaign:</strong> {lead.campaign?.name || 'N/A'}</p>
          <p className="text-xl"><strong>Agent Username:</strong> {lead.agent?.username || 'N/A'}</p>
          <p className="text-xl"><strong>Agent Full Name:</strong> {lead.agent?.firstname && lead.agent?.lastname ? `${lead.agent.firstname} ${lead.agent.lastname}` : 'N/A'}</p>
          <p className="text-xl"><strong>Status:</strong> {lead.status || 'N/A'}</p>
          <p className="text-xl"><strong>Created At:</strong> {moment(lead.createdAt).format('MMMM Do YYYY, h:mm:ss a')}</p>
        </div>

        {/* Show processed data download link */}
        {lead.processedData?.s3Url && (
          <div className="p-4 bg-white rounded-lg shadow-md">
            <p className="text-xl text-gray-700">
              <strong>Processed Data:</strong>
              <button
                onClick={() => handleDownload(lead.processedData.s3Url)}
                className="text-blue-500 underline ml-2"
              >
                Download Processed Data
              </button>
            </p>
          </div>
        )}
      </div>

      {/* Dynamic Form Data */}
      <h2 className="text-2xl font-semibold mb-4">Form Data</h2>
      <div className="grid grid-cols-1 gap-1">
        {lead.form && lead.form.fields && lead.form.fields.map((field, index) => {
          const label = field.label;
          const value = lead.formData[label];
          const fieldType = field.type;

          return renderFormField(label, value, fieldType);
        })}
      </div>

      {/* Product and Pricing Information */}
      <h2 className="text-2xl font-semibold mt-6">Products and Prices</h2>
      <div className="grid grid-cols-1 gap-6 max-h-64 overflow-y-auto">
        {renderProducts()}
      </div>

      {/* Total Revenue */}
      <div className="p-4 bg-white rounded-lg shadow-md mt-6">
        <p className="text-2xl font-semibold">Total Revenue: <span className="text-green-700">${lead.revenue}</span></p>
      </div>
    </div>
  );
}

export default ViewSingleLead;
