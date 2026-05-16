import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Loader from './components/Loader';

// Lazy-load every page → each becomes its own JS chunk.
// Vercel CDN serves only the chunks the user actually visits.
const Login        = lazy(() => import('./pages/auth/Login'));
const Dashboard    = lazy(() => import('./pages/dashboard/Dashboard'));
const Leads        = lazy(() => import('./pages/crm/Leads'));
const AddLead      = lazy(() => import('./pages/crm/AddLead'));
const LeadDetails  = lazy(() => import('./pages/crm/LeadDetails'));
const Sales        = lazy(() => import('./pages/sales/Sales'));
const Manufacturing = lazy(() => import('./pages/manufacturing/Manufacturing'));
const Warehouse    = lazy(() => import('./pages/warehouse/Warehouse'));
const HR           = lazy(() => import('./pages/hr/HR'));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
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
            <Route path="/dashboard"        element={<Dashboard />} />
            <Route path="/crm/leads"        element={<Leads />} />
            <Route path="/crm/leads/add"    element={<AddLead />} />
            <Route path="/crm/leads/:id"    element={<LeadDetails />} />
            <Route path="/sales"            element={<Sales />} />
            <Route path="/manufacturing"    element={<Manufacturing />} />
            <Route path="/warehouse"        element={<Warehouse />} />
            <Route path="/hr"              element={<HR />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
