import React, { useState, useEffect, useRef } from 'react';
import { submitLead } from '../../services/leadService';
import { toast } from 'react-toastify';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const AgentFormPage = () => {
  const { campaignId, formId } = useParams();
  const [formData, setFormData] = useState({});
  const [files, setFiles] = useState({});
  const [selectedProducts, setSelectedProducts] = useState([]); // Track selected products
  const [uploading, setUploading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;

  let matchedRecord = state.matchedRecord;
  let form = state.form;
  let processedDataId = state.processedDataId;
  let campaignName = state.campaignName;
  let phoneNumber = state.phoneNumber

  // Refs to control file inputs
  const fileInputRefs = useRef({});

  useEffect(() => {
    const prefilledFormData = {};

    console.log(phoneNumber)

    if (!matchedRecord || !form) 
      
      navigate(`/agent/leads`, { replace: true });

   
    
    form.fields.forEach((field) => {
      if (matchedRecord[field.label] !== undefined) {
        if (field.type === 'checkbox' && typeof matchedRecord[field.label] === 'string') {
          prefilledFormData[field.label] = matchedRecord[field.label].split(',').map(item => item.trim());
        } else {
          prefilledFormData[field.label] = matchedRecord[field.label];
        }
      } else {
        prefilledFormData[field.label] = '';
      }
    });

    console.log(prefilledFormData)
    setFormData(prefilledFormData);
  }, [form.fields, matchedRecord]);

  const handleChange = (e) => {
    const { name, value, type, checked, files: fileInput } = e.target;

    if (type === 'checkbox') {
      setFormData((prevData) => ({
        ...prevData,
        [name]: prevData[name]
          ? checked
            ? [...prevData[name], value]
            : prevData[name].filter((val) => val !== value)
          : [value],
      }));
    } else if (type === 'file') {
      setFiles((prevFiles) => ({
        ...prevFiles,
        [name]: fileInput[0], // Store only the first file for each input
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleProductChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedProducts((prevProducts) => [...prevProducts, value]);
    } else {
      setSelectedProducts((prevProducts) => prevProducts.filter((product) => product !== value));
    }
  };

  const handleFileRemove = (fieldLabel) => {
    setFiles((prevFiles) => {
      const updatedFiles = { ...prevFiles };
      delete updatedFiles[fieldLabel]; // Remove the file from state
      return updatedFiles;
    });
    fileInputRefs.current[fieldLabel].value = ''; // Reset the file input field
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    // Create FormData for submission
    const leadData = new FormData();
    leadData.append('campaignId', campaignId);
    leadData.append('formId', formId);
    leadData.append('processedDataId', processedDataId);
    leadData.append('phoneNumberLead',formData[phoneNumber] || phoneNumber)

    // Append all form fields (text, radio, etc.)
    Object.keys(formData).forEach((key) => {
      if (Array.isArray(formData[key])) {
        formData[key].forEach((val) => leadData.append(`${key}[]`, val)); // Handle arrays (checkboxes)
      } else {
        leadData.append(key, formData[key]);
      }
    });

    if (selectedProducts.length === 0) {
      toast.error('Please select at least one product/service');
      setUploading(false);
      return;
    }

    // Append selected products
    selectedProducts.forEach((product) => {
      leadData.append('selectedProducts[]', product);
    });

    // Append files to FormData
    Object.keys(files).forEach((key) => {
      if (files[key]) {
        leadData.append(key, files[key]); // Append each file with its respective field name
      }
    });

    try {
      console.log([...leadData.entries()]); // Log FormData content for debugging
      await submitLead(leadData); // Submit the form data and files
      toast.success('Form submitted successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit the form');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-10">
      {/* Form Heading */}
      <h2 className="text-2xl font-bold text-center mb-6">
        Fill Out the Form - <div className="inline underline text-red-900">{campaignName}</div>
      </h2>

      <form onSubmit={handleSubmit}>
        {form.fields.map((field) => (
          <div key={field.label} className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
              {field.type === 'text' && (
                <input
                  type="text"
                  name={field.label}
                  value={formData[field.label] || ''}
                  onChange={handleChange}
                  required={field.required}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
                />
              )}
              {field.type === 'checkbox' && (
                field.options.map((option) => (
                  <label key={option} className="inline-flex items-center mr-4">
                    <input
                      type="checkbox"
                      name={field.label}
                      value={option}
                      checked={formData[field.label]?.includes(option) || false}
                      onChange={handleChange}
                      className="mr-2"
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
                      onChange={handleChange}
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))
              )}
              {field.type === 'file' && (
                <div className="flex items-center">
                  <input
                    ref={(ref) => (fileInputRefs.current[field.label] = ref)}
                    type="file"
                    name={field.label}
                    onChange={handleChange}
                    required={field.required}
                    className="mt-1 block w-full"
                  />
                  {files[field.label] && (
                    <button
                      type="button"
                      onClick={() => handleFileRemove(field.label)}
                      className="ml-4 bg-red-500 text-white p-1 rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </label>
          </div>
        ))}

        {/* Products/Services Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Products/Services</h3>
          {form.productsAndPrices && form.productsAndPrices.length > 0 ? (
            form.productsAndPrices.map((product) => (
              <label key={product.name} className="block">
                <input
                  type="checkbox"
                  value={product.name}
                  checked={selectedProducts.includes(product.name)}
                  onChange={handleProductChange}
                  className="mr-2"
                />
                {product.name}
              </label>
            ))
          ) : (
            <p className="text-gray-500">No products/services available.</p>
          )}
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AgentFormPage;