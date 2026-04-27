import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ClipboardList, Clock, ArrowRight } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';

const SdpDashboard = ({ stats, loading }) => {
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Total Requests',
      value: stats.totalRequests,
      icon: <ClipboardList className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      path: '/requests'
    },
    {
      title: 'Pending Requests',
      value: stats.pendingRequests,
      icon: <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />,
      path: '/requests?status=pending'
    },
    {
      title: 'Approved Requests',
      value: stats.approvedRequests,
      icon: <ArrowRight className="h-6 w-6 text-green-600 dark:text-green-400" />,
      path: '/requests?status=approved'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {cards.map((card) => (
          <DashboardCard
            key={card.title}
            title={card.title}
            value={loading ? '...' : card.value}
            icon={card.icon}
            onClick={() => navigate(card.path)}
          />
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
        <div className="space-y-4">
          <Link to="/requests" className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group">
            <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              <ClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="font-medium">Create New Request</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
          </Link>
          <Link to="/requests" className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group">
            <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="font-medium">View My Requests</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SdpDashboard;
