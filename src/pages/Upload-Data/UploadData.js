import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { useNavigate } from 'react-router-dom';
import { fetchOriginalDataInfo } from '../../services/originalDataService';
import { getSignedUrl } from '../../services/signedUrlService';
import moment from 'moment';  // Import moment for date formatting
import Chip from '../../components/Chip';
import { TABLEcustomStyles } from '../../styles/table-styles';
import CampaignLinkModal from '../../components/Upload-Data/CampaingLinkModal';
import { fetchCampaignIDList } from '../../services/campaignService';
import DropDown from '../../components/DropDownComp';
import { linkCampaign, unLinkCampaign, deleteOriginalData } from '../../services/originalDataService';
import { toast, Bounce } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert'; // Import the confirm alert library
import 'react-confirm-alert/src/react-confirm-alert.css';


const UploadData = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchKey, setSearchKey] = useState('');
    const [page, setPage] = useState(1);
    const [totalRows, setTotalRows] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [sortField, setSortField] = useState('createdAt');
    const [sortDirection, setSortDirection] = useState('desc');
    const [selectedRow, setSelectedRow] = useState(null);
    const [campaigns, setCampaigns] = useState([]); // State to store campaigns fetched from the backend
    const [modalOpen, setModalOpen] = useState(false);
    const navigate = useNavigate();
  
    useEffect(() => {
      loadCampaignData();
      loadCampaignList()
    }, [page, perPage, sortField, sortDirection, searchKey]);

    const loadCampaignList = async ()=>{
      try{

        const data = await fetchCampaignIDList()
        setCampaigns(data)

      }catch(error){

      }
    }
  
    const loadCampaignData = async () => {
      setLoading(true);
      try {
        const data = await fetchOriginalDataInfo({
          page,
          limit: perPage,
          searchKey,
          orderBy: sortField,
          orderDirection: sortDirection.toUpperCase(),
          searchField: ['name'],
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

    const handleLinkToCampaign = (row) => {
      setSelectedRow(row);
      setModalOpen(true);
  };

  const handleUnlinkCampaign = async (row) => {
    try{
      await unLinkCampaign(row.preprocessedData.id)
      toast.success("Data unlinked from campaign", {
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
    }catch(error){
      toast.error(error.response.data.error || 'Failed to unlink campaign.', {
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
      loadCampaignData()
    }
      console.log('Unlinking campaign for', row.name);
  };

  const handleSubmitCampaignLink = async (selectedCampaign) => {
      try{
      console.log('Linking campaign', selectedCampaign, 'to', selectedRow.name);
      await linkCampaign(selectedRow.preprocessedData.id,selectedCampaign.id)
      toast.success("Data linked to campaign", {
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
      loadCampaignData(); // Refresh data
      }catch(error){
        toast.error(error.response.data.error || 'Failed to link campaign.', {
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
      }
  };

  const handleDelete = async (row) => {
    // Trigger the confirmation alert
    confirmAlert({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this data?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              await deleteOriginalData(row.id);
              toast.success('Data deleted successfully.', {
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
              loadCampaignData();
            } catch (error) {
              toast.error(error.response.data.error || 'Failed to delete data.', {
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
            }
          },
        },
        {
          label: 'No',
        },
      ],
    });
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
            color = 'default';
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


      const dropdownOptions = [
        { label: 'Delete', onClick: handleDelete },
    ];
  
    const columns = [
      { name: 'Name', backend: 'name', selector: row => row?.name || '-', sortable: true, },
      { 
        name: 'Original Data', 
        
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
       
        selector: row => renderStatusBadge(row?.preprocessedData?.status || '-'), 
        sortable: false 
      },
    
      { 
        name: 'Duplicate Stats', 
       
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
      { name: 'Campaign Type', selector: row => row?.campaignType?.name || '-', sortable: true },
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

<CampaignLinkModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmitCampaignLink}
                campaigns={campaigns}
            />

      </div>
    );
  };
  
  export default UploadData;