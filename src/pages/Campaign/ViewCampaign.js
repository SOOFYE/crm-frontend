import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { customStyles } from '../../assets/table-styles';
import DropDown from '../../components/DropDownComp';
import { fetchCampaigns } from '../../services/campaignService';

const ViewCampaign = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchKey, setSearchKey] = useState('');
    const [page, setPage] = useState(1);
    const [totalRows, setTotalRows] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [sortField, setSortField] = useState('createdAt');
    const [sortDirection, setSortDirection] = useState('desc');
    const navigate = useNavigate();

    useEffect(() => {
        loadCampaigns();
    }, [page, perPage, sortField, sortDirection, searchKey]);

    const loadCampaigns = async () => {
        setLoading(true);
        try {
            const data = await fetchCampaigns({  // Implement this service function to fetch campaigns
                page,
                limit: perPage,
                // searchKey,
                // searchField:['name'],
                orderBy: sortField || 'createdAt',
                orderDirection: sortDirection.toUpperCase(),
            });
            setData(data.data);
            setTotalRows(data.total);
        } catch (error) {
            console.error('Error fetching campaigns:', error);
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
        // Logic to view campaign details
        navigate(`/admin/view-single-campaign/${row.id}`)
    };

    const handleDownloadData = (row) => {
        // Logic to download campaign data
        console.log('Downloading data for campaign', row.name);
    };

    const handleViewData = (row) => {
        // Logic to view campaign data
        console.log('Viewing data for campaign', row.name);
    };

    const handleDelete = (row) => {
        // Logic to delete campaign
        console.log('Deleting campaign', row.name);
    };

    const dropdownOptions = [
        { label: 'View', onClick: handleView },
        { label: 'Download Data', onClick: handleDownloadData },
        { label: 'View Data', onClick: handleViewData },
        { label: 'Delete', onClick: handleDelete },
    ];

    const columns = [
        { name: 'Name', backend: 'name', selector: row => row?.name || '-', sortable: true },
        { name: 'Description', backend: 'description', selector: row => row?.description || '-', sortable: true },
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
                    options={dropdownOptions}
                    row={row}
                />
            ),
            sortable: false,
        },
    ];

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">View Campaigns</h1>
            <div className="flex justify-between mb-4">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchKey}
                    onChange={(e) => setSearchKey(e.target.value)}
                    className="border border-gray-300 p-2 rounded w-1/2"
                />
                <button
                    onClick={() => navigate('/admin/create-campaign')}  // Adjust the path as needed
                    className="bg-blue-500 text-white p-2 rounded"
                >
                    Create Campaign
                </button>
            </div>
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
                customStyles={customStyles}
            />
        </div>
    );
};

export default ViewCampaign;