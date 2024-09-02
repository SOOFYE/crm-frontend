import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { fetchUsers } from '../../services/usersService';
import { useNavigate } from 'react-router-dom';

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
        searchField: ['firstname','lastname','username','phoneNumber']
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

  const columns = [
    { name: 'First Name', backend: 'firstname', selector: row => row.firstname, sortable: true },
    { name: 'Last Name', backend: 'lastname', selector: row => row.lastname, sortable: true },
    { name: 'Username', backend: 'username', selector: row => row.username, sortable: true },
    { name: 'Email', backend: 'email', selector: row => row.email, sortable: true },
    { name: 'Phone Number', backend: 'phoneNumber', selector: row => row.phoneNumber, sortable: true },
    { name: 'Password', backend: 'password', selector: row => row.password, sortable: true },
    { name: 'Role', backend: 'role', selector: row => row.role, sortable: true },
    
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
          onClick={() => navigate('/add-agent')} // Navigate to the add agent page
          className="bg-blue-500 text-white p-2 rounded"
        >
          Add Agents
        </button>
      </div>
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
      />
    </div>
  );
};

export default ViewUsers;