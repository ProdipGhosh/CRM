import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Leads from './pages/crm/Leads';
import AddLead from './pages/crm/AddLead';
import LeadDetails from './pages/crm/LeadDetails';
import Sales from './pages/sales/Sales';
import Manufacturing from './pages/manufacturing/Manufacturing';
import Warehouse from './pages/warehouse/Warehouse';
import HR from './pages/hr/HR';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/crm/leads" element={<Leads />} />
          <Route path="/crm/leads/add" element={<AddLead />} />
          <Route path="/crm/leads/:id" element={<LeadDetails />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/manufacturing" element={<Manufacturing />} />
          <Route path="/warehouse" element={<Warehouse />} />
          <Route path="/hr" element={<HR />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
