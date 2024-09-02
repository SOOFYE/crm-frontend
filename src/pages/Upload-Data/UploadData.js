import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { useNavigate } from 'react-router-dom';
import { fetchCampaignDataInfo } from '../../services/dataService';
import { getSignedUrl } from '../../services/signedUrlService';
import moment from 'moment';  // Import moment for date formatting
import Chip from '../../components/Chip';

const UploadData = () => {
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
      loadCampaignData();
    }, [page, perPage, sortField, sortDirection, searchKey]);
  
    const loadCampaignData = async () => {
      setLoading(true);
      try {
        const data = await fetchCampaignDataInfo({
          page,
          limit: perPage,
          searchKey,
          orderBy: sortField,
          orderDirection: sortDirection.toUpperCase(),
          searchField: ['name']
        });
        console.log(data)
        setData(data.data);
        setTotalRows(data.total);
      } catch (error) {
        console.error('Error fetching campaign data:', error);
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

    const renderStatusBadge = (status) => {
        let color = 'default';
        switch (status) {
          case 'success':
            color = 'success';
            break;
          case 'failed':
            color = 'danger';
            break;
          case 'pending':
            color = 'warning';
            break;
          default:
            return '-';
        }
    
        return <Chip color={color} status={status}/>
      };

      const handleDownload = async (s3Url) => {
        try {
          const response = await getSignedUrl(s3Url);
          const signedUrl = response;
          window.open(signedUrl, '_blank'); // Open the signed URL to initiate the download
        } catch (error) {
          console.error('Error generating signed URL:', error);
        }
      };
  
    const columns = [
      { name: 'Name', backend: 'name', selector: row => row?.name || '-', sortable: true, },
      { 
        name: 'Original Data', 
        width: '100px',
        selector: row => row?.s3Url || '-', 
        cell: row => (
          <span 
            onClick={() => handleDownload(row?.s3Url)} 
            className="text-blue-500 hover:cursor-pointer hover:underline"
          >
            Download
          </span>
        ),
        sortable: false 
      },
      { 
        name: 'Preprocessed Data', 
        width: '100px',
        selector: row => row?.preprocessedData?.s3Url || '-', 
        cell: row => row?.preprocessedData?.s3Url ? (
          <span 
            onClick={() => handleDownload(row?.preprocessedData?.s3Url)} 
            className="text-blue-500 cursor-pointer underline"
          >
            Download
          </span>
        ) : '-',
        sortable: false 
      },
      { 
        name: 'Processed Data Status', 
        width: '120px',
        selector: row => renderStatusBadge(row?.preprocessedData?.status || '-'), 
        sortable: false 
      },
    
      { 
        name: 'Duplicate Stats', 
        width: '100px',
        selector: row => row?.preprocessedData?.duplicateStatsS3Url || '-', 
        cell: row => row?.preprocessedData?.duplicateStatsS3Url ? (
          <span 
            onClick={() => handleDownload(row?.preprocessedData?.duplicateStatsS3Url)} 
            className="text-blue-500 cursor-pointer underline"
          >
            Download
          </span>
        ) : '-',
        sortable: false 
      },
      { 
        name: 'Repeated Data Stats', 
        width: '100px',
        selector: row => row?.preprocessedData?.replicatedStatsS3Url || '-', 
        cell: row => row?.preprocessedData?.replicatedStatsS3Url ? (
          <span 
            onClick={() => handleDownload(row?.preprocessedData?.replicatedStatsS3Url)} 
            className="text-blue-500 cursor-pointer underline"
          >
            Download
          </span>
        ) : '-',
        sortable: false 
      },
      { name: 'Campaign Type',width: '100px', selector: row => row?.campaignType?.name || '-', sortable: true },
      { 
        name: 'Created At', 
        backend: 'createdAt',
        selector: row => moment(row?.createdAt).format('MMMM Do YYYY, h:mm:ss a') || '-', 
        sortable: true 
      },
      { 
        name: 'Updated At', 
        backend: 'updatedAt',
        selector: row => moment(row?.updatedAt).format('MMMM Do YYYY, h:mm:ss a') || '-', 
        sortable: true 
      },
    ];
  
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Upload Campaign Data</h1>
        <div className="flex justify-between mb-4">
          <input
            type="text"
            placeholder="Search..."
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            className="border border-gray-300 p-2 rounded w-1/2"
          />
          <button
            onClick={() => navigate('/admin/upload-form')}
            className="bg-blue-500 text-white p-2 rounded"
          >
            Upload Data
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
        />
      </div>
    );
  };
  
  export default UploadData;