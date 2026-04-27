import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import requestService from '../services/requestService';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Check,
  X,
  User,
  Calendar,
  Package,
  AlertCircle
} from 'lucide-react';

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      const data = await requestService.getById(id);
      setRequest(data);
    } catch (err) {
      console.error("Failed to fetch request:", err);
      setError("Could not load request details.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!window.confirm("Approve this request and deduct inventory?")) return;
    setActionLoading(true);
    setError('');
    try {
      await requestService.approve(id);
      await fetchRequest();
      // Optional: show success toast/message here if we had a toast system
    } catch (err) {
      console.error("Approval failed:", err);
      setError(err.response?.data?.detail || "Failed to approve request. Ensure sufficient stock is available.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm("Reject this request?")) return;
    setActionLoading(true);
    setError('');
    try {
      await requestService.reject(id);
      await fetchRequest();
    } catch (err) {
      console.error("Rejection failed:", err);
      setError("Failed to reject request.");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { 
          icon: <Clock className="h-5 w-5" />, 
          color: 'text-purple-600 dark:text-purple-400', 
          bg: 'bg-purple-50 dark:bg-purple-900/30', 
          label: 'Pending Approval' 
        };
      case 'approved':
        return { 
          icon: <CheckCircle2 className="h-5 w-5" />, 
          color: 'text-green-600 dark:text-green-400', 
          bg: 'bg-green-50 dark:bg-green-900/30', 
          label: 'Request Approved' 
        };
      case 'rejected':
        return { 
          icon: <XCircle className="h-5 w-5" />, 
          color: 'text-red-600 dark:text-red-400', 
          bg: 'bg-red-50 dark:bg-red-900/30', 
          label: 'Request Rejected' 
        };
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">Loading request details...</p>
      </div>
    );
  }

  if (error && !request) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-xl text-center max-w-md mx-auto mt-12 border border-red-100 dark:border-red-800">
        <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-900 dark:text-red-400 mb-2">Error Loading Request</h3>
        <p className="text-red-600 dark:text-red-300 font-medium mb-6">{error}</p>
        <button 
          onClick={() => navigate('/requests')} 
          className="px-6 py-2 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors font-bold"
        >
          Back to Requests
        </button>
      </div>
    );
  }

  const status = getStatusInfo(request.status);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Action Error Message */}
      {error && request && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600 dark:hover:text-red-300">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button 
          onClick={() => navigate('/requests')}
          className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Requests
        </button>
        
        {isAdmin && request.status === 'pending' && (
          <div className="flex gap-3">
            <button
              onClick={handleReject}
              disabled={actionLoading}
              className="flex items-center px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 font-medium"
            >
              <X className="h-4 w-4 mr-2" />
              Reject
            </button>
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              className="flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 font-medium shadow-sm"
            >
              <Check className="h-4 w-4 mr-2" />
              Approve
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Request # {request.id}</h3>
              <div className={`flex items-center px-3 py-1 rounded-full ${status.bg} ${status.color}`}>
                {status.icon}
                <span className="ml-2 text-sm font-bold">{status.label}</span>
              </div>
            </div>
            
            <div className="p-6">
              <h4 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Requested Items</h4>
              <div className="border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Item</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase text-center">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {request.items.map((item) => (
                      <tr key={item.item_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
                              <Package className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">{item.item_name || `Item #${item.item_id}`}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center text-gray-600 dark:text-gray-300 font-medium">
                          {item.quantity} units
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
            <h4 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-6">Request Metadata</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Requester ID</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">SDP User {request.sdp_id}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Submitted On</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {new Date(request.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
            <h4 className="text-blue-800 dark:text-blue-400 font-bold text-sm mb-2">Need Help?</h4>
            <p className="text-blue-600 dark:text-blue-300 text-xs leading-relaxed">
              If you have any questions regarding this request, please contact the central inventory administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetails;
