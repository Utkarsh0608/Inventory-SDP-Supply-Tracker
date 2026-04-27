import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import requestService from '../services/requestService';
import inventoryService from '../services/inventoryService';
import { 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Loader2,
  Package,
  Trash2,
  AlertCircle,
  Calendar,
  User,
  ClipboardList
} from 'lucide-react';

const Requests = () => {
  const { user, isAdmin, isSDP } = useAuth();
  const [requests, setRequests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // New Request Form State
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({ item_id: '', quantity: 1 });

  useEffect(() => {
    fetchData();
  }, [isAdmin, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqData, invData] = await Promise.all([
        isAdmin ? requestService.getAllRequests(activeTab === 'all' ? '' : activeTab) : requestService.getMyRequests(),
        inventoryService.getAll()
      ]);
      setRequests(reqData);
      setInventory(invData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Could not load requests or inventory.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItemToRequest = () => {
    if (!currentItem.item_id || currentItem.quantity <= 0) return;
    
    const item = inventory.find(i => i.id === parseInt(currentItem.item_id));
    if (!item) return;

    // Check if already added
    if (selectedItems.find(si => si.item_id === item.id)) {
      alert("Item already added to this request.");
      return;
    }

    setSelectedItems([...selectedItems, { 
      item_id: item.id, 
      name: item.item_name, 
      quantity: currentItem.quantity 
    }]);
    setCurrentItem({ item_id: '', quantity: 1 });
  };

  const handleRemoveItemFromRequest = (itemId) => {
    setSelectedItems(selectedItems.filter(si => si.item_id !== itemId));
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      setError("Please add at least one item to the request.");
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        items: selectedItems.map(si => ({
          item_id: si.item_id,
          quantity: si.quantity
        }))
      };
      await requestService.create(payload);
      fetchData();
      setIsModalOpen(false);
      setSelectedItems([]);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create request.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header with Create Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isAdmin ? 'Supply Requests' : 'My Requests'}
        </h3>
        {isSDP && (
          <button
            onClick={() => {
              setIsModalOpen(true);
              setError('');
            }}
            className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Request
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      {isAdmin && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['all', 'pending', 'approved', 'rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize border transition-all ${
                activeTab === tab 
                  ? 'bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500 shadow-sm' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* Requests List */}
      <div className="grid grid-cols-1 gap-4">
        {requests.length > 0 ? (
          requests.map((request) => (
            <Link 
              key={request.id} 
              to={`/requests/${request.id}`}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Req #{request.id}</span>
                  {getStatusBadge(request.status)}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  {new Date(request.created_at).toLocaleDateString()}
                </p>
                {isAdmin && (
                  <div className="space-y-1 text-sm text-blue-600 dark:text-blue-400">
                    <p className="font-medium flex items-center">
                      <User className="h-3.5 w-3.5 mr-1" />
                      {request.sdp_name || `SDP ${request.sdp_id}`}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      {request.sdp_city}, {request.sdp_state} - {request.sdp_pincode}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                <div className="text-right">
                  <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">Items</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{request.items?.length || 0}</p>
                </div>
                <div className="p-2 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 rounded-lg transition-colors">
                  <Eye className="h-6 w-6" />
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="bg-white dark:bg-gray-800 py-16 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-center flex flex-col items-center">
            <ClipboardList className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No requests found.</p>
            {isSDP && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="mt-4 text-blue-600 dark:text-blue-400 font-bold hover:underline"
              >
                Create your first request
              </button>
            )}
          </div>
        )}
      </div>

      {/* New Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl animate-in zoom-in duration-200 overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create New Supply Request</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {error && (
                <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {error}
                </div>
              )}
              
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl space-y-4 border border-gray-100 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <Plus className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                  Add Items
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Select Item</label>
                    <select
                      value={currentItem.item_id}
                      onChange={(e) => setCurrentItem({...currentItem, item_id: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select an item...</option>
                      {inventory.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.item_name} (Avail: {item.quantity})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={currentItem.quantity}
                      onChange={(e) => setCurrentItem({...currentItem, quantity: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddItemToRequest}
                  className="w-full py-2 bg-white dark:bg-gray-800 border border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  Add to List
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <Package className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                  Items in this Request
                </h4>
                {selectedItems.length > 0 ? (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        <tr>
                          <th className="px-4 py-2 font-semibold">Item Name</th>
                          <th className="px-4 py-2 font-semibold">Quantity</th>
                          <th className="px-4 py-2 font-semibold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {selectedItems.map((si) => (
                          <tr key={si.item_id} className="dark:bg-gray-800">
                            <td className="px-4 py-3 text-gray-900 dark:text-white">{si.name}</td>
                            <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{si.quantity}</td>
                            <td className="px-4 py-3 text-right">
                              <button 
                                onClick={() => handleRemoveItemFromRequest(si.item_id)}
                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No items added yet.</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRequest}
                  disabled={submitting || selectedItems.length === 0}
                  className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center justify-center font-medium disabled:opacity-50 shadow-sm"
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// We also need a Detail page for requests, but for this step we'll stick to the list and creation.
export default Requests;
