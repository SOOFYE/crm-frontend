import React, { useState, useEffect, useRef } from 'react';
import { submitLead } from '../../services/leadService';
import { toast } from 'react-toastify';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const AgentFormPage = () => {
  const { campaignId, formId } = useParams();
  const [formData, setFormData] = useState({});
  const [files, setFiles] = useState({});
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [uploading, setUploading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;

  // Destructure state
  const matchedRecord = state?.matchedRecord;
  const form = state?.form;
  const processedDataId = state?.processedDataId;
  const campaignName = state?.campaignName;
  const phoneNumber = state?.phoneNumber;

  // File input refs
  const fileInputRefs = useRef({});

  useEffect(() => {
    if (!matchedRecord || !form) {
      toast.error('Invalid form data. Redirecting to leads page.');
      navigate(`/agent/leads`, { replace: true });
      return;
    }

    const prefilledFormData = {};
    form.fields.forEach((field) => {
      if (matchedRecord[field.label] !== undefined) {
        if (field.type === 'checkbox') {
          const selectedOptions = Array.isArray(matchedRecord[field.label])
            ? matchedRecord[field.label]
            : [matchedRecord[field.label]];
          prefilledFormData[field.label] = {
            selectedOptions: selectedOptions.filter(option => option.toLowerCase() !== 'other'),
            Other: selectedOptions.includes('Other') ? matchedRecord[`${field.label}_Other`] || '' : ''
          };
        } else if (field.type === 'radio') {
          prefilledFormData[field.label] = {
            selectedOptions: [matchedRecord[field.label]],
            Other: matchedRecord[`${field.label}_Other`] || ''
          };
        } else {
          prefilledFormData[field.label] = matchedRecord[field.label] || '';
        }
      } else {
        prefilledFormData[field.label] = (field.type === 'checkbox' || field.type === 'radio') 
          ? { selectedOptions: [], Other: '' }
          : '';
      }
    });

    setFormData(prefilledFormData);
  }, [form, matchedRecord, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked, files: fileInput } = e.target;

    if (type === 'checkbox') {
      setFormData((prevData) => {
        const fieldData = prevData[name] || { selectedOptions: [], Other: '' };
        let updatedOptions = [...fieldData.selectedOptions];

        if (checked) {
          updatedOptions.push(value);
        } else {
          updatedOptions = updatedOptions.filter((val) => val !== value);
        }

        return {
          ...prevData,
          [name]: {
            ...fieldData,
            selectedOptions: updatedOptions
          }
        };
      });
    } else if (type === 'radio') {
      setFormData({ ...formData, [name]: { selectedOptions: [value], Other: '' } });
    } else if (type === 'file') {
      setFiles((prevFiles) => ({
        ...prevFiles,
        [name]: fileInput[0],
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleOtherChange = (e) => {
    const { name, value } = e.target;
    const fieldLabel = name.replace('_Other', '');
    setFormData((prev) => ({
      ...prev,
      [fieldLabel]: {
        ...prev[fieldLabel],
        Other: value,
      }
    }));
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
      delete updatedFiles[fieldLabel];
      return updatedFiles;
    });
    if (fileInputRefs.current[fieldLabel]) {
      fileInputRefs.current[fieldLabel].value = ''; // Reset the file input field
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      // Validate "Other" inputs for checkbox and radio fields
      for (let field of form.fields) {
        if (['checkbox', 'radio'].includes(field.type) && field.options.includes('Other')) {
          const fieldData = formData[field.label];
          if (fieldData.selectedOptions.includes('Other') && (!fieldData.Other || fieldData.Other.trim() === '')) {
            toast.error(`Please specify the "${field.label}" in the "Other" option.`);
            setUploading(false);
            return;
          }
        }
      }

      // Validate product selection
      if (selectedProducts.length === 0) {
        toast.error('Please select at least one product/service.');
        setUploading(false);
        return;
      }

      // Create FormData for submission
      const leadData = new FormData();
      leadData.append('campaignId', campaignId);
      leadData.append('formId', formId);
      leadData.append('processedDataId', processedDataId);
      leadData.append('phoneNumberLead', phoneNumber);

      // Append all form fields
      form.fields.forEach((field) => {
        const fieldData = formData[field.label];
        if (['checkbox', 'radio'].includes(field.type)) {
          if (fieldData && fieldData.selectedOptions.length > 0) {
            fieldData.selectedOptions.forEach((option) => {
              if (option !== 'Other') {
                leadData.append(`${field.label}[selectedOptions][]`, option);
              }
            });
            leadData.append(`${field.label}[Other]`, fieldData.Other || '');
          } else {
            leadData.append(`${field.label}[selectedOptions][]`, '');
            leadData.append(`${field.label}[Other]`, '');
          }
        } else {
          leadData.append(field.label, formData[field.label] || '');
        }
      });

      // Append selected products
      selectedProducts.forEach((product) => {
        leadData.append('selectedProducts[]', product);
      });

      // Append files
      Object.keys(files).forEach((key) => {
        if (files[key]) {
          leadData.append(key, files[key]);
        }
      });

      console.log([...leadData])


    

      // Submit the form data and files
      await submitLead(leadData);
      toast.success('Form submitted successfully!');
      navigate('/agent/leads');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit the form.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-10">
      <h2 className="text-2xl font-bold text-center mb-6">
        Fill Out the Form - <span className="inline underline text-red-900">{campaignName}</span>
      </h2>

      <form onSubmit={handleSubmit}>
        {form.fields.map((field) => (
          <div key={field.label} className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>

            {field.type === 'text' && (
              <input
                type="text"
                name={field.label}
                value={formData[field.label] || ''}
                onChange={handleChange}
                required={field.required}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
                placeholder={`Enter ${field.label}`}
              />
            )}

            {field.type === 'textarea' && (
              <textarea
                name={field.label}
                value={formData[field.label] || ''}
                onChange={handleChange}
                required={field.required}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
                placeholder={`Enter ${field.label}`}
              ></textarea>
            )}

            {field.type === 'select' && (
              <select
                name={field.label}
                value={formData[field.label] || ''}
                onChange={handleChange}
                required={field.required}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
              >
                <option value="" disabled>
                  Select {field.label}
                </option>
                {field.options.map((option, idx) => (
                  <option key={idx} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}

            {field.type === 'radio' && (
              <div>
                {field.options.map((option, idx) => (
                  <label key={idx} className="inline-flex items-center mr-4">
                    <input
                      type="radio"
                      name={field.label}
                      value={option}
                      checked={formData[field.label]?.selectedOptions.includes(option) || false}
                      onChange={handleChange}
                      required={field.required}
                      className="mr-2"
                    />
                    {option}
                    {option.toLowerCase() === 'other' && formData[field.label]?.selectedOptions.includes('Other') && (
                      <input
                        type="text"
                        name={`${field.label}_Other`}
                        value={formData[field.label]?.Other || ''}
                        onChange={handleOtherChange}
                        required={field.required}
                        className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
                        placeholder={`Please specify ${field.label}`}
                      />
                    )}
                  </label>
                ))}
              </div>
            )}

            {field.type === 'checkbox' && (
              <div>
                {field.options.map((option, idx) => (
                  <div key={idx} className="inline-flex items-center mr-4">
                    <input
                      type="checkbox"
                      name={field.label}
                      value={option}
                      checked={formData[field.label]?.selectedOptions.includes(option) || false}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    {option}
                    {option.toLowerCase() === 'other' && formData[field.label]?.selectedOptions.includes('Other') && (
                      <input
                        type="text"
                        name={`${field.label}_Other`}
                        value={formData[field.label]?.Other || ''}
                        onChange={handleOtherChange}
                        required={field.required}
                        className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
                        placeholder={`Please specify ${field.label}`}
                      />
                    )}
                  </div>
                ))}
              </div>
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
            {uploading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AgentFormPage;
