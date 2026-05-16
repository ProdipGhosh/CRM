import { useLocation } from 'react-router-dom';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/crm/leads': 'CRM — Leads',
  '/crm/leads/add': 'CRM — Add Lead',
  '/sales': 'Sales — Opportunities',
  '/manufacturing': 'Manufacturing Orders',
  '/warehouse': 'Warehouse Inventory',
  '/hr': 'Human Resources',
};

export default function Navbar({ onMenuToggle }) {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('erp_user') || '{}');

  const title =
    pageTitles[location.pathname] ||
    (location.pathname.startsWith('/crm/leads/') ? 'CRM — Lead Details' : 'ERP Ultimate');

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden text-gray-500 hover:text-gray-700 p-1"
          onClick={onMenuToggle}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="font-semibold text-gray-800 text-lg">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-medium text-gray-800">{user.name || 'Admin'}</div>
            <div className="text-xs text-gray-500">{user.role || 'Administrator'}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
