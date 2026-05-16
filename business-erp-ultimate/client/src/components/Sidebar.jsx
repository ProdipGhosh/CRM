import { NavLink, useNavigate } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/crm/leads', icon: '👥', label: 'CRM Leads' },
  { to: '/sales', icon: '💼', label: 'Sales' },
  { to: '/manufacturing', icon: '🏭', label: 'Manufacturing' },
  { to: '/warehouse', icon: '📦', label: 'Warehouse' },
  { to: '/hr', icon: '👤', label: 'HR' },
];

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('erp_token');
    localStorage.removeItem('erp_user');
    navigate('/login');
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white z-30 flex flex-col transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            E
          </div>
          <div>
            <div className="font-bold text-white text-sm">ERP Ultimate</div>
            <div className="text-xs text-gray-400">Business Platform</div>
          </div>
          <button
            className="ml-auto lg:hidden text-gray-400 hover:text-white"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150
                ${isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors duration-150"
          >
            <span className="text-base">🚪</span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
