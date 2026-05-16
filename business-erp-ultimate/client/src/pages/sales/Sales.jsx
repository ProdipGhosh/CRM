import { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';

export default function Sales() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [convertingId, setConvertingId] = useState(null);
  const [showMaterialsForm, setShowMaterialsForm] = useState(null);
  const [materials, setMaterials] = useState([{ material: '', sku: '', required_qty: '' }]);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  async function fetchOpportunities() {
    try {
      const res = await api.get('/opportunities');
      setOpportunities(res.data.data);
    } catch {
      setError('Failed to load opportunities.');
    } finally {
      setLoading(false);
    }
  }

  function addMaterialRow() {
    setMaterials([...materials, { material: '', sku: '', required_qty: '' }]);
  }

  function updateMaterial(index, field, value) {
    const updated = [...materials];
    updated[index][field] = value;
    setMaterials(updated);
  }

  function removeMaterialRow(index) {
    setMaterials(materials.filter((_, i) => i !== index));
  }

  async function handleConvert(opportunityId) {
    setConvertingId(opportunityId);
    setError('');
    try {
      const validMaterials = materials.filter((m) => m.material && m.sku && m.required_qty);
      await api.post(`/opportunities/${opportunityId}/convert-to-manufacturing`, {
        required_materials: validMaterials.map((m) => ({
          ...m,
          required_qty: parseInt(m.required_qty),
        })),
      });
      setSuccess('Opportunity successfully converted to a Manufacturing Order!');
      setShowMaterialsForm(null);
      setMaterials([{ material: '', sku: '', required_qty: '' }]);
      await fetchOpportunities();
    } catch (err) {
      setError(err.response?.data?.message || 'Conversion failed.');
    } finally {
      setConvertingId(null);
    }
  }

  if (loading) return <Loader text="Loading opportunities..." />;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Sales Opportunities</h2>
        <p className="text-sm text-gray-500 mt-0.5">Track and convert sales opportunities to manufacturing</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4 text-sm">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mb-4 text-sm">✅ {success}</div>}

      <div className="card overflow-hidden">
        {opportunities.length === 0 ? (
          <EmptyState title="No opportunities yet" description="Convert a CRM lead to create an opportunity." icon="💼" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left table-header px-6 py-3">Customer</th>
                  <th className="text-left table-header px-6 py-3">Product</th>
                  <th className="text-left table-header px-6 py-3 hidden md:table-cell">Quantity</th>
                  <th className="text-left table-header px-6 py-3 hidden lg:table-cell">Est. Value</th>
                  <th className="text-left table-header px-6 py-3">Status</th>
                  <th className="text-left table-header px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {opportunities.map((opp) => (
                  <>
                    <tr key={opp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{opp.customer_name}</div>
                        <div className="text-xs text-gray-500">{opp.company_name || ''}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{opp.product_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">{opp.quantity}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">
                        ₹{parseFloat(opp.estimated_value).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={opp.status} /></td>
                      <td className="px-6 py-4">
                        {opp.status !== 'Converted' ? (
                          <button
                            onClick={() => {
                              setShowMaterialsForm(showMaterialsForm === opp.id ? null : opp.id);
                              setMaterials([{ material: '', sku: '', required_qty: '' }]);
                            }}
                            className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                          >
                            🏭 To Manufacturing
                          </button>
                        ) : (
                          <span className="text-xs text-green-600 font-medium">✅ Converted</span>
                        )}
                      </td>
                    </tr>

                    {/* Inline material form */}
                    {showMaterialsForm === opp.id && (
                      <tr key={`form-${opp.id}`}>
                        <td colSpan={6} className="px-6 py-4 bg-orange-50 border-b border-orange-100">
                          <div className="max-w-2xl">
                            <p className="text-sm font-semibold text-orange-800 mb-3">
                              Define required materials for: {opp.product_name}
                            </p>
                            <div className="space-y-2 mb-3">
                              {materials.map((mat, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                  <input
                                    className="input-field text-sm flex-1"
                                    placeholder="Material name"
                                    value={mat.material}
                                    onChange={(e) => updateMaterial(idx, 'material', e.target.value)}
                                  />
                                  <input
                                    className="input-field text-sm w-28"
                                    placeholder="SKU"
                                    value={mat.sku}
                                    onChange={(e) => updateMaterial(idx, 'sku', e.target.value)}
                                  />
                                  <input
                                    type="number"
                                    className="input-field text-sm w-24"
                                    placeholder="Qty"
                                    value={mat.required_qty}
                                    onChange={(e) => updateMaterial(idx, 'required_qty', e.target.value)}
                                  />
                                  {materials.length > 1 && (
                                    <button
                                      onClick={() => removeMaterialRow(idx)}
                                      className="text-red-500 hover:text-red-700 text-lg leading-none"
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <button onClick={addMaterialRow} className="btn-secondary text-xs py-1.5 px-3">
                                + Add Material
                              </button>
                              <button
                                onClick={() => handleConvert(opp.id)}
                                disabled={convertingId === opp.id}
                                className="btn-primary text-xs py-1.5 px-4"
                              >
                                {convertingId === opp.id ? 'Converting...' : '✓ Confirm Convert'}
                              </button>
                              <button
                                onClick={() => setShowMaterialsForm(null)}
                                className="btn-secondary text-xs py-1.5 px-3"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
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
    </div>
  );
}
