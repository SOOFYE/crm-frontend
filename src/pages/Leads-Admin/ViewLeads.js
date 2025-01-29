import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import moment from 'moment';
import { TABLEcustomStyles } from '../../styles/table-styles';
import { fetchLeads, updateLeadStatus } from '../../services/leadService'; // Import the lead fetching service
import Select from 'react-select';
import DatePicker from 'react-datepicker';  // Add date picker for date ranges
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';

import { fetchUsers } from '../../services/usersService';
import { fetchCampaignIDList } from '../../services/campaignService';
import { fetchCampaignDataIDList } from '../../services/campaignDataService';

import { FaSearch } from 'react-icons/fa'; 

import DropDown from '../../components/DropDownComp';

import { toast } from 'react-toastify';

import GenerateReportModal from './GenerateReportModal'; // Adjust the path as needed


const ViewLeads = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [selectedRows, setSelectedRows] = useState([]); // State for selected rows
  const [perPage, setPerPage] = useState(10);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchKey, setSearchKey] = useState('');

  const [selectedAgents, setSelectedAgents] = useState([]);
  const [agentOptions, setAgentOptions] = useState([]);

  const [selectedStatuses, setSelectedStatuses] = useState([]);

  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  const [campaignOptions, setCampaignOptions] = useState([]);

  const [selectedLists, setSelectedLists] = useState([]);
  const [listOptions, setListOptions] = useState([]);

  const [dateRange, setDateRange] = useState([null, null]); // State for date range
  const [startDate, endDate] = dateRange;
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);


  // Load leads with filtering and sorting
  const loadLeads = async () => {
    setLoading(true);
    try {
      const result = await fetchLeads({
        paginatedOptions: {
          page,
          limit: perPage,
          searchKey,
          searchField: ['phoneNumber'],
          orderBy: sortField || 'createdAt',
          orderDirection: sortDirection.toUpperCase(),
        },
        agents: selectedAgents.map(agent => agent.value),
        statuses: selectedStatuses.map(status => status.value),
        campaignIds: selectedCampaigns.map(campaign => campaign.value),
        lists: selectedLists.map(list => list.value),
        dateRange: {
          start: startDate ? startDate.toISOString() : undefined,
          end: endDate ? endDate.toISOString() : undefined,
        },
      });
      console.log(result)
      setData(result.data);
      setTotalRows(result.total);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAgents = async () => {
    const data = await fetchUsers({
      page: 1,
      limit: 999999,
      searchField: ['firstname', 'lastname', 'username', 'phoneNumber'],
      filters: { role: 'agent' },
    });
    const agents = data.data;
    setAgentOptions(agents.map(agent => ({ value: agent.id, label: `${agent.username} - ${agent.firstname} ${agent.lastname}` })));
  };

  const loadCampaignListAndIds = async ()=> {
    const data = await fetchCampaignIDList();
    console.log(data);
    setCampaignOptions(data.map(campaign => ({ value: campaign.id, label: `${campaign.name}` })));
  };

  const loadCampaignDataListAndIds = async ()=> {
    const data = await fetchCampaignDataIDList();
    console.log(data);
    setListOptions(data.map(list => ({ value: list.id, label: `${list.name}` })));
  };

  // Trigger loading leads only on filters change, excluding searchKey
  useEffect(() => {
    loadLeads();
    loadAgents();
    loadCampaignListAndIds();
    loadCampaignDataListAndIds();
  }, [page, perPage, sortField, sortDirection, selectedAgents, selectedStatuses, selectedCampaigns, selectedLists, dateRange]);

  // Handle sorting
  const handleSort = (column, sortDirection) => {
    setSortField(column.backend);
    setSortDirection(sortDirection);
  };

  // Handle pagination
  const handlePageChange = (page) => setPage(page);

  const handlePerRowsChange = (newPerPage) => setPerPage(newPerPage);

  // Handle search trigger on button click
  const handleSearch = () => {
    loadLeads();  // Trigger lead loading when search button is clicked
  };


  const handleView = (row)=>{
    navigate(`/admin/view-lead/${row.id}`)
  }

  const handleEdit = (row)=>{
    navigate(`/admin/edit-lead/${row.id}`)
  }

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      // Use the `updateLead` function from the service to update the status
      const updatedLead = await updateLeadStatus(leadId, { status: newStatus });
      toast.success(`Lead status updated to ${newStatus}`);
      // Optionally, refresh the leads data
      loadLeads();
    } catch (error) {
      console.error(`Error updating lead status to ${newStatus}:`, error);
      toast.error(`Failed to update lead status to ${newStatus}`);
    }
  };
  
  const handlePendingChange = (row) => {
    handleStatusChange(row.id, 'pending');
  };
  
  const handleApprovedChange = (row) => {
    handleStatusChange(row.id, 'approved');
  };
  
  const handleRejectedChange = (row) => {
    handleStatusChange(row.id, 'rejected');
  };
  
  const handleActiveChange = (row) => {
    handleStatusChange(row.id, 'active');
  };

  const handleRowSelected = (rows) => {
    setSelectedRows(rows.selectedRows); // Update state with selected rows
  };

  // Dropdown options for statuses
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'active', label: 'In-Active' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    // Add other statuses
  ];

  const handleCopyFormData = (rows) => {
    const formattedData = rows
      .map(row => {
        // Process each formData field
        return Object.keys(row.formData).map(key => {
          const fieldData = row.formData[key];
  
          // Handle checkbox/radio with selectedOptions and Other
          if (typeof fieldData === 'object' && fieldData !== null) {
            const { selectedOptions = [], Other } = fieldData;
            // Combine selectedOptions into a comma-separated string
            const values = [...selectedOptions.filter(opt => opt !== 'Other')]; // Exclude "Other" from selectedOptions
            
            // If Other exists, add it to the values
            if (Other && Other.trim()) {
              values.push(Other);
            }
            return values.join(', '); // Return the comma-separated values
          }
  
          // For non-object fields (text, etc.), just return the value
          return fieldData || ''; 
        }).join('\t'); // Use tab (\t) to separate each field for new cells in CSV format
      })
      .join('\n'); // Separate rows with a new line
  
    navigator.clipboard.writeText(formattedData)
      .then(() => toast.success('Form data for selected rows copied to clipboard!'))
      .catch(err => toast.error('Failed to copy form data'));
  };
  
  const dropdownOptions = [
    { label: 'View', onClick: handleView },
    { label: 'Edit', onClick: handleEdit },
    { label: 'Mark Pending', onClick: handlePendingChange },
    { label: 'Mark Approved', onClick: handleApprovedChange },
    { label: 'Mark Rejected', onClick: handleRejectedChange },
    { label: 'Mark Active', onClick: handleActiveChange },
    { label: 'Copy Form Data', onClick: handleCopyFormData }, 
  ];



  const getFilteredOptions = (currentStatus) => {
    return dropdownOptions.filter(option => {
      let st = option.label.toLowerCase()
      // Don't show the option corresponding to the current status
      if (st.includes(currentStatus)) {
        return false; // Exclude the option that matches the current status
      }
      return true; // Show other options
    });
  };



  const columns = [
    { name: 'Phone Number', backend: 'phoneNumber', selector: row => row?.phoneNumber || '-', sortable: true },
    { name: 'Agent', backend: 'agent.username', selector: row => row?.agent?.username || '-', sortable: true },
    { name: 'Status', backend: 'status', selector: row => row?.status || '-', sortable: true },
    { 
      name: 'Created At', 
      backend: 'createdAt', 
      selector: row => moment(row?.createdAt).format('MMMM Do YYYY, h:mm:ss a') || '-', 
      sortable: true 
    },
    {
      name: 'Actions',
      cell: row => (
<DropDown 
                   options={getFilteredOptions(row.status)} 
                    row={row}
                />
      ),
      sortable: false,
    },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">View Leads</h1>


      <button
  onClick={() => setIsModalOpen(true)}
  className="bg-green-500 text-white py-2 px-4 rounded mb-4"
>
  Generate Report
</button>

<GenerateReportModal
  isOpen={isModalOpen}
  onRequestClose={() => setIsModalOpen(false)}
  campaignOptions={campaignOptions} // Pass the available campaigns
/>


      
      {/* Filters */}
      <div className="md:flex sm:grid sm:grid-cols-1 sm:gap-3 justify-between mb-4">
        <div className="flex">
          <input
            type="text"
            placeholder="Search by phone number..."
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
          />
<button 
  onClick={handleSearch} 
  className="bg-white-500 text-white p-1 rounded ml-2 mr-2 flex items-center justify-center"
>
  <FaSearch size={16} color='gray' /> {/* Search icon with size 16 */}
</button>
        </div>
        <div className="w-1/5 mx-2">
          <Select
            isMulti
            options={agentOptions}
            placeholder="Filter by Agent"
            onChange={setSelectedAgents}
          />
        </div>
        <div className="w-1/5 mx-2">
          <Select
            isMulti
            options={statusOptions}
            placeholder="Filter by Status"
            onChange={setSelectedStatuses}
          />
        </div>
        <div className="w-1/5 mx-2">
          <Select
            isMulti
            options={campaignOptions}
            placeholder="Filter by Campaign"
            onChange={setSelectedCampaigns}
          />
        </div>
        <div className="w-1/5 mx-2">
          <Select
            isMulti
            options={listOptions}
            placeholder="Filter by Lists"
            onChange={setSelectedLists}
          />
        </div>
        <div className="w-1/4">
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
            isClearable
            placeholderText="Filter by Date Range"
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>
      </div>

      {selectedRows.length > 0 && (
        <button
          onClick={() => handleCopyFormData(selectedRows)}
          className="bg-blue-500 text-white py-2 px-4 rounded mb-4"
        >
          Copy Selected Rows
        </button>
      )}

      {/* DataTable */}
      <div className="overflow-x-auto">
        <DataTable
          columns={columns}
          data={data}
          progressPending={loading}
          pagination
          paginationServer
          paginationTotalRows={totalRows}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handlePerRowsChange}
          sortServer
          onSort={handleSort}
          highlightOnHover
          pointerOnHover
          selectableRows
          onSelectedRowsChange={handleRowSelected}
          customStyles={TABLEcustomStyles}
        />
      </div>
    </div>
  );
};

export default ViewLeads;
