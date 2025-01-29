import React, { useState } from 'react';
import Modal from 'react-modal';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import { toast } from 'react-toastify';
import 'react-datepicker/dist/react-datepicker.css';
import { generateReport } from '../../services/leadService';

const GenerateReportModal = ({ isOpen, onRequestClose, campaignOptions }) => {
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [dateRange, setDateRange] = useState([null, null]);
    const [recipientEmail, setRecipientEmail] = useState('');
    const [loading, setLoading] = useState(false);
  
    const [startDate, endDate] = dateRange;
  
    const handleGenerateReport = async () => {
      if (!selectedCampaign || !startDate || !endDate || !recipientEmail) {
        toast.error('Please fill all fields: campaign, date range, and recipient email.');
        return;
      }
  
      setLoading(true);
  
      try {
        await generateReport({
          campaignId: selectedCampaign.value,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          recipientEmail,
        });
        toast.success('Report generated and emailed successfully!');
        onRequestClose();
      } catch (error) {
        console.error('Error generating report:', error);
        toast.error('Failed to generate the report.');
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        contentLabel="Generate Report"
        ariaHideApp={false} // To avoid issues with screen readers
        className="bg-white p-6 rounded shadow-lg w-1/3 mx-auto mt-20"
        overlayClassName="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-xl font-bold mb-4">Generate Report</h2>
  
        <div className="mb-4">
          <label className="block font-medium mb-2">Select Campaign</label>
          <Select
            options={campaignOptions}
            value={selectedCampaign}
            onChange={setSelectedCampaign}
            placeholder="Choose a campaign..."
          />
        </div>
  
        <div className="mb-4">
          <label className="block font-medium mb-2">Select Date Range</label>
          <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
            isClearable
            placeholderText="Choose a date range..."
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>
  
        <div className="mb-4">
          <label className="block font-medium mb-2">Recipient Email</label>
          <input
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="Enter recipient email"
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>
  
        <div className="flex justify-end">
          <button
            onClick={onRequestClose}
            className="bg-gray-500 text-white py-2 px-4 rounded mr-2"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerateReport}
            className={`bg-blue-500 text-white py-2 px-4 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </Modal>
    );
  };
  
  export default GenerateReportModal;
  