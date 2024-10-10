import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createForm } from '../../services/formBuilderService'; // API call to create form
import { fetchCampaignTypes } from '../../services/campaignTypeService'; // Fetch campaign types
import { toast, Bounce } from 'react-toastify';
import { FaArrowUp, FaArrowDown, FaEdit, FaTrash } from 'react-icons/fa'; // Icons for editing and removing
import Select from 'react-select';

const FormBuilder = () => {
  const [formName, setFormName] = useState('');  // For form name
  const [fields, setFields] = useState([]);  // Store form fields
  const [newField, setNewField] = useState({ type: '', label: '', required: false, options: [] });  // Field being added
  const [campaignTypes, setCampaignTypes] = useState([]);  // Store campaign types
  const [selectedCampaignType, setSelectedCampaignType] = useState('');  // Selected campaign type
  const [searchKey, setSearchKey] = useState('');
  const [productsAndPrices, setProductOptions] = useState([]);  // List of products/services with prices
  const [newProduct, setNewProduct] = useState({ name: '', price: '' });  // New product/service to add
  const [editingProduct, setEditingProduct] = useState(null); // Track the product being edited

  const navigate = useNavigate();

  const loadCampaignTypes = async () => {
    try {
      const data = await fetchCampaignTypes({ page: 1, limit: 999999, searchKey, searchField: ['name'] });
      setCampaignTypes(data.data.map((type) => ({
        value: type.id,
        label: type.name,
        requiredFields: type.requiredFields, // Include required fields
      })));
    } catch (error) {
      console.error('Error fetching campaign types:', error);
    }
  };

  const handleInputChange = (inputValue) => {
    setSearchKey(inputValue);
  };

  useEffect(() => {
    // Fetch campaign types on component load
    loadCampaignTypes();
  }, []);

  const addField = () => {
    if (!newField.type || !newField.label) {
      toast.error('Field type and label are required', {
        position: 'top-right',
        autoClose: 5000,
        transition: Bounce,
      });
      return;
    }
  
    // Check if a field with the same label already exists
    const labelExists = fields.some(field => field.label.trim().toLowerCase() === newField.label.trim().toLowerCase());
  
    if (labelExists) {
      toast.error('A field with this label already exists', {
        position: 'top-right',
        autoClose: 5000,
        transition: Bounce,
      });
      return;
    }
  
    // If the label is unique, add the new field
    setFields([...fields, newField]);
    setNewField({ type: '', label: '', required: false, options: [] });
    toast.success('Field added successfully!', {
      position: 'top-right',
      autoClose: 5000,
      transition: Bounce,
    });
  };

  const handleFieldChange = (index, updatedField) => {
    const updatedFields = fields.map((field, i) => (i === index ? updatedField : field));
    setFields(updatedFields);
  };

  const removeField = (index) => {
    const updatedFields = fields.filter((_, i) => i !== index);
    setFields(updatedFields);
  };

  const moveFieldUp = (index) => {
    if (index === 0) return;
    const updatedFields = [...fields];
    [updatedFields[index - 1], updatedFields[index]] = [updatedFields[index], updatedFields[index - 1]];
    setFields(updatedFields);
  };

  const moveFieldDown = (index) => {
    if (index === fields.length - 1) return;
    const updatedFields = [...fields];
    [updatedFields[index + 1], updatedFields[index]] = [updatedFields[index], updatedFields[index + 1]];
    setFields(updatedFields);
  };

  const handleCampaignTypeChange = (selectedType) => {
    setSelectedCampaignType(selectedType);

    const campaignType = campaignTypes.find(type => type.value === selectedType.value);

    if (campaignType && campaignType.requiredFields) {
      const requiredFields = campaignType.requiredFields.map(field => ({
        type: 'text',
        label: field,
        required: true,
        options: [],
      }));
      setFields([...fields, ...requiredFields]);
    }
  };

  // Add new product/service to the product list
  const addNewProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      toast.error('Product name and price are required', {
        position: 'top-right',
        autoClose: 5000,
        transition: Bounce,
      });
      return;
    }

    if (editingProduct !== null) {
      // If editing, update the product in the list
      const updatedProducts = productsAndPrices.map((product, idx) => 
        idx === editingProduct ? { ...newProduct } : product
      );
      setProductOptions(updatedProducts);
      setEditingProduct(null); // Reset editing state
    } else {
      // If not editing, add a new product
      if (productsAndPrices.find(product => product.name === newProduct.name)) {
        toast.error('Product name must be unique', {
          position: 'top-right',
          autoClose: 5000,
          transition: Bounce,
        });
        return;
      }
      setProductOptions([...productsAndPrices, newProduct]);
    }

    setNewProduct({ name: '', price: '' });
    toast.success('Product/Service added/updated successfully', {
      position: 'top-right',
      autoClose: 5000,
      transition: Bounce,
    });
  };

  // Edit existing product
  const handleEditProduct = (index) => {
    setNewProduct(productsAndPrices[index]);
    setEditingProduct(index);
  };

  // Remove existing product
  const handleRemoveProduct = (index) => {
    const updatedProducts = productsAndPrices.filter((_, idx) => idx !== index);
    setProductOptions(updatedProducts);
  };

  const handleSubmit = async () => {
    if (!formName || fields.length === 0) {
      toast.error('Form name and fields are required', {
        position: 'top-right',
        autoClose: 5000,
        transition: Bounce,
      });
      return;
    }

    try {
      await createForm({ name: formName, fields, productsAndPrices });
      toast.success('Form created successfully!', {
        position: 'top-right',
        autoClose: 5000,
        transition: Bounce,
      });
      navigate('/admin/view-forms'); // Redirect after successful creation
    } catch (error) {
      toast.error('Failed to create form', {
        position: 'top-right',
        autoClose: 5000,
        transition: Bounce,
      });
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Form Builder</h1>

      {/* Form Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Form Name</label>
        <input
          type="text"
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          placeholder="Enter form name"
          required
        />
      </div>

      {/* Campaign Type Dropdown */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Load Fields from Campaign Type</label>
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

      {/* Add New Product/Service */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Add New Product/Service</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Product/Service Name</label>
            <input
              type="text"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="Enter product/service name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="Enter price"
              required
            />
          </div>
        </div>
        <button
          type="button"
          onClick={addNewProduct}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          {editingProduct !== null ? 'Update Product/Service' : 'Add Product/Service'}
        </button>
      </div>

      {/* Products/Services and Pricing */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Products/Services List</h2>
        {productsAndPrices.length === 0 ? (
          <p className="text-gray-500">No products/services added yet.</p>
        ) : (
          productsAndPrices.map((product, idx) => (
            <div key={idx} className="flex justify-between items-center mb-2 border p-2 rounded">
              <div>
                {product.name} (Price: ${product.price})
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => handleEditProduct(idx)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <FaEdit />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveProduct(idx)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Fields */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Add Field</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Field Type</label>
            <select
              value={newField.type}
              onChange={(e) => setNewField({ ...newField, type: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            >
              <option value="" disabled>Select field type</option>
              <option value="text">Text</option>
              <option value="textarea">Textarea</option>
              <option value="select">Select</option>
              <option value="radio">Radio</option>
              <option value="checkbox">Checkbox</option>
              <option value="file">File</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Label</label>
            <input
              type="text"
              value={newField.label}
              onChange={(e) => setNewField({ ...newField, label: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="Field label"
              required
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={newField.required}
              onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
              className="mr-2"
            />
            <label className="text-sm font-medium text-gray-700">Required?</label>
          </div>
        </div>

        <button
          type="button"
          onClick={addField}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Add Field
        </button>
      </div>

      {/* Preview Fields */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Form Preview</h2>
        {fields.length === 0 ? (
          <p className="text-gray-500">No fields added yet</p>
        ) : (
          fields.map((field, index) => (
            <div key={index} className="mb-4 border p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <p>{field.label} ({field.type}) {field.required && <span className="text-red-500">*</span>}</p>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => moveFieldUp(index)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaArrowUp />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveFieldDown(index)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaArrowDown />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeField(index)}
                    className="text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Preview Input Fields */}
              {field.type === 'text' || field.type === 'textarea' ? (
                <input
                  type={field.type === 'text' ? 'text' : 'textarea'}
                  className="block w-full border px-2 py-1 rounded"
                  placeholder={field.label}
                  disabled
                />
              ) : field.type === 'select' ? (
                <select className="block w-full border px-2 py-1 rounded" disabled>
                  {field.options.map((option, idx) => (
                    <option key={idx} value={option}>{option}</option>
                  ))}
                </select>
              ) : field.type === 'radio' || field.type === 'checkbox' ? (
                field.options.map((option, idx) => (
                  <label key={idx} className="block">
                    <input type={field.type} name={`field_${index}`} disabled /> {option}
                  </label>
                ))
              ) : field.type === 'file' ? (
                <input type="file" className="block w-full border px-2 py-1 rounded" disabled />
              ) : null}
            </div>
          ))
        )}
      </div>

      {/* Save Form Button */}
      <button
        type="button"
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Save Form
      </button>
    </div>
  );
};

export default FormBuilder;