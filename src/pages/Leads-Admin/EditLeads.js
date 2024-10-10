import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLeadById, updateLead } from '../../services/leadService';
import { toast } from 'react-toastify';
import { getSignedUrl } from '../../services/signedUrlService';

const EditLeads = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [formData, setFormData] = useState({});
  const [files, setFiles] = useState({});
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRefs = useRef({});

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const response = await getLeadById(leadId);
        setLead(response);
        setFormData(response.formData);
        setSelectedProducts(response.selectedProducts || []);
      } catch (error) {
        console.error('Error fetching lead:', error);
        toast.error('Failed to load lead data');
      }
    };

    fetchLead();
  }, [leadId]);

  const isS3Url = (url) => {
    const regex = /s3\.[\w-]+\.amazonaws\.com/;
    return regex.test(url);
  };


  const handleDownload = async (s3Url) => {
    try {
      const response = await getSignedUrl(s3Url);
      window.open(response, '_blank'); // Open the signed URL to initiate the download
    } catch (error) {
      console.error('Error generating signed URL:', error);
    }
  };


  const handleInputChange = (e) => {
    const { name, value, type, checked, files: fileInput } = e.target;

    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: prev[name] ? (checked ? [...prev[name], value] : prev[name].filter((val) => val !== value)) : [value],
      }));
    } else if (type === 'radio') {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else if (type === 'file') {
      setFiles((prevFiles) => ({ ...prevFiles, [name]: fileInput[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleProductChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedProducts((prev) => [...prev, value]);
    } else {
      setSelectedProducts((prev) => prev.filter((product) => product !== value));
    }
  };

  const handleFileRemove = (fieldLabel) => {
    setFiles((prev) => {
      const updatedFiles = { ...prev };
      delete updatedFiles[fieldLabel];
      return updatedFiles;
    });
    fileInputRefs.current[fieldLabel].value = ''; // Clear the file input field
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    const leadData = new FormData();
    //leadData.append('leadId', leadId);

    // Add form data
    Object.keys(formData).forEach((key) => {
      if (Array.isArray(formData[key])) {
        formData[key].forEach((val) => leadData.append(`${key}[]`, val));
      } else {
        leadData.append(key, formData[key]);
      }
    });

    // Add selected products
    selectedProducts.forEach((product) => leadData.append('selectedProducts[]', product));

    // Append files
    Object.keys(files).forEach((key) => {
      if (files[key]) {
        leadData.append(key, files[key]);
      }
    });

    try {
      await updateLead(leadId, leadData);
      toast.success('Lead updated successfully!');
      navigate(`/admin/view-lead/${leadId}`);
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('Failed to update lead');
    } finally {
      setUploading(false);
    }
  };

  const renderFileInput = (fieldLabel, currentFileUrl) => (
    <div>
      {currentFileUrl && !files[fieldLabel] && (
        <p>
          {isS3Url(currentFileUrl) ? (
            <a onClick={() => handleDownload(currentFileUrl)} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
              View Current File
            </a>
          ) : (
            <a href={currentFileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
              View Current File
            </a>
          )}
        </p>
      )}
      <input
        ref={(ref) => (fileInputRefs.current[fieldLabel] = ref)}
        type="file"
        name={fieldLabel}
        onChange={handleInputChange}
      />
      {files[fieldLabel] && (
        <button
          type="button"
          onClick={() => handleFileRemove(fieldLabel)}
          className="ml-4 bg-red-500 text-white p-1 rounded hover:bg-red-600"
        >
          Remove New File
        </button>
      )}
      {!files[fieldLabel] && currentFileUrl && (
        <p className="mt-2 text-sm text-gray-500">Uploading a new file will replace the current one.</p>
      )}
    </div>
  );

  if (!lead) {
    return <p>Loading lead data...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Edit Lead</h1>
      <form onSubmit={handleSubmit}>
        {lead.form.fields.map((field) => (
          <div key={field.label} className="mb-4">
            <label className="block text-lg font-medium text-gray-700">{field.label}</label>
            {field.type === 'text' && (
              <input
                type="text"
                name={field.label}
                value={formData[field.label] || ''}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            )}
            {field.type === 'textarea' && (
              <textarea
                name={field.label}
                value={formData[field.label] || ''}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            )}
            {field.type === 'select' && (
              <select
                name={field.label}
                value={formData[field.label] || ''}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}
            {field.type === 'checkbox' && (
              field.options.map((option) => (
                <label key={option} className="inline-flex items-center mr-4">
                  <input
                    type="checkbox"
                    name={field.label}
                    value={option}
                    checked={formData[field.label]?.includes(option) || false}
                    onChange={handleInputChange}
                    className="form-checkbox"
                  />
                  {option}
                </label>
              ))
            )}
            {field.type === 'radio' && (
              field.options.map((option) => (
                <label key={option} className="inline-flex items-center mr-4">
                  <input
                    type="radio"
                    name={field.label}
                    value={option}
                    checked={formData[field.label] === option}
                    onChange={handleInputChange}
                    className="form-radio"
                  />
                  {option}
                </label>
              ))
            )}
            {field.type === 'file' && renderFileInput(field.label, formData[field.label])}
          </div>
        ))}

        {/* Products/Services Selection */}
        <h2 className="text-xl font-bold mb-4">Select Products/Services</h2>
        {lead.form.productsAndPrices?.map((product) => (
          <div key={product.name} className="mb-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                value={product.name}
                checked={selectedProducts.includes(product.name)}
                onChange={handleProductChange}
                className="form-checkbox"
              />
              <span className="ml-2">{product.name} (${product.price})</span>
            </label>
          </div>
        ))}

        {/* Submit Button */}
        <div className="mt-6">
          <button
            type="submit"
            className={`bg-blue-500 text-white px-4 py-2 rounded ${uploading ? 'opacity-50' : 'hover:bg-blue-600'}`}
            disabled={uploading}
          >
            {uploading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditLeads;
