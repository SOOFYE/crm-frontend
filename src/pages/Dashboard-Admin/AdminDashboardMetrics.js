// AdminDashboardMetrics.js

import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  TimeScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import {
  fetchTotalLeads,
  fetchExpectedRevenue,
  fetchSecuredRevenue,
  fetchInactiveLeads,
  fetchLeadsOverTime,
  fetchRevenueOverTime,
} from '../../services/dashboardService';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import { fetchCampaignIDList } from '../../services/campaignService';

// Register the Chart.js components
ChartJS.register(
  CategoryScale,
  TimeScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboardMetrics = () => {
  // State variables
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    today.setMonth(today.getMonth() - 1); // Default to one month ago
    return today;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [campaignId, setCampaignId] = useState(null); // Optional campaign filter

  const [totalLeads, setTotalLeads] = useState(null);
  const [expectedRevenue, setExpectedRevenue] = useState(null);
  const [securedRevenue, setSecuredRevenue] = useState(null);
  const [inactiveLeads, setInactiveLeads] = useState(null);

  const [leadsOverTimeData, setLeadsOverTimeData] = useState(null);
  const [revenueOverTimeData, setRevenueOverTimeData] = useState(null);

  const [campaignOptions, setCampaignOptions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCampaignListAndIds();
  }, []);

  // Effect hook to load metrics when dependencies change
  useEffect(() => {
    // Validate dates
    if (startDate > endDate) {
      setError('Start date cannot be after end date.');
      return;
    } else {
      setError(null);
    }
    loadMetrics();
  }, [startDate, endDate, campaignId]);

  // Function to load metrics
  const loadMetrics = async () => {
    setLoading(true);
    setError(null);

    const campaignIdValue = campaignId ? campaignId.value : null;

    try {
      // Fetch all data in parallel
      const [
        totalLeadsResult,
        expectedRevenueResult,
        securedRevenueResult,
        inactiveLeadsResult,
        leadsOverTimeResult,
        revenueOverTimeResult,
      ] = await Promise.allSettled([
        fetchTotalLeads(campaignIdValue, startDate, endDate),
        fetchExpectedRevenue(campaignIdValue, startDate, endDate),
        fetchSecuredRevenue(campaignIdValue, startDate, endDate),
        fetchInactiveLeads(campaignIdValue, startDate, endDate),
        fetchLeadsOverTime(startDate, endDate, 'day', campaignIdValue),
        fetchRevenueOverTime(startDate, endDate, 'day', campaignIdValue),
      ]);

      // Handle each result individually

      // Total Leads
      if (totalLeadsResult.status === 'fulfilled') {
        setTotalLeads(totalLeadsResult.value);
      } else {
        console.error('Failed to fetch total leads:', totalLeadsResult.reason);
        setTotalLeads('N/A');
      }

      // Expected Revenue
      if (expectedRevenueResult.status === 'fulfilled') {
        setExpectedRevenue(expectedRevenueResult.value);
      } else {
        console.error('Failed to fetch expected revenue:', expectedRevenueResult.reason);
        setExpectedRevenue('N/A');
      }

      // Secured Revenue
      if (securedRevenueResult.status === 'fulfilled') {
        setSecuredRevenue(securedRevenueResult.value);
      } else {
        console.error('Failed to fetch secured revenue:', securedRevenueResult.reason);
        setSecuredRevenue('N/A');
      }

      // Inactive Leads
      if (inactiveLeadsResult.status === 'fulfilled') {
        setInactiveLeads(inactiveLeadsResult.value);
      } else {
        console.error('Failed to fetch inactive leads:', inactiveLeadsResult.reason);
        setInactiveLeads('N/A');
      }

      // Leads Over Time
      if (leadsOverTimeResult.status === 'fulfilled') {
        // Sort data by date
        const sortedData = leadsOverTimeResult.value.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );

        setLeadsOverTimeData({
          labels: sortedData.map((item) => item.date),
          datasets: [
            {
              label: 'Leads',
              data: sortedData.map((item) => item.totalLeads),
              fill: false,
              borderColor: '#3498db',
              backgroundColor: '#3498db',
            },
          ],
        });
      } else {
        console.error('Failed to fetch leads over time:', leadsOverTimeResult.reason);
        setLeadsOverTimeData(null);
      }

      // Revenue Over Time
      if (revenueOverTimeResult.status === 'fulfilled') {
        // Sort data by date
        const sortedData = revenueOverTimeResult.value.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );

        setRevenueOverTimeData({
          labels: sortedData.map((item) => item.date),
          datasets: [
            {
              label: 'Revenue',
              data: sortedData.map((item) => item.totalRevenue),
              fill: false,
              borderColor: '#2ecc71',
              backgroundColor: '#2ecc71',
            },
          ],
        });
      } else {
        console.error('Failed to fetch revenue over time:', revenueOverTimeResult.reason);
        setRevenueOverTimeData(null);
      }
    } catch (err) {
      console.error('An unexpected error occurred:', err);
      setError('An unexpected error occurred while loading metrics.');
    } finally {
      setLoading(false);
    }
  };

  const loadCampaignListAndIds = async () => {
    try {
      const data = await fetchCampaignIDList();
      setCampaignOptions(
        data.map((campaign) => ({ value: campaign.id, label: `${campaign.name}` }))
      );
    } catch (error) {
      console.error('Failed to load campaign list:', error);
    }
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day', // Adjust the unit based on the grouping (day, week, month)
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  const DateInput = React.forwardRef(({ value, onClick, placeholder }, ref) => (
    <button
      type="button"
      className="mt-1 w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      onClick={onClick}
      ref={ref}
    >
      {value || placeholder}
    </button>
  ));

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {/* Date Pickers and Campaign ID Input */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-4">
        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="MMMM d, yyyy"
            customInput={<DateInput placeholder="Select start date" />}
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="MMMM d, yyyy"
            customInput={<DateInput placeholder="Select end date" />}
          />
        </div>

        {/* Campaign ID Filter (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Campaign</label>
          <Select
            options={campaignOptions}
            placeholder="Filter by Campaign"
            onChange={setCampaignId}
            isClearable
            styles={{
              control: (provided) => ({
                ...provided,
                marginTop: '0.25rem',
              }),
            }}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">{error}</div>
      )}

      {/* Loading Indicator */}
      {loading ? (
        <div className="text-center text-xl">Loading metrics...</div>
      ) : (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-base font-semibold">Total Leads</h2>
              <p className="text-xl">{totalLeads !== null ? totalLeads : 'N/A'}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-base font-semibold">Expected Revenue</h2>
              <p className="text-xl">
                {expectedRevenue !== null ? `$${expectedRevenue}` : 'N/A'}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-base font-semibold">Secured Revenue</h2>
              <p className="text-xl">
                {securedRevenue !== null ? `$${securedRevenue}` : 'N/A'}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-base font-semibold">Inactive Leads</h2>
              <p className="text-xl">
                {inactiveLeads !== null ? inactiveLeads : 'N/A'}
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
            <div className="bg-white p-4 rounded-lg shadow h-96">
              <h2 className="text-base font-semibold mb-4">Leads Over Time</h2>
              {leadsOverTimeData ? (
                <div className="relative h-80">
                  <Line data={leadsOverTimeData} options={chartOptions} />
                </div>
              ) : (
                <p>No data available.</p>
              )}
            </div>
            <div className="bg-white p-4 rounded-lg shadow h-96">
              <h2 className="text-base font-semibold mb-4">Revenue Over Time</h2>
              {revenueOverTimeData ? (
                <div className="relative h-80">
                  <Line data={revenueOverTimeData} options={chartOptions} />
                </div>
              ) : (
                <p>No data available.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboardMetrics;
