const statusStyles = {
  // Lead statuses
  New: 'bg-blue-100 text-blue-700',
  Contacted: 'bg-yellow-100 text-yellow-700',
  Qualified: 'bg-purple-100 text-purple-700',
  Converted: 'bg-green-100 text-green-700',
  Lost: 'bg-red-100 text-red-700',

  // Opportunity statuses
  Open: 'bg-blue-100 text-blue-700',

  // Manufacturing statuses
  Pending: 'bg-yellow-100 text-yellow-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',

  // Employee statuses
  Active: 'bg-green-100 text-green-700',
  Inactive: 'bg-gray-100 text-gray-600',

  // Generic
  default: 'bg-gray-100 text-gray-700',
};

export default function StatusBadge({ status }) {
  const style = statusStyles[status] || statusStyles.default;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}
