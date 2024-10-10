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
        setFields(form.fields); // Load existing fields into state
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
    if (!newField.type || !newField.label) {
      toast.error('Field type and label are required', {
        position: 'top-right',
        autoClose: 5000,
        transition: Bounce,
      });
      return;
    }

    // Check if a field with the same label already exists
    const labelExists = fields.some(field => field.label.toLowerCase() === newField.label.toLowerCase());
    if (labelExists) {
      toast.error('A field with this label already exists', {
        position: 'top-right',
        autoClose: 5000,
        transition: Bounce,
      });
      return;
    }

    setFields([...fields, newField]);
    setNewField({ type: '', label: '', required: false, options: [] });
    toast.success('Field added successfully!', {
      position: 'top-right',
      autoClose: 5000,
      transition: Bounce,
    });
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
      if (productsAndPrices.find(product => product.name.toLowerCase() === newProduct.name.toLowerCase())) {
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

  // Handle changes to existing fields
  const handleFieldChange = (index, updatedField) => {
    const updatedFields = fields.map((field, i) => (i === index ? updatedField : field));
    setFields(updatedFields);
  };

  // Remove a field
  const removeField = (index) => {
    const updatedFields = fields.filter((_, i) => i !== index);
    setFields(updatedFields);
  };

  // Move a field up or down
  const moveField = (index, direction) => {
    const newFields = [...fields];
    const [movedField] = newFields.splice(index, 1); // Remove the field
    newFields.splice(index + direction, 0, movedField); // Insert at new position
    setFields(newFields);
  };

  // Handle form submission
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
      await updateForm(formId, { name: formName, fields, productsAndPrices });
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Form</h1>
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Save Changes
        </button>
      </div>

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

      {/* Edit Fields */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Edit Fields</h2>
        {fields.length === 0 ? (
          <p className="text-gray-500">No fields added yet</p>
        ) : (
          fields.map((field, index) => (
            <div key={index} className="mb-4 border p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) => handleFieldChange(index, { ...field, label: e.target.value })}
                    className="text-lg font-semibold border border-gray-300 rounded-md px-2 py-1"
                    placeholder="Field Label"
                  />
                  <select
                    value={field.type}
                    onChange={(e) => handleFieldChange(index, { ...field, type: e.target.value })}
                    className="ml-2 border border-gray-300 rounded-md px-2 py-1"
                  >
                    <option value="text">Text</option>
                    <option value="textarea">Textarea</option>
                    <option value="select">Select</option>
                    <option value="radio">Radio</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="file">File</option>
                  </select>
                  {field.required && <span className="text-red-500 ml-2">*</span>}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => moveField(index, -1)} // Move field up
                    disabled={index === 0}
                    className={`text-blue-500 hover:underline ${index === 0 ? 'cursor-not-allowed' : ''}`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveField(index, 1)} // Move field down
                    disabled={index === fields.length - 1}
                    className={`text-blue-500 hover:underline ${index === fields.length - 1 ? 'cursor-not-allowed' : ''}`}
                  >
                    ↓
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
              {/* Additional Options for Select/Radio/Checkbox */}
              {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Options (comma separated)</label>
                  <input
                    type="text"
                    value={field.options.join(', ')}
                    onChange={(e) => handleFieldChange(index, { ...field, options: e.target.value.split(',').map(opt => opt.trim()) })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    placeholder="Option1, Option2"
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EditForm;