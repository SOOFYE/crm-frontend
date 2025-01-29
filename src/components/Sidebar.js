import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { AiOutlineMenu } from 'react-icons/ai'; // Hamburger icon for mobile
import INNOAXIS from '../assets/INNOAXIS.png'

import { FiLogOut } from 'react-icons/fi'; // Import the logout icon
import { useCookies } from 'react-cookie'; // To manage cookies for token
import { useNavigate } from 'react-router-dom'; // For navigation
import { toast } from 'react-toastify';


const Sidebar = () => {
  const { logout, user } = useContext(AuthContext); // Get user info from context
  const role = user.role; // Extract user role (admin/agent)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar toggle for mobile screens
  const [cookies, setCookie, removeCookie] = useCookies(['token']); // Manage cookies
  const navigate = useNavigate(); // Use navigate to redirect the user

  

  const handleLogout = () => {
    // Remove the token cookie to logout
    removeCookie('token', { path: '/' });
    
    // Redirect to login page
    navigate('/login');

    logout()

    // Optional: Display a toast or message to indicate successful logout
    toast.success('Successfully logged out!');
  };


  // Admin menu items
  const adminItems = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'User', path: '/admin/view-users' },
    { name: 'Attendance Management', path: '/admin/attendance-management' },
    { name: 'Campaign types', path: '/admin/view-campaign-types' },
    { name: 'Data Management', path: '/admin/upload-data' },
    { name: 'Campaign', path: '/admin/view-campaign' },
    { name: 'Form', path: '/admin/view-forms' },
    { name: 'Leads', path: '/admin/leads' },
  ];

  // Agent menu items
  const agentItems = [
    { name: 'Attendance', path: '/agent/attendance' },
    { name: 'Upload Leads', path: '/agent/leads' },
    // { name: 'Follow-ups', path: '/agent/follow-ups' },
    // { name: 'Profile', path: '/agent/profile' },
  ];

  // Use admin or agent items based on the role
  const items = role === 'admin' ? adminItems : agentItems;

  return (
    <div className="flex min-h-screen flex-col justify-between border-e bg-white">
      {/* Sidebar Top */}
      <div className="px-4 py-6">
      <span className="grid  h-10 w-32 place-content-center rounded-lg text-xs text-gray-600 transform transition-transform duration-300 hover:scale-110">
  <img src={INNOAXIS} alt="Logo"/>
    </span>

        <ul className="mt-10 space-y-1">
          {items.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className="block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-purple-600"
              >
                {item.name}
              </Link>
            </li>
          ))}

          {/* Example of Teams dropdown - common for both roles */}
          {/* <li>
            <details className="group [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
                <span className="text-sm font-medium">Teams</span>

                <span className="shrink-0 transition duration-300 group-open:-rotate-180">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </summary>

              <ul className="mt-2 space-y-1 px-4">
                <li>
                  <Link
                    to="#"
                    className="block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  >
                    Banned Users
                  </Link>
                </li>

                <li>
                  <Link
                    to="#"
                    className="block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  >
                    Calendar
                  </Link>
                </li>
              </ul>
            </details>
          </li> */}

          {/* Example of Account dropdown - common for both roles */}
          {/* <li>
            <details className="group [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
                <span className="text-sm font-medium">Account</span>

                <span className="shrink-0 transition duration-300 group-open:-rotate-180">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </summary>

              <ul className="mt-2 space-y-1 px-4">
                <li>
                  <Link
                    to="#"
                    className="block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  >
                    Details
                  </Link>
                </li>

                <li>
                  <Link
                    to="#"
                    className="block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  >
                    Security
                  </Link>
                </li>

                <li>
                  <form action="#">
                    <button
                      type="submit"
                      className="w-full rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    >
                      Logout
                    </button>
                  </form>
                </li>
              </ul>
            </details>
          </li> */}
        </ul>
      </div>

      {/* Sidebar Bottom - User Profile */}
      <div className="sticky inset-x-0 bottom-0 border-t border-gray-100 hover:text-red-500">
        <div
          className="flex items-center gap-2 bg-white p-4 hover:bg-gray-50 cursor-pointer "
          onClick={handleLogout} // Call the logout function on click
        >
          <FiLogOut className="h-6 w-6 text-gray-700 " /> {/* Logout Icon */}
          <div>
            <p className="text-xs">
              <strong className="block font-medium">Logout</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;