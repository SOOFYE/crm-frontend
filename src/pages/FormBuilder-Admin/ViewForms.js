import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { TABLEcustomStyles } from '../../styles/table-styles'; 
import DropDown from '../../components/DropDownComp'; 
import { fetchForms, deleteForm } from '../../services/formBuilderService'; 
import Modal from 'react-modal';
import { MODALcustomStyles } from '../../styles/react-modal-styles';
import { toast, Bounce } from 'react-toastify';

const ViewForms = () => {
    const [data, setData] = useState([]); 
    const [loading, setLoading] = useState(true); 
    const [searchKey, setSearchKey] = useState('');
    const [page, setPage] = useState(1);
    const [totalRows, setTotalRows] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [sortField, setSortField] = useState('createdAt');
    const [sortDirection, setSortDirection] = useState('desc');
    const [showModal, setShowModal] = useState(false); 
    const [selectedForm, setSelectedForm] = useState(null); 
    const navigate = useNavigate();

    useEffect(() => {
        loadForms();
    }, [page, perPage, sortField, sortDirection, searchKey]);

    const loadForms = async () => {
        setLoading(true);
        try {
            const data = await fetchForms({
                page,
                limit: perPage,
                searchKey,
                searchField: ['name'],
                orderBy: sortField || 'createdAt',
                orderDirection: sortDirection.toUpperCase(),
            });
            setData(data.data);
            setTotalRows(data.total);
        } catch (error) {
            console.error('Error fetching forms:', error);
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

    const handleView = (row) => {
        navigate(`/admin/view-single-form/${row.id}`);
    };

    const handleEdit = (row) => {
        navigate(`/admin/edit-form/${row.id}`);
    };

    const handleDelete = (row) => {
        setSelectedForm(row); 
        setShowModal(true); 
    };

    const confirmDelete = async () => {
        try {
            await deleteForm(selectedForm.id); 
            setShowModal(false); 
            setSelectedForm(null); 
            toast.success('Form deleted successfully', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "light",
                transition: Bounce,
            });
            loadForms(); 
        } catch (error) {
            toast.error('Error deleting form', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "light",
                transition: Bounce,
            });
            console.error('Error deleting form:', error);
        }
    };

    const dropdownOptions = [
        { label: 'View', onClick: handleView },
        { label: 'Edit', onClick: handleEdit },
        { label: 'Delete', onClick: handleDelete },
    ];

    const columns = [
        { name: 'Name', backend: 'name', selector: row => row?.name || '-', sortable: true },
        { name: 'Created At', backend: 'createdAt', selector: row => moment(row?.createdAt).format('MMMM Do YYYY, h:mm:ss a') || '-', sortable: true },
        { name: 'Updated At', backend: 'updatedAt', selector: row => moment(row?.updatedAt).format('MMMM Do YYYY, h:mm:ss a') || '-', sortable: true },
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
            <h1 className="text-2xl font-bold mb-4">View Forms</h1>
            <div className="flex justify-between mb-4">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchKey}
                    onChange={(e) => setSearchKey(e.target.value)}
                    className="border border-gray-300 p-2 rounded w-1/2"
                />
                <button
                    onClick={() => navigate('/admin/create-form')}
                    className="bg-blue-500 text-white p-2 rounded"
                >
                    Create Form
                </button>
            </div>
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

            {/* Confirmation Modal */}
            <Modal
                isOpen={showModal}
                onRequestClose={() => setShowModal(false)}
                contentLabel="Confirm Deletion"
                ariaHideApp={false}
                style={MODALcustomStyles}
            >
                <h2 className="text-xl font-bold">Confirm Deletion</h2>
                <p>Are you sure you want to delete the form <strong>{selectedForm?.name}</strong>?</p>
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

export default ViewForms;