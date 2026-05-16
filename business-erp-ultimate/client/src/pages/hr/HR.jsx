import { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';

const DEPARTMENTS = ['Engineering', 'Manufacturing', 'Sales', 'CRM', 'Warehouse', 'HR', 'Finance', 'Operations', 'IT'];

export default function HR() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', department: 'Engineering', designation: '', status: 'Active',
  });

  useEffect(() => { fetchEmployees(); }, []);

  async function fetchEmployees() {
    try {
      const res = await api.get('/employees');
      setEmployees(res.data.data);
    } catch {
      setError('Failed to load employees.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/employees', form);
      setSuccess('Employee added successfully!');
      setShowAddForm(false);
      setForm({ name: '', email: '', department: 'Engineering', designation: '', status: 'Active' });
      await fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add employee.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(emp) {
    const newStatus = emp.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.put(`/employees/${emp.id}`, { status: newStatus });
      await fetchEmployees();
    } catch {
      setError('Failed to update employee status.');
    }
  }

  const activeCount = employees.filter((e) => e.status === 'Active').length;

  if (loading) return <Loader text="Loading employees..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Human Resources</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {employees.length} total · {activeCount} active
          </p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary">
          + Add Employee
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4 text-sm">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mb-4 text-sm">✅ {success}</div>}

      {/* Add form */}
      {showAddForm && (
        <div className="card p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Add New Employee</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
              <input className="input-field" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Rahul Sharma" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Work Email *</label>
              <input type="email" className="input-field" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="rahul@company.com" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
              <select className="input-field" value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Designation</label>
              <input className="input-field" value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                placeholder="Software Engineer" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select className="input-field" value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Adding...' : 'Add Employee'}
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Employee table */}
      <div className="card overflow-hidden">
        {employees.length === 0 ? (
          <EmptyState title="No employees found" description="Add your first HR record." icon="👤" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left table-header px-6 py-3">Employee</th>
                  <th className="text-left table-header px-6 py-3 hidden md:table-cell">Email</th>
                  <th className="text-left table-header px-6 py-3">Department</th>
                  <th className="text-left table-header px-6 py-3 hidden lg:table-cell">Designation</th>
                  <th className="text-left table-header px-6 py-3">Status</th>
                  <th className="text-left table-header px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="font-medium text-gray-900">{emp.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">{emp.email}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                        {emp.department || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">{emp.designation || '—'}</td>
                    <td className="px-6 py-4"><StatusBadge status={emp.status} /></td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(emp)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                          emp.status === 'Active'
                            ? 'text-red-600 hover:bg-red-50 border border-red-200'
                            : 'text-green-600 hover:bg-green-50 border border-green-200'
                        }`}
                      >
                        {emp.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
