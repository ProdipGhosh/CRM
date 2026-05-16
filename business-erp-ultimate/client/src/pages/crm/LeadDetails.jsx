import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConvertForm, setShowConvertForm] = useState(false);
  const [convertForm, setConvertForm] = useState({
    product_name: '',
    quantity: '',
    estimated_value: '',
  });

  useEffect(() => {
    fetchLead();
  }, [id]);

  async function fetchLead() {
    try {
      const res = await api.get(`/leads/${id}`);
      setLead(res.data.data);
    } catch {
      setError('Failed to load lead details.');
    } finally {
      setLoading(false);
    }
  }

  async function handleConvert(e) {
    e.preventDefault();
    setConverting(true);
    setError('');
    try {
      const res = await api.post(`/leads/${id}/convert-to-opportunity`, {
        product_name: convertForm.product_name,
        quantity: parseInt(convertForm.quantity),
        estimated_value: parseFloat(convertForm.estimated_value) || 0,
      });
      setSuccess('Lead successfully converted to a Sales Opportunity!');
      setShowConvertForm(false);
      await fetchLead();
    } catch (err) {
      setError(err.response?.data?.message || 'Conversion failed.');
    } finally {
      setConverting(false);
    }
  }

  if (loading) return <Loader text="Loading lead details..." />;
  if (!lead && !loading) return (
    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">Lead not found.</div>
  );

  const isConverted = lead?.status === 'Converted';

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/crm/leads" className="text-gray-400 hover:text-gray-600 text-sm">← Back to Leads</Link>
        <h2 className="text-xl font-bold text-gray-900">Lead Details</h2>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4 text-sm">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mb-4 text-sm">✅ {success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead info card */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{lead.customer_name}</h3>
              <p className="text-gray-500 text-sm">{lead.company_name || 'No company'}</p>
            </div>
            <StatusBadge status={lead.status} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Email</span>
              <p className="font-medium text-gray-800 mt-0.5">{lead.email || '—'}</p>
            </div>
            <div>
              <span className="text-gray-500">Phone</span>
              <p className="font-medium text-gray-800 mt-0.5">{lead.phone || '—'}</p>
            </div>
            <div className="sm:col-span-2">
              <span className="text-gray-500">Requirement</span>
              <p className="font-medium text-gray-800 mt-0.5">{lead.requirement || '—'}</p>
            </div>
            <div>
              <span className="text-gray-500">Created</span>
              <p className="font-medium text-gray-800 mt-0.5">
                {new Date(lead.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Actions card */}
        <div className="card p-6">
          <h4 className="font-semibold text-gray-800 mb-4">Actions</h4>
          {isConverted ? (
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-700 font-medium">✅ Lead Converted</p>
                <p className="text-xs text-green-600 mt-1">This lead has been converted to a sales opportunity.</p>
              </div>
              {lead.opportunity && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Linked Opportunity</p>
                  <p className="text-sm font-medium text-gray-800">{lead.opportunity.product_name}</p>
                  <p className="text-xs text-gray-500">Qty: {lead.opportunity.quantity}</p>
                  <Link
                    to="/sales"
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-2 block"
                  >
                    View in Sales →
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-3">Convert this lead into a Sales Opportunity to start the Golden Path flow.</p>
              {!showConvertForm ? (
                <button
                  onClick={() => setShowConvertForm(true)}
                  className="btn-success w-full"
                >
                  🔄 Convert to Opportunity
                </button>
              ) : (
                <form onSubmit={handleConvert} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="input-field text-sm"
                      value={convertForm.product_name}
                      onChange={(e) => setConvertForm({ ...convertForm, product_name: e.target.value })}
                      placeholder="e.g. Circuit Board PCB-X200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="input-field text-sm"
                      value={convertForm.quantity}
                      onChange={(e) => setConvertForm({ ...convertForm, quantity: e.target.value })}
                      placeholder="100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Estimated Value (₹)</label>
                    <input
                      type="number"
                      min="0"
                      className="input-field text-sm"
                      value={convertForm.estimated_value}
                      onChange={(e) => setConvertForm({ ...convertForm, estimated_value: e.target.value })}
                      placeholder="500000"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" disabled={converting} className="btn-success flex-1 text-sm py-2">
                      {converting ? 'Converting...' : 'Confirm'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowConvertForm(false)}
                      className="btn-secondary text-sm py-2"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
