import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchSingleForm, updateForm } from '../../services/formBuilderService'; // Fetch and update form APIs
import { toast, Bounce } from 'react-toastify';
import { FaArrowUp, FaArrowDown, FaEdit, FaTrash } from 'react-icons/fa'; // Icons for editing and removing

const EditForm = () => {
  const { formId } = useParams(); // Get form ID from URL
  const [formName, setFormName] = useState('');  // For form name
  const [fields, setFields] = useState([]);  // Store form fields
  const [newField, setNewField] = useState({ type: '', label: '', required: false, options: [] });  // Field being added
  const [productsAndPrices, setProductOptions] = useState([]);  // List of products/services with prices
  const [newProduct, setNewProduct] = useState({ name: '', price: '' });  // New product/service to add
  const [editingProduct, setEditingProduct] = useState(null); // Track the product being edited
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch form data by ID when the component loads
    const loadForm = async () => {
      try {
        const form = await fetchSingleForm(formId); // API call to fetch form details
        setFormName(form.name);
        setFields(form.fields.map(field => ({
          ...field,
          options: field.options || []
        }))); // Ensure options is an array
        setProductOptions(form.productsAndPrices || []); // Load existing products and prices
      } catch (error) {
        toast.error('Failed to load form details', {
          position: 'top-right',
          autoClose: 5000,
          transition: Bounce,
        });
      }
    };
    loadForm();
  }, [formId]);

  // Add a new field with duplicate label check
  const addField = () => {
    if (!newField.type || !newField.label.trim()) {
      toast.error('Field type and label are required', {
        position: 'top-right',
        autoClose: 5000,
        transition: Bounce,
      });
      return;
    }

    if (
      (newField.type === 'select' || newField.type === 'radio' || newField.type === 'checkbox') &&
      newField.options.length === 0
    ) {
      toast.error('You need to add at least one option for select, radio, or checkbox fields', {
        position: 'top-right',
        autoClose: 5000,
        transition: Bounce,
      });
      return;
    }

    // Check if a field with the same label already exists
    const labelExists = fields.some(
      field => field.label.trim().toLowerCase() === newField.label.trim().toLowerCase()
    );

    if (labelExists) {
      toast.error('A field with this label already exists', {
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
    const updatedFields = fields.map((field, i) => (i === index ? updatedField : field));
    setFields(updatedFields);
  };

  // Remove a field
  const removeField = (index) => {
    const updatedFields = fields.filter((_, i) => i !== index);
    setFields(updatedFields);
    toast.info('Field removed', {
      position: 'top-right',
      autoClose: 3000,
      transition: Bounce,
    });
  };

  // Move a field up or down
  const moveField = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= fields.length) return;

    const updatedFields = [...fields];
    [updatedFields[index], updatedFields[newIndex]] = [updatedFields[newIndex], updatedFields[index]];
    setFields(updatedFields);
  };

  // Handle changes to options for existing fields
  const handleOptionChange = (fieldIndex, optionIndex, newOption) => {
    const updatedFields = [...fields];
    const updatedOptions = [...updatedFields[fieldIndex].options];
    updatedOptions[optionIndex] = newOption.trim();

    // Prevent duplicate options
    const duplicates = updatedOptions.filter(opt => opt.toLowerCase() === newOption.toLowerCase()).length;
    if (duplicates > 1) {
      toast.error('Option already exists');
      return;
    }

    updatedFields[fieldIndex].options = updatedOptions;
    setFields(updatedFields);
  };

  // Add a new option to an existing field
  const addOption = (fieldIndex) => {
    const field = fields[fieldIndex];
    if (field.options.includes('Other')) {
      toast.error('Cannot add more options once "Other" is selected', {
        position: 'top-right',
        autoClose: 5000,
        transition: Bounce,
      });
      return;
    }
    setFields(fields.map((f, i) => i === fieldIndex ? { ...f, options: [...f.options, ''] } : f));
  };

  // Add "Other" option to an existing field
  const addOtherOption = (fieldIndex) => {
    const field = fields[fieldIndex];
    if (field.options.includes('Other')) {
      toast.error('The "Other" option is already added', {
        position: 'top-right',
        autoClose: 5000,
        transition: Bounce,
      });
      return;
    }
    setFields(fields.map((f, i) => i === fieldIndex ? { ...f, options: [...f.options, 'Other'] } : f));
  };

  // Remove an option from an existing field
  const removeOption = (fieldIndex, optionIndex) => {
    const updatedOptions = fields[fieldIndex].options.filter((_, idx) => idx !== optionIndex);
    handleFieldChange(fieldIndex, { ...fields[fieldIndex], options: updatedOptions });
    toast.info('Option removed', {
      position: 'top-right',
      autoClose: 3000,
      transition: Bounce,
    });
  };

  // Separate handlers for newField options
  const handleNewFieldOptionChange = (optionIndex, newOption) => {
    const updatedOptions = [...newField.options];
    updatedOptions[optionIndex] = newOption.trim();

    // Prevent duplicate options
    const duplicates = updatedOptions.filter(opt => opt.toLowerCase() === newOption.toLowerCase()).length;
    if (duplicates > 1) {
      toast.error('Option already exists in the new field');
      return;
    }

    setNewField({ ...newField, options: updatedOptions });
  };

  const addNewFieldOption = () => {
    if (newField.options.includes('Other')) {
      toast.error('Cannot add more options once "Other" is selected in the new field', {
        position: 'top-right',
        autoClose: 5000,
        transition: Bounce,
      });
      return;
    }
    setNewField({ ...newField, options: [...newField.options, ''] });
  };

  const addNewFieldOtherOption = () => {
    if (newField.options.includes('Other')) {
      toast.error('The "Other" option is already added in the new field', {
        position: 'top-right',
        autoClose: 5000,
        transition: Bounce,
      });
      return;
    }
    setNewField({ ...newField, options: [...newField.options, 'Other'] });
  };

  const removeNewFieldOption = (optionIndex) => {
    const updatedOptions = newField.options.filter((_, idx) => idx !== optionIndex);
    setNewField({ ...newField, options: updatedOptions });
    toast.info('Option removed from new field', {
      position: 'top-right',
      autoClose: 3000,
      transition: Bounce,
    });
  };

  // Add new product/service to the product list
  const addNewProduct = () => {
    if (!newProduct.name.trim() || !newProduct.price) {
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
      toast.success('Product/Service updated successfully', {
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
        toast.error('Product name must be unique', {
          position: 'top-right',
          autoClose: 5000,
          transition: Bounce,
        });
        return;
      }
      setProductOptions([...productsAndPrices, newProduct]);
      toast.success('Product/Service added successfully', {
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
    toast.info('Product/Service removed', {
      position: 'top-right',
      autoClose: 3000,
      transition: Bounce,
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!formName.trim() || fields.length === 0) {
      toast.error('Form name and at least one field are required', {
        position: 'top-right',
        autoClose: 5000,
        transition: Bounce,
      });
      return;
    }

    // Additional validation:
    // 1. Ensure all options are filled for relevant fields
    // 2. Ensure no duplicate options exist within any field
    for (let field of fields) {
      if (
        (field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') &&
        field.options.some(option => option.trim() === '')
      ) {
        toast.error(`All options for field "${field.label}" must be filled`, {
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
      await updateForm(formId, { name: formName.trim(), fields, productsAndPrices });
      toast.success('Form updated successfully!', {
        position: 'top-right',
        autoClose: 5000,
        transition: Bounce,
      });
      navigate('/admin/view-forms'); // Redirect after successful update
    } catch (error) {
      toast.error('Failed to update form', {
        position: 'top-right',
        autoClose: 5000,
        transition: Bounce,
      });
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Form</h1>

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
          <p className="text-gray-500">No fields added yet</p>
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
                    onChange={(e) => handleFieldChange(index, { ...field, type: e.target.value, options: [] })}
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
                    onClick={() => moveField(index, -1)} // Move field up
                    disabled={index === 0}
                    className={`text-blue-500 hover:text-blue-700 ${index === 0 ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <FaArrowUp />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveField(index, 1)} // Move field down
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
                        onChange={(e) => handleOptionChange(index, optIndex, e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        placeholder={`Option ${optIndex + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(index, optIndex)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <div className='flex gap-3 mt-2'>
                    <button
                      type="button"
                      onClick={() => addOption(index)}
                      className="bg-purple-500 text-xs text-white px-2 py-2 rounded hover:bg-purple-600"
                    >
                      Add Option
                    </button>

                    <button
                      type="button"
                      onClick={() => addOtherOption(index)}
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
          <p className="text-gray-500">No fields added yet</p>
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
                    onClick={() => moveField(index, -1)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaArrowUp />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveField(index, 1)}
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

export default EditForm;
