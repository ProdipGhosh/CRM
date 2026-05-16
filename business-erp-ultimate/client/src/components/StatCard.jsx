export default function StatCard({ title, value, icon, color = 'blue', subtitle }) {
  const colorMap = {
    blue: { bg: 'bg-blue-50', icon: 'bg-blue-600', text: 'text-blue-600' },
    green: { bg: 'bg-green-50', icon: 'bg-green-600', text: 'text-green-600' },
    purple: { bg: 'bg-purple-50', icon: 'bg-purple-600', text: 'text-purple-600' },
    orange: { bg: 'bg-orange-50', icon: 'bg-orange-500', text: 'text-orange-500' },
    red: { bg: 'bg-red-50', icon: 'bg-red-500', text: 'text-red-500' },
    teal: { bg: 'bg-teal-50', icon: 'bg-teal-600', text: 'text-teal-600' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className="card p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${c.icon} rounded-xl flex items-center justify-center text-white text-xl`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value ?? '—'}</div>
      <div className="text-sm font-medium text-gray-600">{title}</div>
      {subtitle && <div className={`text-xs mt-1 ${c.text}`}>{subtitle}</div>}
    </div>
  );
}
