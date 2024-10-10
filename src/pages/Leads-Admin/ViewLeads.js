import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import moment from 'moment';
import { TABLEcustomStyles } from '../../styles/table-styles';
import { fetchLeads } from '../../services/leadService'; // Import the lead fetching service
import Select from 'react-select';
import DatePicker from 'react-datepicker';  // Add date picker for date ranges
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';

import { fetchUsers } from '../../services/usersService';
import { fetchCampaignIDList } from '../../services/campaignService';
import { fetchCampaignDataIDList } from '../../services/campaignDataService';

const ViewLeads = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
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


  const loadCampaignListAndIds = async ()=>{
    const data = await fetchCampaignIDList();
    console.log(data)
    setCampaignOptions(data.map(campaign => ({ value: campaign.id, label: `${campaign.name}` })));

  }


  const loadCampaignDataListAndIds = async ()=>{
    const data = await fetchCampaignDataIDList();
    console.log(data)
    setListOptions(data.map(list => ({ value: list.id, label: `${list.name}` })));

  }

  useEffect(() => {
    loadLeads();
    loadAgents();
    loadCampaignListAndIds();
    loadCampaignDataListAndIds();
  }, [page, perPage, sortField, sortDirection, selectedAgents, selectedStatuses, selectedCampaigns, selectedLists, dateRange, searchKey]);




  // Handle sorting
  const handleSort = (column, sortDirection) => {
    setSortField(column.backend);
    setSortDirection(sortDirection);
  };

  // Handle pagination
  const handlePageChange = (page) => setPage(page);

  const handlePerRowsChange = (newPerPage) => setPerPage(newPerPage);

  // Dropdown options for statuses
  const statusOptions = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'FAILED', label: 'Failed' },
    // Add other statuses
  ];


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
        <button
          onClick={() => navigate(`/admin/view-lead/${row.id}`)}
          className="bg-blue-500 text-white p-2 rounded"
        >
          View
        </button>
      ),
      sortable: false,
    },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">View Leads</h1>
      
      {/* Filters */}
      <div className="flex justify-between mb-4">
        <div className="w-1/5">
          <input
            type="text"
            placeholder="Search by phone number..."
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
          />
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
          customStyles={TABLEcustomStyles}
        />
      </div>
    </div>
  );
};

export default ViewLeads;