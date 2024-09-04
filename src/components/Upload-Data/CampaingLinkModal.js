import React, { useState } from 'react';
import Modal from 'react-modal';
import Select from 'react-select';

Modal.setAppElement('#root'); // Replace '#root' with the appropriate ID of your root element

const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      width: '100%', // Ensure it takes full width on smaller screens
      maxWidth: '500px', // Set a maximum width for the modal
      padding: '20px', // Add some padding inside the modal
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.75)', // Darken the background for better focus
      zIndex: 1000, // Ensure the modal is above everything else
    },
  };

function CampaignLinkModal({ isOpen, onClose, onSubmit, campaigns }) {
    const [selectedCampaign, setSelectedCampaign] = useState(null);

    const handleSubmit = () => {
        onSubmit(selectedCampaign);
        onClose();
    };

    return (
        <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        contentLabel="Link to Campaign"
        style={customStyles} // Apply the custom styles
      >
        <h2 className="text-xl font-bold mb-4">Link to Campaign</h2>
        <Select
          options={campaigns}
          value={selectedCampaign}
          onChange={setSelectedCampaign}
          placeholder="Select a campaign"
        />
        <div className="flex justify-end mt-4">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white p-2 rounded mr-2"
          >
            Link
          </button>
          <button onClick={onClose} className="bg-gray-500 text-white p-2 rounded">
            Cancel
          </button>
        </div>
      </Modal>
    );
}

export default CampaignLinkModal;