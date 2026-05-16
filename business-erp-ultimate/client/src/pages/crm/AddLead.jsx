import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';

export default function AddLead() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customer_name: '',
    company_name: '',
    email: '',
    phone: '',
    requirement: '',
    status: 'New',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/leads', form);
      navigate('/crm/leads');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create lead.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/crm/leads" className="text-gray-400 hover:text-gray-600 text-sm">
          ← Back
        </Link>
        <h2 className="text-xl font-bold text-gray-900">Add New Lead</h2>
      </div>

      <div className="card p-6 max-w-2xl">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                name="customer_name"
                className="input-field"
                value={form.customer_name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                name="company_name"
                className="input-field"
                value={form.company_name}
                onChange={handleChange}
                placeholder="Acme Corp"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                name="email"
                type="email"
                className="input-field"
                value={form.email}
                onChange={handleChange}
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                name="phone"
                className="input-field"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91-9876543210"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requirement</label>
            <textarea
              name="requirement"
              className="input-field"
              rows={3}
              value={form.requirement}
              onChange={handleChange}
              placeholder="Describe customer requirement..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select name="status" className="input-field" value={form.status} onChange={handleChange}>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Lost">Lost</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Creating...' : 'Create Lead'}
            </button>
            <Link to="/crm/leads" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
