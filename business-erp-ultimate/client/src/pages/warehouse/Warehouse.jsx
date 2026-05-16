import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';

export default function Warehouse() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    item_name: '', sku: '', quantity: '', unit: 'pcs', reorder_level: '10',
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  async function fetchInventory() {
    try {
      const res = await api.get('/inventory');
      setInventory(res.data.data);
    } catch {
      setError('Failed to load inventory.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/inventory', {
        ...form,
        quantity: parseInt(form.quantity),
        reorder_level: parseInt(form.reorder_level),
      });
      setSuccess('Inventory item added successfully!');
      setShowAddForm(false);
      setForm({ item_name: '', sku: '', quantity: '', unit: 'pcs', reorder_level: '10' });
      await fetchInventory();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add item.');
    } finally {
      setSaving(false);
    }
  }

  const lowStockItems = inventory.filter((i) => i.quantity <= i.reorder_level);
  const totalStock = inventory.reduce((sum, i) => sum + i.quantity, 0);

  if (loading) return <Loader text="Loading inventory..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Warehouse Inventory</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {inventory.length} items · {totalStock} total units
            {lowStockItems.length > 0 && (
              <span className="ml-2 text-amber-600 font-medium">⚠️ {lowStockItems.length} low stock</span>
            )}
          </p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary">
          + Add Item
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4 text-sm">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mb-4 text-sm">✅ {success}</div>}

      {/* Add form */}
      {showAddForm && (
        <div className="card p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Add Inventory Item</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Item Name *</label>
              <input className="input-field" value={form.item_name}
                onChange={(e) => setForm({ ...form, item_name: e.target.value })}
                placeholder="Copper Sheet" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">SKU *</label>
              <input className="input-field" value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="RAW-010" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Quantity *</label>
              <input type="number" min="0" className="input-field" value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                placeholder="100" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
              <select className="input-field" value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                {['pcs', 'sheets', 'packs', 'sets', 'boxes', 'bundles', 'spools', 'kits', 'rolls', 'liters'].map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Reorder Level</label>
              <input type="number" min="0" className="input-field" value={form.reorder_level}
                onChange={(e) => setForm({ ...form, reorder_level: e.target.value })}
                placeholder="10" />
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : 'Add Item'}
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inventory table */}
      <div className="card overflow-hidden">
        {inventory.length === 0 ? (
          <EmptyState title="No inventory items" description="Add warehouse stock items to track." icon="📦" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left table-header px-6 py-3">Item Name</th>
                  <th className="text-left table-header px-6 py-3">SKU</th>
                  <th className="text-left table-header px-6 py-3">Quantity</th>
                  <th className="text-left table-header px-6 py-3 hidden md:table-cell">Unit</th>
                  <th className="text-left table-header px-6 py-3 hidden lg:table-cell">Reorder Level</th>
                  <th className="text-left table-header px-6 py-3">Stock Status</th>
                  <th className="text-left table-header px-6 py-3 hidden xl:table-cell">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inventory.map((item) => {
                  const isLow = item.quantity <= item.reorder_level;
                  const isCritical = item.quantity <= Math.floor(item.reorder_level / 2);
                  return (
                    <tr key={item.id} className={`transition-colors ${isLow ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{item.item_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-700">{item.sku}</code>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-lg font-bold ${isCritical ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-gray-800'}`}>
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">{item.unit}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">{item.reorder_level}</td>
                      <td className="px-6 py-4">
                        {isCritical ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            🔴 Critical
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            ⚠️ Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            ✅ In Stock
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 hidden xl:table-cell">
                        {new Date(item.last_updated).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
