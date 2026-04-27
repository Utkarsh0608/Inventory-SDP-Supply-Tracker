import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AdminDashboard from './AdminDashboard';
import SdpDashboard from './SdpDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  const role = user?.role || localStorage.getItem('role');
  const isAdmin = role === 'admin';
  const isSdp = role === 'sdp';

  const [stats, setStats] = useState({
    totalItems: 0,
    lowStock: 0,
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!role) {
        setLoading(false);
        return;
      }

      try {
        const requestsRes = await api.get(isAdmin ? '/requests/all/' : '/requests/');
        const requests = requestsRes.data;

        const baseStats = {
          totalRequests: requests.length,
          pendingRequests: requests.filter(req => req.status === 'pending').length,
          approvedRequests: requests.filter(req => req.status === 'approved').length,
          rejectedRequests: requests.filter(req => req.status === 'rejected').length
        };

        if (isAdmin) {
          const inventoryRes = await api.get('/inventory/');
          const inventory = inventoryRes.data;

          setStats({
            ...baseStats,
            totalItems: inventory.length,
            lowStock: inventory.filter(item => item.is_low_stock).length
          });
        } else {
          setStats({
            ...baseStats,
            totalItems: 0,
            lowStock: 0
          });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [role, isAdmin]);

  if (!role) {
    return <div className="text-center text-gray-600 dark:text-gray-300">Unable to determine your role.</div>;
  }

  return (
    <div className="space-y-8">
      {isAdmin && <AdminDashboard stats={stats} loading={loading} />}
      {isSdp && <SdpDashboard stats={stats} loading={loading} />}
      {!isAdmin && !isSdp && <div className="text-center text-gray-600 dark:text-gray-300">Unknown role: {role}</div>}
    </div>
  );
};

export default Dashboard;
