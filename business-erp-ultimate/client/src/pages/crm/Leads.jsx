import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    try {
      const res = await api.get('/leads');
      setLeads(res.data.data);
    } catch {
      setError('Failed to load leads.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loader text="Loading leads..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">CRM Leads</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage your customer leads pipeline</p>
        </div>
        <Link to="/crm/leads/add" className="btn-primary flex items-center gap-2">
          <span>+</span> Add Lead
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4">{error}</div>
      )}

      <div className="card overflow-hidden">
        {leads.length === 0 ? (
          <EmptyState title="No leads yet" description="Start by adding your first CRM lead." icon="👥" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left table-header px-6 py-3">Customer</th>
                  <th className="text-left table-header px-6 py-3">Company</th>
                  <th className="text-left table-header px-6 py-3 hidden md:table-cell">Email</th>
                  <th className="text-left table-header px-6 py-3 hidden lg:table-cell">Phone</th>
                  <th className="text-left table-header px-6 py-3">Status</th>
                  <th className="text-left table-header px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{lead.customer_name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{lead.company_name || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">{lead.email || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">{lead.phone || '—'}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/crm/leads/${lead.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-3">{leads.length} lead{leads.length !== 1 ? 's' : ''} total</p>
    </div>
  );
}
