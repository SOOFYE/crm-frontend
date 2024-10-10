import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // For getting URL params
import { fetchFormForAgent } from '../../services/formBuilderService';
import { toast, Bounce } from 'react-toastify';
import usaImage from '../../assets/svg/usa.png';

const AgentSearchPage = () => {
  const { campaignId, formId } = useParams(); // Get campaignId and formId from URL params
  const [phoneNumber, setPhoneNumber] = useState(Array(10).fill('')); // Input for phone number as an array
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state
  const navigate = useNavigate();

  const handleSearch = async () => {
    const formattedPhoneNumber = `(${phoneNumber.slice(0, 3).join('')}) ${phoneNumber.slice(3, 6).join('')}-${phoneNumber.slice(6).join('')}`;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchFormForAgent(campaignId, formId, formattedPhoneNumber);
      const state = {
        form: response.form,
        matchedRecord: response.matchedRecord,
        processedDataId: response.processedDataId,
        campaignName: response.campaignName,
        phoneNumber: formattedPhoneNumber
      };
      navigate('form-entry', { state });
    } catch (error) {
      if (error.response && error.response.status === 403) {
        toast.error('You are not authorized to access this campaign.', {
          position: 'top-right',
          autoClose: 5000,
          transition: Bounce,
        });
      } else if (error.response && error.response.status === 404) {
        toast.error('Phone number not found in the processed data.', {
          position: 'top-right',
          autoClose: 5000,
          transition: Bounce,
        });
      } else {
        toast.error('An error occurred while fetching the data.', {
          position: 'top-right',
          autoClose: 5000,
          transition: Bounce,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits

    if (value.length === 1) {
      const newNumber = [...phoneNumber];
      newNumber[index] = value;
      setPhoneNumber(newNumber);

      // Move to next input box if there's a next one and input is filled
      if (index < 9) document.getElementById(`phone-input-${index + 1}`).focus();
    }
  };

  const handleKeyNavigation = (e, index) => {
    if (e.key === 'Backspace') {
      if (!phoneNumber[index]) {
        // Move focus to the previous input if the current one is empty
        if (index > 0) document.getElementById(`phone-input-${index - 1}`).focus();
      } else {
        const newNumber = [...phoneNumber];
        newNumber[index] = '';
        setPhoneNumber(newNumber);
      }
    } else if (e.key === 'ArrowRight' && index < 9) {
      document.getElementById(`phone-input-${index + 1}`).focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      document.getElementById(`phone-input-${index - 1}`).focus();
    }
  };

  const handlePaste = (e) => {
    // Strip non-numeric characters, remove any leading international code like +1
    let pasteData = e.clipboardData.getData('text').replace(/\D/g, '');
  
    // Check if the number starts with 1 and is more than 10 digits long (international code)
    if (pasteData.length === 11 && pasteData.startsWith('1')) {
      pasteData = pasteData.substring(1); // Remove the leading 1 (international code)
    }
  
    // Ensure we only handle exactly 10 digits
    if (pasteData.length === 10) {
      const newNumber = pasteData.split('');
      setPhoneNumber(newNumber);
  
      // Focus on the last input field after pasting
      document.getElementById('phone-input-9').focus();
    } else {
      // Handle cases where the number is not exactly 10 digits
      toast.error('Please enter a valid 10-digit phone number.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
        transition: Bounce,
      });
    }
  };
  

  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded-lg shadow-md">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold mb-2 text-blue-900">Find and Verify Phone Number</h1>
        <p className="text-gray-600">
          Please enter the phone number (XXX) YYY-ZZZZ below to search and verify the record. Once the number is found, you'll be directed to the form for data entry.
        </p>
      </div>

      <div className="flex justify-center items-center mb-6 ">
        <img src={usaImage} className="w-11 h-7 mr-2 " alt="USA Flag" />
        <div className="flex space-x-2" onPaste={handlePaste}>
          <span className="text-xl">(</span>
          {Array.from({ length: 3 }).map((_, index) => (
            <input
              key={index}
              id={`phone-input-${index}`}
              type="text"
              maxLength="1"
              value={phoneNumber[index] || ''}
              onChange={(e) => handleInputChange(e, index)}
              onKeyDown={(e) => handleKeyNavigation(e, index)}
              className="w-10 h-10 text-center border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ))}
          <span className="text-xl">)</span>
          <div className="flex space-x-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <input
                key={index + 3}
                id={`phone-input-${index + 3}`}
                type="text"
                maxLength="1"
                value={phoneNumber[index + 3] || ''}
                onChange={(e) => handleInputChange(e, index + 3)}
                onKeyDown={(e) => handleKeyNavigation(e, index + 3)}
                className="w-10 h-10 text-center border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ))}
          </div>
          <span className="text-xl">-</span>
          <div className="flex space-x-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <input
                key={index + 6}
                id={`phone-input-${index + 6}`}
                type="text"
                maxLength="1"
                value={phoneNumber[index + 6] || ''}
                onChange={(e) => handleInputChange(e, index + 6)}
                onKeyDown={(e) => handleKeyNavigation(e, index + 6)}
                className="w-10 h-10 text-center border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ))}
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      <button
        onClick={handleSearch}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        disabled={isLoading || phoneNumber.length < 10}
      >
        {isLoading ? 'Searching...' : 'Search'}
      </button>
    </div>
  );
};

export default AgentSearchPage;
