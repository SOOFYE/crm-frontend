import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { fetchUsers, deleteUser } from '../../services/usersService';
import { useNavigate } from 'react-router-dom';
import { TABLEcustomStyles } from '../../styles/table-styles';
import DropDown from '../../components/DropDownComp';
import Modal from 'react-modal';
import { MODALcustomStyles } from '../../styles/react-modal-styles';
import { toast, Bounce } from 'react-toastify';


const ViewUsers = () => {
  const [selectedUser,setSelectedUser] = useState()
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKey, setSearchKey] = useState('');
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [sortField, setSortField] = useState('firstname');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showModal, setShowModal] = useState(false); // State for modal visibility
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
        filters: { role: 'agent' },
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

  // Function to handle viewing user details
  const handleView = (row) => {
    navigate(`/admin/view-user/${row.id}`);
  };

  // Function to handle editing user details
  const handleEdit = (row) => {
    navigate(`/admin/edit-user/${row.id}`);
  };

  // Function to handle deleting a user
  const handleDelete = (row) => {
    setSelectedUser(row); // Set the campaign to be deleted
    setShowModal(true); // Show the confirmation modal
  };

  const confirmDelete = async () => {
    try {
        await deleteUser(selectedUser.id); // Implement the delete service
        setShowModal(false); // Close the modal
        setSelectedUser(null); // Clear selected campaign
        toast.success('User deleted successfully', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Bounce,
          });
        loadUsers(); // Reload campaigns
    } catch (error) {
        toast.error('Error deleting user', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Bounce,
          });
        console.error('Error deleting campaign:', error);
    }
};

  const dropdownOptions = [
    { label: 'View', onClick: handleView },
    { label: 'Edit', onClick: handleEdit },
    { label: 'Delete', onClick: handleDelete },
  ];

  const columns = [
    { name: 'First Name', backend: 'firstname', selector: row => row.firstname, sortable: true },
    { name: 'Last Name', backend: 'lastname', selector: row => row.lastname, sortable: true },
    { name: 'Username', backend: 'username', selector: row => row.username, sortable: true },
    { name: 'Email', backend: 'email', selector: row => row.email, sortable: true },
    { name: 'Phone Number', backend: 'phoneNumber', selector: row => row.phoneNumber, sortable: true },
    { name: 'Role', backend: 'role', selector: row => row.role, sortable: true },
    {
      name: 'Actions',
      cell: row => (
        <DropDown
          options={dropdownOptions}
          row={row}
        />
      ),
      sortable: false,
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
          Add User
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
       {/* Confirmation Modal */}
       <Modal
                isOpen={showModal}
                onRequestClose={() => setShowModal(false)}
                contentLabel="Confirm Deletion"
                ariaHideApp={false}
                style={MODALcustomStyles}
            >
                <h2 className="text-xl font-bold">Confirm Deletion</h2>
                <p>Are you sure you want to delete this user:  <strong>{selectedUser?.firstname + " " + selectedUser?.lastname  }</strong>?</p>
                <div className="flex justify-end mt-4">
                    <button
                        onClick={() => setShowModal(false)}
                        className="bg-gray-300 text-black px-4 py-2 mr-2 rounded"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={confirmDelete}
                        className="bg-red-500 text-white px-4 py-2 rounded"
                    >
                        Delete
                    </button>
                </div>
            </Modal>
    </div>
  );
};

export default ViewUsers;