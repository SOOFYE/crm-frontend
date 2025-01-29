import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { fetchUsers } from '../../services/usersService';
import { useNavigate } from 'react-router-dom';
import { TABLEcustomStyles } from '../../styles/table-styles';
import DropDown from '../../components/DropDownComp'; // Import the DropDown component

const ViewUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKey, setSearchKey] = useState('');
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [sortField, setSortField] = useState('firstname');
  const [sortDirection, setSortDirection] = useState('asc');
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, [page, perPage, sortField, sortDirection, searchKey]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchUsers({
        page,
        limit: perPage,
        searchKey,
        orderBy: sortField,
        orderDirection: sortDirection.toUpperCase(),
        searchField: ['firstname', 'lastname', 'username', 'phoneNumber'],
        filters: {
          role: 'agent',
        },
      });
      setUsers(data.data);
      setTotalRows(data.total);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setPage(page);
  };

  const handlePerRowsChange = (newPerPage) => {
    setPerPage(newPerPage);
  };

  const handleSort = (column, sortDirection) => {
    setSortField(column.backend);
    setSortDirection(sortDirection);
  };

  // Dropdown actions
  const handleView = (row) => {
    navigate(`/admin/view-single-user/${row.id}`);
  };

  const handleEdit = (row) => {
    navigate(`/admin/edit-user/${row.id}`);
  };

  const dropdownOptions = [
    { label: 'View', onClick: handleView },
    { label: 'Edit', onClick: handleEdit },
  ];

  const columns = [
    { name: 'First Name', backend: 'firstname', selector: row => row.firstname, sortable: true },
    { name: 'Last Name', backend: 'lastname', selector: row => row.lastname, sortable: true },
    { name: 'Username', backend: 'username', selector: row => row.username, sortable: true },
    { name: 'Email', backend: 'email', selector: row => row.email, sortable: true },
    { name: 'Phone Number', backend: 'phoneNumber', selector: row => row.phoneNumber, sortable: true },

    // Actions column
    {
      name: 'Actions',
      cell: row => (
        <DropDown 
          options={dropdownOptions}
          row={row}
        />
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">View Users</h1>
      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          className="border border-gray-300 p-2 rounded w-1/2"
        />
        <button
          onClick={() => navigate('/admin/add-users')} // Navigate to the add user page
          className="bg-blue-500 text-white p-2 rounded"
        >
          Add Users
        </button>
      </div>
      <div className="overflow-x-auto">
        <DataTable
          columns={columns}
          data={users}
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

export default ViewUsers;
