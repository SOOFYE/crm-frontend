import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchSingleForm } from '../../services/formBuilderService'; // Assuming you have this service
import moment from 'moment';
import { toast } from 'react-toastify';

const SingleViewForm = () => {
  const { formId } = useParams(); // Get the formId from the URL
  const [form, setForm] = useState(null); // State to store the form data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const navigate = useNavigate();

  useEffect(() => {
    loadForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId]);

  // Fetch the form data based on formId
  const loadForm = async () => {
    setLoading(true);
    try {
      const data = await fetchSingleForm(formId); // Fetch the form using formId
      setForm(data);
    } catch (err) {
      setError('Failed to fetch form');
      toast.error('Failed to fetch form', {
        position: 'top-right',
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to render individual form fields based on their type
  const renderField = (field) => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            placeholder="Enter text here"
            className="w-full border px-3 py-2 rounded"
            disabled
          />
        );
      case 'textarea':
        return (
          <textarea
            placeholder="Enter text here"
            className="w-full border px-3 py-2 rounded"
            disabled
          ></textarea>
        );
      case 'select':
        return (
          <select className="w-full border px-3 py-2 rounded" disabled>
            {field.options.map((option, idx) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case 'radio':
        return (
          <div>
            {field.options.map((option, idx) => (
              <label key={idx} className="block mb-2">
                <input
                  type="radio"
                  name={`field_${field.label}`}
                  value={option}
                  disabled
                  className="mr-2"
                />
                {option}
                {option.toLowerCase() === 'other' && (
                  <input
                    type="text"
                    placeholder="Please specify"
                    className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    disabled
                  />
                )}
              </label>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div>
            {field.options.map((option, idx) => (
              <label key={idx} className="block mb-2">
                <input
                  type="checkbox"
                  name={`field_${field.label}`}
                  value={option}
                  disabled
                  className="mr-2"
                />
                {option}
                {option.toLowerCase() === 'other' && (
                  <input
                    type="text"
                    placeholder="Please specify"
                    className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    disabled
                  />
                )}
              </label>
            ))}
          </div>
        );
      case 'file':
        return (
          <input
            type="file"
            className="w-full px-3 py-2 border rounded"
            disabled
          />
        );
      default:
        return null;
    }
  };

  // Function to render the list of products and their prices
  const renderProductsAndPrices = (products) => {
    if (products.length === 0) {
      return <p className="text-gray-500">No products/services added.</p>;
    }
    return products.map((product, index) => (
      <div key={index} className="flex justify-between items-center border-b pb-2">
        <p className="text-gray-700">{product.name}</p>
        <p className="text-gray-700">${product.price}</p>
      </div>
    ));
  };

  // Handle loading and error states
  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with Form Title and Edit Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Form Preview</h2>
        <button
          onClick={() => navigate(`/admin/edit-form/${form.id}`)} // Navigate to edit form page
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Edit
        </button>
      </div>

      {form && (
        <div className="grid grid-cols-1 gap-6">
          {/* Form Name Section */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">Form Name</h3>
            <p className="text-gray-700">{form.name}</p>
          </div>

          {/* Products and Services Section */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">Products/Services</h3>
            {renderProductsAndPrices(form.productsAndPrices || [])}
          </div>

          {/* Form Fields Section */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Form Fields</h3>
            {form.fields && form.fields.length > 0 ? (
              <div className="space-y-6">
                {form.fields.map((field, index) => (
                  <div key={index} className="border-b pb-4">
                    <p className="text-gray-600 mb-2">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </p>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No fields available.</p>
            )}
          </div>

          {/* Created At Section */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">Created At</h3>
            <p className="text-gray-700">{moment(form.createdAt).format('MMMM Do YYYY, h:mm:ss a')}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleViewForm;
