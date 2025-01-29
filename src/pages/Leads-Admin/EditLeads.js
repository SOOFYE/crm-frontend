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

      // Access the nested formData and transform it
      const transformedFormData = { ...response.formData };

      response.form.fields.forEach((field) => {
        const fieldData = transformedFormData[field.label] || null; // Ensure fieldData is an object

        if (['checkbox', 'radio'].includes(field.type)) {
          transformedFormData[field.label] = {
            selectedOptions: Array.isArray(fieldData?.selectedOptions)
              ? fieldData.selectedOptions
              : [fieldData?.selectedOptions || ''].filter(Boolean),
            Other: fieldData?.Other || '',
          };

          // If "Other" has a value, make sure "Other" is in selectedOptions
          if (fieldData?.Other) {
            transformedFormData[field.label].selectedOptions.push('Other');
          }
        } else {
          transformedFormData[field.label] = fieldData || '';
        }
      });

      setFormData(transformedFormData);
      setSelectedProducts(response.selectedProducts || []);
    } catch (error) {
      console.error('Error fetching lead:', error);
      toast.error('Failed to load lead data');
    }
  };

  fetchLead();
}, [leadId]);


  const handleInputChange = (e, fieldType, fieldLabel) => {
    const { name, type, files: fileInput, value, checked } = e.target;

    if (type === 'file') {
      setFiles((prevFiles) => ({
        ...prevFiles,
        [name]: fileInput[0] // Assuming single file upload, handle multiple if necessary
      }));
    } else if (type === 'checkbox') {
      // Checkbox logic
      setFormData((prev) => {
        const prevOptions = prev[name]?.selectedOptions || [];
        let updatedOptions;
        if (checked) {
          updatedOptions = [...prevOptions, value];
        } else {
          updatedOptions = prevOptions.filter((val) => val !== value);
        }
        return {
          ...prev,
          [name]: {
            ...prev[name],
            selectedOptions: updatedOptions,
            Other: prev[name]?.Other || '',
          },
        };
      });
    } else if (type === 'radio') {
      // Radio button logic
      setFormData((prev) => ({
        ...prev,
        [name]: {
          selectedOptions: [value],
          Other: value === 'Other' ? prev[name]?.Other || '' : '',
        },
      }));
    } else {
      // Text, textarea
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleOtherInputChange = (e, fieldLabel) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [fieldLabel]: {
        ...prev[fieldLabel],
        Other: value,
      },
    }));
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
    if (fileInputRefs.current[fieldLabel]) {
      fileInputRefs.current[fieldLabel].value = ''; // Clear the file input field
    }
  };

  // Recursive function to build FormData from nested objects
  const buildFormData = (formData, data, parentKey) => {
    if (data && typeof data === 'object' && !(data instanceof File)) {
      if (Array.isArray(data)) {
        data.forEach((value, index) => {
          buildFormData(formData, value, `${parentKey}[${index}]`);
        });
      } else {
        Object.keys(data).forEach((key) => {
          buildFormData(formData, data[key], parentKey ? `${parentKey}[${key}]` : key);
        });
      }
    } else {
      const value = data == null ? '' : data;
      formData.append(parentKey, value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      // Validate "Other" inputs
      for (let field of lead.form.fields) {
        if (['checkbox', 'radio'].includes(field.type) && field.options.includes('Other')) {
          const fieldData = formData[field.label];
          if (
            fieldData &&
            Array.isArray(fieldData.selectedOptions) &&
            fieldData.selectedOptions.includes('Other') &&
            (!fieldData.Other || fieldData.Other.trim() === '')
          ) {
            toast.error(`Please specify the "${field.label}" in the "Other" option.`);
            setUploading(false);
            return;
          }
        }
      }

      // Validate selected products
      if (selectedProducts.length === 0) {
        toast.error('Please select at least one product/service.');
        setUploading(false);
        return;
      }

      // Structure formData in the desired nested format
      const structuredFormData = {};

      lead.form.fields.forEach((field) => {
        if (['checkbox', 'radio'].includes(field.type)) {
          const fieldData = formData[field.label];
          structuredFormData[field.label] = {
            selectedOptions: fieldData?.selectedOptions && fieldData?.selectedOptions!=='Other' ? fieldData.selectedOptions : [],
            Other: fieldData?.Other || '',
          };
        } else {
          structuredFormData[field.label] = formData[field.label] || '';
        }
      });

      // Create FormData and build it recursively
      const leadData = new FormData();
      buildFormData(leadData, structuredFormData); 

      // Add selected products
      selectedProducts.forEach((product) => leadData.append('selectedProducts[]', product));

      // Append files
      Object.keys(files).forEach((key) => {
        if (files[key]) {
          leadData.append(key, files[key]);
        }
      });

      console.log([...leadData])

      // return

      // Submit the form data and files
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
          <a
            href={currentFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            View Current File
          </a>
        </p>
      )}
      <input
        ref={(ref) => (fileInputRefs.current[fieldLabel] = ref)}
        type="file"
        name={fieldLabel}
        onChange={(e) => handleInputChange(e, 'file', fieldLabel)}
        className="mt-2"
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
        <p className="mt-2 text-sm text-gray-500">
          Uploading a new file will replace the current one.
        </p>
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
                onChange={(e) => handleInputChange(e, field.type, field.label)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            )}
            {field.type === 'textarea' && (
              <textarea
                name={field.label}
                value={formData[field.label] || ''}
                onChange={(e) => handleInputChange(e, field.type, field.label)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            )}
            {field.type === 'select' && (
              <select
                name={field.label}
                value={formData[field.label] || ''}
                onChange={(e) => handleInputChange(e, field.type, field.label)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select an option</option>
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}
            {field.type === 'checkbox' && (
              <div className="mt-2">
                {field.options.map((option) => (
                  <label key={option} className="inline-flex items-center mr-4">
                    <input
                      type="checkbox"
                      name={field.label}
                      value={option}
                      checked={
                        formData[field.label]?.selectedOptions
                          ? formData[field.label].selectedOptions.includes(option)
                          : false
                      }
                      onChange={(e) => handleInputChange(e, field.type, field.label)}
                      className="form-checkbox"
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
                {formData[field.label]?.selectedOptions.includes('Other') && (
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder={`Specify other for ${field.label}`}
                      value={formData[field.label].Other || ''}
                      onChange={(e) => handleOtherInputChange(e, field.label)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                )}
              </div>
            )}
            {field.type === 'radio' && (
              <div className="mt-2">
                {field.options.map((option) => (
                  <label key={option} className="inline-flex items-center mr-4">
                    <input
                      type="radio"
                      name={field.label}
                      value={option}
                      checked={
                        formData[field.label]?.selectedOptions
                          ? formData[field.label].selectedOptions.includes(option)
                          : false
                      }
                      onChange={(e) => handleInputChange(e, field.type, field.label)}
                      className="form-radio"
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
                {formData[field.label]?.selectedOptions.includes('Other') && (
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder={`Specify other for ${field.label}`}
                      value={formData[field.label].Other || ''}
                      onChange={(e) => handleOtherInputChange(e, field.label)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                )}
              </div>
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
              <span className="ml-2">
                {product.name} (${product.price})
              </span>
            </label>
          </div>
        ))}

        {/* Submit Button */}
        <div className="mt-6">
          <button
            type="submit"
            className={`bg-blue-500 text-white px-4 py-2 rounded ${
              uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
            }`}
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
