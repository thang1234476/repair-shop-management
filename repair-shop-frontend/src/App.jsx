import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Customer pages
import CustomerLayout from './layouts/CustomerLayout';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerTickets from './pages/customer/CustomerTickets';
import CustomerTicketDetail from './pages/customer/CustomerTicketDetail';
import CustomerDevices from './pages/customer/CustomerDevices';
import CustomerProfile from './pages/customer/CustomerProfile';
import CustomerNotifications from './pages/customer/CustomerNotifications';

// Staff pages
import StaffLayout from './layouts/StaffLayout';
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffTickets from './pages/staff/StaffTickets';
import StaffCreateTicket from './pages/staff/StaffCreateTicket';
import StaffTicketDetail from './pages/staff/StaffTicketDetail';
import StaffCustomers from './pages/staff/StaffCustomers';
import StaffInventory from './pages/staff/StaffInventory';
import StaffInvoices from './pages/staff/StaffInvoices';

// Admin pages
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStaff from './pages/admin/AdminStaff';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminTickets from './pages/admin/AdminTickets';
import AdminInventory from './pages/admin/AdminInventory';
import AdminInvoices from './pages/admin/AdminInvoices';

const antdTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#7c3aed',
    colorBgContainer: '#1a1a2e',
    colorBgLayout: '#0f0f1a',
    borderRadius: 8,
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  components: {
    Layout: { bodyBg: '#0f0f1a', headerBg: '#1a1a2e', siderBg: '#16213e' },
    Menu: { darkItemBg: '#16213e', darkSubMenuItemBg: '#0f3460', itemBorderRadius: 8 },
    Card: { colorBgContainer: '#1a1a2e', boxShadow: '0 4px 20px rgba(124,58,237,0.15)' },
    Table: { colorBgContainer: '#1a1a2e' },
  },
};

export default function App() {
  return (
    <ConfigProvider locale={viVN} theme={antdTheme}>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              
              {/* Customer routes */}
              <Route element={<ProtectedRoute roles={['CUSTOMER']} />}>
                <Route element={<CustomerLayout />}>
                  <Route path="/customer" element={<CustomerDashboard />} />
                  <Route path="/customer/tickets" element={<CustomerTickets />} />
                  <Route path="/customer/tickets/:id" element={<CustomerTicketDetail />} />
                  <Route path="/customer/devices" element={<CustomerDevices />} />
                  <Route path="/customer/profile" element={<CustomerProfile />} />
                  <Route path="/customer/notifications" element={<CustomerNotifications />} />
                </Route>
              </Route>
              
              {/* Staff routes */}
              <Route element={<ProtectedRoute roles={['STAFF']} />}>
                <Route element={<StaffLayout />}>
                  <Route path="/staff" element={<StaffDashboard />} />
                  <Route path="/staff/tickets" element={<StaffTickets />} />
                  <Route path="/staff/tickets/create" element={<StaffCreateTicket />} />
                  <Route path="/staff/tickets/:id" element={<StaffTicketDetail />} />
                  <Route path="/staff/customers" element={<StaffCustomers />} />
                  <Route path="/staff/inventory" element={<StaffInventory />} />
                  <Route path="/staff/invoices" element={<StaffInvoices />} />
                </Route>
              </Route>
              
              {/* Admin routes */}
              <Route element={<ProtectedRoute roles={['ADMIN']} />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/staff" element={<AdminStaff />} />
                  <Route path="/admin/customers" element={<AdminCustomers />} />
                  <Route path="/admin/tickets" element={<AdminTickets />} />
                  <Route path="/admin/inventory" element={<AdminInventory />} />
                  <Route path="/admin/invoices" element={<AdminInvoices />} />
                </Route>
              </Route>
              
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ConfigProvider>
  );
}
