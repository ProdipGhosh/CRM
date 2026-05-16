import { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Completed', 'Cancelled'];

export default function Manufacturing() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const res = await api.get('/manufacturing-orders');
      setOrders(res.data.data);
    } catch {
      setError('Failed to load manufacturing orders.');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(orderId, newStatus) {
    setUpdatingId(orderId);
    setError('');
    setSuccess('');
    try {
      const res = await api.put(`/manufacturing-orders/${orderId}/status`, { status: newStatus });
      if (res.data.inventoryDeducted) {
        setSuccess(
          `✅ Order marked as Completed! Inventory automatically deducted for ${res.data.inventoryDeductionLog?.length || 0} material(s).`
        );
      } else {
        setSuccess(`Status updated to "${newStatus}"`);
      }
      await fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) return <Loader text="Loading manufacturing orders..." />;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Manufacturing Orders</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Track production. Setting status to <strong>Completed</strong> auto-deducts warehouse inventory.
        </p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4 text-sm">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mb-4 text-sm">{success}</div>}

      <div className="card overflow-hidden">
        {orders.length === 0 ? (
          <EmptyState title="No manufacturing orders" description="Convert a sales opportunity to create manufacturing orders." icon="🏭" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left table-header px-6 py-3">Order</th>
                  <th className="text-left table-header px-6 py-3">Product</th>
                  <th className="text-left table-header px-6 py-3 hidden md:table-cell">Qty</th>
                  <th className="text-left table-header px-6 py-3 hidden lg:table-cell">Customer</th>
                  <th className="text-left table-header px-6 py-3">Status</th>
                  <th className="text-left table-header px-6 py-3">Update Status</th>
                  <th className="text-left table-header px-6 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <>
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">MO-{String(order.id).padStart(4, '0')}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{order.product_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">{order.quantity}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">
                        {order.customer_name || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={order.status} />
                          {order.inventory_deducted && (
                            <span className="text-xs text-teal-600 font-medium" title="Inventory was deducted">
                              📦✓
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {order.status !== 'Completed' && order.status !== 'Cancelled' ? (
                          <select
                            className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            value={order.status}
                            disabled={updatingId === order.id}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Finalized</span>
                        )}
                        {updatingId === order.id && (
                          <span className="ml-2 text-xs text-blue-600">Updating...</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          {expandedId === order.id ? 'Hide ▲' : 'Materials ▼'}
                        </button>
                      </td>
                    </tr>

                    {/* Materials row */}
                    {expandedId === order.id && (
                      <tr key={`mat-${order.id}`}>
                        <td colSpan={7} className="px-6 py-4 bg-blue-50 border-b border-blue-100">
                          <p className="text-xs font-semibold text-blue-800 mb-2">Required Materials:</p>
                          {Array.isArray(order.required_materials) && order.required_materials.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {order.required_materials.map((mat, i) => (
                                <div key={i} className="bg-white border border-blue-200 rounded-lg px-3 py-2 text-xs">
                                  <div className="font-medium text-gray-800">{mat.material}</div>
                                  <div className="text-gray-500">SKU: {mat.sku} · Qty: {mat.required_qty}</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500">No materials defined.</p>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="text-sm text-amber-800">
          <strong>💡 Golden Path Tip:</strong> When you mark a manufacturing order as <strong>Completed</strong>,
          the system automatically deducts the required material quantities from warehouse inventory.
          This is protected against double-deduction.
        </p>
      </div>
    </div>
  );
}
