import React, { useState, useEffect } from 'react';
import { getHolidaysByMonth } from './services/holidayService'; // Import the service

const HolidayCalendar = () => {
  const [holidays, setHolidays] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1); // Default to the current month
  const [year, setYear] = useState(new Date().getFullYear()); // Default to the current year

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const data = await getHolidaysByMonth(month, year);
        setHolidays(data); // Set the holidays state
      } catch (error) {
        console.error('Failed to fetch holidays:', error);
      }
    };

    fetchHolidays();
  }, [month, year]);

  return (
    <div>
      <h2>Holidays in {month}/{year}</h2>
      <ul>
        {holidays.map((holiday) => (
          <li key={holiday.id}>
            {holiday.description} - {new Date(holiday.holidayDate).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HolidayCalendar;