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
  const [selectedCampaignType, setSelectedCampaignType] = useState(null);  // Selected campaign type
  const [searchKey, setSearchKey] = useState('');
  const [productsAndPrices, setProductOptions] = useState([]);  // List of products/services with prices
  const [newProduct, setNewProduct] = useState({ name: '', price: '' });  // New product/service to add
  const [editingProduct, setEditingProduct] = useState(null); // Track the product being edited

  const navigate = useNavigate();

  // Fetch campaign types
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
      toast.error('Failed to fetch campaign types.', {
        position: 'top-right',
        autoClose: 5000,
        transition: Bounce,
      });
    }
  };

  const handleInputChange = (inputValue) => {
    setSearchKey(inputValue);
  };

  useEffect(() => {
    // Fetch campaign types on component load and when searchKey changes
    loadCampaignTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKey]);

  // Add a new field with duplicate label and options check
  const addField = () => {
    if (!newField.type || !newField.label.trim()) {
      toast.error('Field type and label are required.', {
        position: 'top-right',
        autoClose: 5000,
        transition: Bounce,
      });
      return;
    }

    // If the field type requires options, ensure at least one option is present
    if (
      (newField.type === 'select' || newField.type === 'radio' || newField.type === 'checkbox') &&
      newField.options.length === 0
    ) {
      toast.error('You need to add at least one option for select, radio, or checkbox fields.', {
        position: 'top-right',
        autoClose: 5000,
        transition: Bounce,
      });
      return;
    }

    // Check for duplicate field labels
    const labelExists = fields.some(
      field => field.label.trim().toLowerCase() === newField.label.trim().toLowerCase()
    );

    if (labelExists) {
      toast.error('A field with this label already exists.', {
        position: 'top-right',
        autoClose: 5000,
        transition: Bounce,
      });
      return;
    }

    // Check for duplicate options within the new field
    const uniqueOptions = newField.options.map(opt => opt.trim().toLowerCase());
    const hasDuplicates = uniqueOptions.length !== new Set(uniqueOptions).size;
    if (hasDuplicates) {
      toast.error('Duplicate options found in the new field. Please ensure all options are unique.', {
        position: 'top-right',
        autoClose: 5000,
        transition: Bounce,
      });
      return;
    }

    // Add the new field
    setFields([...fields, newField]);
    setNewField({ type: '', label: '', required: false, options: [] });
    toast.success('Field added successfully!', {
      position: 'top-right',
      autoClose: 5000,
      transition: Bounce,
    });
  };

  // Handle changes to existing fields
  const handleFieldChange = (index, updatedField) => {
    setFields(fields.map((field, i) => (i === index ? updatedField : field)));
  };

  // Remove a field
  const removeField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
    toast.info('Field removed.', {
      position: 'top-right',
      autoClose: 3000,
      transition: Bounce,
    });
  };

  // Move a field up
  const moveFieldUp = (index) => {
    if (index === 0) return;
    const updatedFields = [...fields];
    [updatedFields[index - 1], updatedFields[index]] = [updatedFields[index], updatedFields[index - 1]];
    setFields(updatedFields);
  };

  // Move a field down
  const moveFieldDown = (index) => {
    if (index === fields.length - 1) return;
    const updatedFields = [...fields];
    [updatedFields[index + 1], updatedFields[index]] = [updatedFields[index], updatedFields[index + 1]];
    setFields(updatedFields);
  };

  // Handle campaign type selection
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

      // Check for duplicate field labels before adding required fields
      const duplicateRequiredFields = requiredFields.filter(reqField =>
        fields.some(existingField => existingField.label.trim().toLowerCase() === reqField.label.trim().toLowerCase())
      );

      if (duplicateRequiredFields.length > 0) {
        toast.error(`Some required fields from campaign type already exist: ${duplicateRequiredFields.map(f => f.label).join(', ')}`, {
          position: 'top-right',
          autoClose: 5000,
          transition: Bounce,
        });
        return;
      }

      setFields([...fields, ...requiredFields]);
      toast.success('Required fields from campaign type added.', {
        position: 'top-right',
        autoClose: 3000,
        transition: Bounce,
      });
    }
  };

  // Handle option changes for newField
  const handleNewFieldOptionChange = (index, value) => {
    const updatedOptions = [...newField.options];
    updatedOptions[index] = value.trim();

    // Prevent duplicate options
    const duplicates = updatedOptions.filter(opt => opt.toLowerCase() === value.trim().toLowerCase()).length;
    if (duplicates > 1) {
      toast.error('Option already exists in the new field.');
      return;
    }

    setNewField({ ...newField, options: updatedOptions });
  };

  // Add option to newField
  const addNewFieldOption = () => {
    if (newField.options.includes('Other')) {
      toast.error('Cannot add more options once "Other" is selected in the new field.', {
        position: 'top-right',
        autoClose: 5000,
        transition: Bounce,
      });
      return;
    }
    setNewField({ ...newField, options: [...newField.options, ''] });
  };

  // Add "Other" option to newField
  const addNewFieldOtherOption = () => {
    if (newField.options.includes('Other')) {
      toast.error('The "Other" option is already added in the new field.', {
        position: 'top-right',
        autoClose: 5000,
        transition: Bounce,
      });
      return;
    }
    setNewField({ ...newField, options: [...newField.options, 'Other'] });
  };

  // Remove option from newField
  const removeNewFieldOption = (index) => {
    const updatedOptions = newField.options.filter((_, i) => i !== index);
    setNewField({ ...newField, options: updatedOptions });
    toast.info('Option removed from the new field.', {
      position: 'top-right',
      autoClose: 3000,
      transition: Bounce,
    });
  };

  // Handle option changes for existing fields
  const handleExistingFieldOptionChange = (fieldIndex, optionIndex, value) => {
    const updatedFields = [...fields];
    updatedFields[fieldIndex].options[optionIndex] = value.trim();

    // Prevent duplicate options
    const duplicates = updatedFields[fieldIndex].options.filter(opt => opt.toLowerCase() === value.trim().toLowerCase()).length;
    if (duplicates > 1) {
      toast.error('Option already exists in this field.');
      return;
    }

    setFields(updatedFields);
  };

  // Add option to existing field
  const addExistingFieldOption = (fieldIndex) => {
    const field = fields[fieldIndex];
    if (field.options.includes('Other')) {
      toast.error('Cannot add more options once "Other" is selected in this field.', {
        position: 'top-right',
        autoClose: 5000,
        transition: Bounce,
      });
      return;
    }
    setFields(fields.map((f, i) => i === fieldIndex ? { ...f, options: [...f.options, ''] } : f));
  };

  // Add "Other" option to existing field
  const addExistingFieldOtherOption = (fieldIndex) => {
    const field = fields[fieldIndex];
    if (field.options.includes('Other')) {
      toast.error('The "Other" option is already added in this field.', {
        position: 'top-right',
        autoClose: 5000,
        transition: Bounce,
      });
      return;
    }
    setFields(fields.map((f, i) => i === fieldIndex ? { ...f, options: [...f.options, 'Other'] } : f));
  };

  // Remove option from existing field
  const removeExistingFieldOption = (fieldIndex, optionIndex) => {
    const updatedOptions = fields[fieldIndex].options.filter((_, i) => i !== optionIndex);
    setFields(fields.map((f, i) => i === fieldIndex ? { ...f, options: updatedOptions } : f));
    toast.info('Option removed from the field.', {
      position: 'top-right',
      autoClose: 3000,
      transition: Bounce,
    });
  };

  // Add new product/service to the product list
  const addNewProduct = () => {
    if (!newProduct.name.trim() || !newProduct.price) {
      toast.error('Product name and price are required.', {
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
      toast.success('Product/Service updated successfully.', {
        position: 'top-right',
        autoClose: 5000,
        transition: Bounce,
      });
    } else {
      // If not editing, add a new product
      const exists = productsAndPrices.some(
        product => product.name.trim().toLowerCase() === newProduct.name.trim().toLowerCase()
      );
      if (exists) {
        toast.error('Product name must be unique.', {
          position: 'top-right',
          autoClose: 5000,
          transition: Bounce,
        });
        return;
      }
      setProductOptions([...productsAndPrices, newProduct]);
      toast.success('Product/Service added successfully.', {
        position: 'top-right',
        autoClose: 5000,
        transition: Bounce,
      });
    }

    setNewProduct({ name: '', price: '' });
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
    toast.info('Product/Service removed.', {
      position: 'top-right',
      autoClose: 3000,
      transition: Bounce,
    });
  };

  // Handle form submission with duplicate options check
  const handleSubmit = async () => {
    if (!formName.trim() || fields.length === 0) {
      toast.error('Form name and at least one field are required.', {
        position: 'top-right',
        autoClose: 5000,
        transition: Bounce,
      });
      return;
    }

    // Validate all fields for duplicate and empty options
    for (let field of fields) {
      if (
        (field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') &&
        field.options.some(option => option.trim() === '')
      ) {
        toast.error(`All options for field "${field.label}" must be filled.`, {
          position: 'top-right',
          autoClose: 5000,
          transition: Bounce,
        });
        return;
      }

      const uniqueOptions = field.options.map(opt => opt.trim().toLowerCase());
      const hasDuplicates = uniqueOptions.length !== new Set(uniqueOptions).size;
      if (hasDuplicates) {
        toast.error(`Duplicate options found in field "${field.label}". Please ensure all options are unique.`, {
          position: 'top-right',
          autoClose: 5000,
          transition: Bounce,
        });
        return;
      }
    }

    try {
      await createForm({ name: formName.trim(), fields, productsAndPrices });
      toast.success('Form created successfully!', {
        position: 'top-right',
        autoClose: 5000,
        transition: Bounce,
      });
      navigate('/admin/view-forms'); // Redirect after successful creation
    } catch (error) {
      console.error('Error creating form:', error);
      toast.error('Failed to create form.', {
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
          value={selectedCampaignType}
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
              onChange={(e) => setNewField({ ...newField, type: e.target.value, options: [] })}
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

        {/* Add options for select, radio, and checkbox */}
        {(newField.type === 'select' || newField.type === 'radio' || newField.type === 'checkbox') && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Options</h3>
            {newField.options.map((option, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleNewFieldOptionChange(index, e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  placeholder={`Option ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeNewFieldOption(index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
            <div className='flex gap-3 mt-2'>
              <button
                type="button"
                onClick={addNewFieldOption}
                className="bg-purple-500 text-xs text-white px-2 py-2 rounded hover:bg-purple-600"
              >
                Add Option
              </button>

              <button
                type="button"
                onClick={addNewFieldOtherOption}
                className="bg-pink-800 text-xs text-white px-2 py-2 rounded hover:bg-pink-900"
              >
                Add "Other" Option
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={addField}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Add Field
        </button>
      </div>

      {/* Edit Fields */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Edit Fields</h2>
        {fields.length === 0 ? (
          <p className="text-gray-500">No fields added yet.</p>
        ) : (
          fields.map((field, index) => (
            <div key={index} className="mb-4 border p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) => handleFieldChange(index, { ...field, label: e.target.value })}
                    className="text-lg font-semibold border border-gray-300 rounded-md px-2 py-1"
                    placeholder="Field Label"
                  />
                  <select
                    value={field.type}
                    onChange={(e) => handleFieldChange(index, { ...field, type: e.target.value, options: field.type !== 'select' && field.type !== 'radio' && field.type !== 'checkbox' ? [] : field.options })}
                    className="border border-gray-300 rounded-md px-2 py-1"
                  >
                    <option value="text">Text</option>
                    <option value="textarea">Textarea</option>
                    <option value="select">Select</option>
                    <option value="radio">Radio</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="file">File</option>
                  </select>
                  {field.required && <span className="text-red-500">*</span>}
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => moveFieldUp(index)}
                    disabled={index === 0}
                    className={`text-blue-500 hover:text-blue-700 ${index === 0 ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <FaArrowUp />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveFieldDown(index)}
                    disabled={index === fields.length - 1}
                    className={`text-blue-500 hover:text-blue-700 ${index === fields.length - 1 ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <FaArrowDown />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeField(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              {/* Additional Options for Select/Radio/Checkbox */}
              {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                <div className="mt-2">
                  <h3 className="font-semibold mb-2">Options</h3>
                  {field.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center mb-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleExistingFieldOptionChange(index, optIndex, e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        placeholder={`Option ${optIndex + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingFieldOption(index, optIndex)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <div className='flex gap-3 mt-2'>
                    <button
                      type="button"
                      onClick={() => addExistingFieldOption(index)}
                      className="bg-purple-500 text-xs text-white px-2 py-2 rounded hover:bg-purple-600"
                    >
                      Add Option
                    </button>

                    <button
                      type="button"
                      onClick={() => addExistingFieldOtherOption(index)}
                      className="bg-pink-800 text-xs text-white px-2 py-2 rounded hover:bg-pink-900"
                    >
                      Add "Other" Option
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Preview Fields */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Form Preview</h2>
        {fields.length === 0 ? (
          <p className="text-gray-500">No fields added yet.</p>
        ) : (
          fields.map((field, index) => (
            <div key={index} className="mb-4 border p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <p>
                  {field.label} ({field.type}) {field.required && <span className="text-red-500">*</span>}
                </p>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => moveFieldUp(index)}
                    disabled={index === 0}
                    className={`text-blue-500 hover:text-blue-700 ${index === 0 ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <FaArrowUp />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveFieldDown(index)}
                    disabled={index === fields.length - 1}
                    className={`text-blue-500 hover:text-blue-700 ${index === fields.length - 1 ? 'cursor-not-allowed opacity-50' : ''}`}
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
                    {option === 'Other' && (
                      <input
                        type="text"
                        placeholder="Please specify"
                        className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        disabled
                      />
                    )}
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
