// ProcessedDataMetrics.js

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
import { fetchProcessedDataMetrics } from '../../services/dashboardService';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import { fetchCampaignDataIDList } from '../../services/campaignDataService';

// Register Chart.js components
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

const ProcessedDataMetrics = () => {
  const [processedDataOptions, setProcessedDataOptions] = useState([]);
  const [selectedProcessedData, setSelectedProcessedData] = useState(null);

  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    today.setMonth(today.getMonth() - 1);
    return today;
  });
  const [endDate, setEndDate] = useState(new Date());

  const [metrics, setMetrics] = useState(null);
  const [revenueOverTimeData, setRevenueOverTimeData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load processed data options when component mounts
  useEffect(() => {
    loadCampaignDataListAndIds();
  }, []);

  const loadCampaignDataListAndIds = async () => {
    try {
      const data = await fetchCampaignDataIDList();
      setProcessedDataOptions(
        data.map((list) => ({ value: list.id, label: list.name }))
      );
    } catch (error) {
      console.error('Failed to load processed data list:', error);
    }
  };

  // Fetch metrics when selectedProcessedData or date range changes
  useEffect(() => {
    if (selectedProcessedData) {
      if (startDate > endDate) {
        setError('Start date cannot be after end date.');
        return;
      } else {
        setError(null);
      }
      loadMetrics();
    }
  }, [selectedProcessedData, startDate, endDate]);

  const loadMetrics = async () => {
    setLoading(true);
    setError(null);

    try {
      const processedDataId = selectedProcessedData.value;
      const data = await fetchProcessedDataMetrics(
        processedDataId,
        startDate,
        endDate
      );
      setMetrics(data);

      // Prepare revenue over time data for the chart
      if (data.revenueOverTime) {
        const sortedData = data.revenueOverTime.sort(
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
      }
    } catch (err) {
      console.error('Failed to fetch processed data metrics:', err);
      setError('Failed to load processed data metrics.');
      setMetrics(null);
      setRevenueOverTimeData(null);
    } finally {
      setLoading(false);
    }
  };

  // Custom input component for DatePicker
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

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Processed Data Metrics</h1>

      {/* Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
        {/* Processed Data Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Processed Data
          </label>
          <Select
            options={processedDataOptions}
            placeholder="Select Processed Data"
            onChange={setSelectedProcessedData}
            isClearable
            styles={{
              control: (provided) => ({
                ...provided,
                marginTop: '0.25rem',
              }),
            }}
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="MMMM d, yyyy"
            customInput={<DateInput placeholder="Select start date" />}
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="MMMM d, yyyy"
            customInput={<DateInput placeholder="Select end date" />}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading Indicator */}
      {loading ? (
        <div className="text-center text-xl">Loading metrics...</div>
      ) : (
        selectedProcessedData &&
        metrics && (
          <>
            {/* Metrics Display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-base font-semibold">Total Revenue</h2>
                <p className="text-xl">
                  {metrics.totalRevenue !== null
                    ? `$${metrics.totalRevenue}`
                    : 'N/A'}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-base font-semibold">Total Leads</h2>
                <p className="text-xl">
                  {metrics.totalLeads !== null ? metrics.totalLeads : 'N/A'}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-base font-semibold">Approved Leads</h2>
                <p className="text-xl">
                  {metrics.approvedLeads !== null
                    ? metrics.approvedLeads
                    : 'N/A'}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-base font-semibold">Conversion Rate</h2>
                <p className="text-xl">
                  {metrics.conversionRate !== null
                    ? `${metrics.conversionRate.toFixed(2)}%`
                    : 'N/A'}
                </p>
              </div>
            </div>

            {/* Revenue Over Time Chart */}
            <div className="bg-white p-4 rounded-lg shadow mt-8 h-96">
              <h2 className="text-base font-semibold mb-4">
                Revenue Over Time
              </h2>
              {revenueOverTimeData ? (
                <div className="relative h-80">
                  <Line data={revenueOverTimeData} options={chartOptions} />
                </div>
              ) : (
                <p>No data available.</p>
              )}
            </div>
          </>
        )
      )}
    </div>
  );
};

export default ProcessedDataMetrics;
