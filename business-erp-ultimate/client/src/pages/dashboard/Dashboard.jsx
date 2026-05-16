import { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatCard from '../../components/StatCard';
import Loader from '../../components/Loader';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data.data);
      } catch (err) {
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <Loader text="Loading dashboard..." />;

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Welcome header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Welcome back 👋</h2>
        <p className="text-gray-500 mt-1">Here's an overview of your business operations.</p>
      </div>

      {/* Main stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        <StatCard
          title="Total Leads"
          value={stats.totalLeads}
          icon="👥"
          color="blue"
          subtitle="CRM pipeline"
        />
        <StatCard
          title="Active Opportunities"
          value={stats.activeOpportunities}
          icon="💼"
          color="purple"
          subtitle="Open deals"
        />
        <StatCard
          title="Manufacturing Orders"
          value={stats.totalManufacturingOrders}
          icon="🏭"
          color="orange"
          subtitle="All orders"
        />
        <StatCard
          title="Warehouse Items"
          value={stats.warehouseItems}
          icon="📦"
          color="teal"
          subtitle={stats.lowStockItems > 0 ? `⚠️ ${stats.lowStockItems} low stock` : 'All stocked'}
        />
        <StatCard
          title="Active Employees"
          value={stats.activeEmployees}
          icon="👤"
          color="green"
          subtitle="HR records"
        />
      </div>

      {/* Manufacturing breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Manufacturing Orders Breakdown</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <span className="font-semibold text-gray-800">{stats.pendingManufacturingOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                <span className="text-sm text-gray-600">In Progress</span>
              </div>
              <span className="font-semibold text-gray-800">{stats.inProgressManufacturingOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                <span className="text-sm text-gray-600">Completed</span>
              </div>
              <span className="font-semibold text-gray-800">{stats.completedManufacturingOrders}</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Golden Path Flow</h3>
          <div className="space-y-2">
            {[
              { icon: '👥', step: 'CRM Lead Created', color: 'text-blue-600' },
              { icon: '↓', step: '', color: 'text-gray-300' },
              { icon: '💼', step: 'Sales Opportunity', color: 'text-purple-600' },
              { icon: '↓', step: '', color: 'text-gray-300' },
              { icon: '🏭', step: 'Manufacturing Order', color: 'text-orange-500' },
              { icon: '↓', step: '', color: 'text-gray-300' },
              { icon: '📦', step: 'Warehouse Deduction', color: 'text-teal-600' },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-2 ${item.step ? '' : 'ml-1'}`}>
                <span className={`text-sm ${item.color}`}>{item.icon}</span>
                {item.step && <span className="text-sm text-gray-700">{item.step}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {stats.lowStockItems > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-amber-800">Low Stock Alert</p>
            <p className="text-sm text-amber-700">
              {stats.lowStockItems} inventory item{stats.lowStockItems > 1 ? 's are' : ' is'} at or below reorder level.
              Visit the Warehouse module to review.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
