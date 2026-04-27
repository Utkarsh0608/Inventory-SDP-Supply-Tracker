import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ClipboardList, AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';
import ChartCard from '../components/ChartCard';
import DashboardCard from '../components/DashboardCard';

const AdminDashboard = ({ stats, loading }) => {
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Total Items',
      value: stats.totalItems,
      icon: <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      path: '/inventory'
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStock,
      icon: <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />,
      path: '/inventory?filter=low'
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

  const requestChartData = [
    { name: 'Pending', value: stats.pendingRequests, color: '#F59E0B' },
    { name: 'Approved', value: stats.approvedRequests, color: '#16A34A' },
    { name: 'Rejected', value: stats.rejectedRequests, color: '#DC2626' }
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6 h-full">
          <ChartCard title="Requests Overview" description="Review request status distribution for your admin workflow.">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={requestChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={4}
                  stroke="none"
                >
                  {requestChartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    borderRadius: 8,
                    borderColor: '#E5E7EB'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200 h-full">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
          <div className="space-y-4">
            <Link to="/inventory" className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group">
              <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="font-medium">Manage Inventory</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
            </Link>
            <Link to="/requests" className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group">
              <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                <ClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="font-medium">Review All Requests</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
