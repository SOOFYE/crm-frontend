import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Card, Button } from '@nextui-org/react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const { user } = useContext(AuthContext); // Get user info from context
  const role = user.role; // Extract user role (admin/agent), assuming roles is an array

  const adminItems = [
    { name: 'Users', path: '/admin/view-users' },
    { name: 'Campaign Data', path: '/admin/upload-data' },
    { name: 'Create Campaigns', path: '/admin/reports' },
  ];

  const agentItems = [
    { name: 'Leads', path: '/agent/leads' },
    { name: 'Follow-ups', path: '/agent/follow-ups' },
    { name: 'Profile', path: '/agent/profile' },
  ];

  const items = role === 'admin' ? adminItems : agentItems;

  return (
    <Card className="h-screen w-64 p-4 bg-gray-800 text-white">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Dashboard</h2>
      </div>
      <ul>
        {items.map((item, index) => (
          <li key={index} className="mb-4">
            <Link to={item.path}>
              <Button light className="w-full text-left text-white">
                {item.name}
              </Button>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default Sidebar;