import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { TABLEcustomStyles } from '../../styles/table-styles';
import DropDown from '../../components/DropDownComp';
import { fetchCampaignTypes, deleteCampaignType } from '../../services/campaignTypeService';
import Modal from 'react-modal';
import { MODALcustomStyles } from '../../styles/react-modal-styles';
import { toast, Bounce } from 'react-toastify';

const ViewCampaignTypes = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchKey, setSearchKey] = useState('');
    const [page, setPage] = useState(1);
    const [totalRows, setTotalRows] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [sortField, setSortField] = useState('createdAt');
    const [sortDirection, setSortDirection] = useState('desc');
    const [showModal, setShowModal] = useState(false); // State for modal visibility
    const [selectedCampaignType, setSelectedCampaignType] = useState(null); // State to track the selected campaign type
    const navigate = useNavigate();

    useEffect(() => {
        loadCampaignTypes();
    }, [page, perPage, sortField, sortDirection, searchKey]);

    const loadCampaignTypes = async () => {
        setLoading(true);
        try {
            const data = await fetchCampaignTypes({
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
            console.error('Error fetching campaign types:', error);
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
        navigate(`/admin/single-campaign-type/${row.id}`);
    };

    const handleEdit = (row) => {
        navigate(`/admin/edit-campaign-type/${row.id}`);
    };

    const handleDelete = (row) => {
        setSelectedCampaignType(row); // Set the campaign type to be deleted
        setShowModal(true); // Show the confirmation modal
    };

    const confirmDelete = async () => {
        // try {
        //     await deleteCampaignType(selectedCampaignType.id); // Implement the delete service
        //     setShowModal(false); // Close the modal
        //     setSelectedCampaignType(null); // Clear selected campaign type
        //     toast.success('Campaign Type deleted successfully', {
        //         position: 'top-right',
        //         autoClose: 5000,
        //         hideProgressBar: false,
        //         closeOnClick: true,
        //         pauseOnHover: true,
        //         draggable: true,
        //         progress: undefined,
        //         theme: 'light',
        //         transition: Bounce,
        //     });
        //     loadCampaignTypes(); // Reload campaign types
        // } catch (error) {
        //     toast.error('Error deleting campaign type', {
        //         position: 'top-right',
        //         autoClose: 5000,
        //         hideProgressBar: false,
        //         closeOnClick: true,
        //         pauseOnHover: true,
        //         draggable: true,
        //         progress: undefined,
        //         theme: 'light',
        //         transition: Bounce,
        //     });
        //     console.error('Error deleting campaign type:', error);
        // }
    };

    const dropdownOptions = [
        { label: 'View', onClick: handleView },
        { label: 'Edit', onClick: handleEdit },
        { label: 'Delete', onClick: handleDelete },
    ];

    const columns = [
        { name: 'Name', backend: 'name', selector: (row) => row?.name || '-', sortable: true },
        { 
            name: 'Created At', 
            backend: 'createdAt', 
            selector: (row) => moment(row?.createdAt).format('MMMM Do YYYY, h:mm:ss a') || '-', 
            sortable: true 
        },
        { 
            name: 'Updated At', 
            backend: 'updatedAt', 
            selector: (row) => moment(row?.updatedAt).format('MMMM Do YYYY, h:mm:ss a') || '-', 
            sortable: true 
        },
        {
            name: 'Actions',
            cell: (row) => (
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
            <h1 className="text-2xl font-bold mb-4">View Campaign Types</h1>
            <div className="flex justify-between mb-4">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchKey}
                    onChange={(e) => setSearchKey(e.target.value)}
                    className="border border-gray-300 p-2 rounded w-1/2"
                />
                <button
                    onClick={() => navigate('/admin/create-campaign-types')}
                    className="bg-blue-500 text-white p-2 rounded"
                >
                    Create Campaign Type
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
                <p>Are you sure you want to delete the campaign type <strong>{selectedCampaignType?.name}</strong>?</p>
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

export default ViewCampaignTypes;