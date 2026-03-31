import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import MemberDashboard from './pages/MemberDashboard';
import DependencyFlow from './pages/DependencyFlow';
import AdminUsers from './pages/AdminUsers';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<DashboardLayout><AdminDashboard /></DashboardLayout>} />
          <Route path="/admin/tasks" element={<DashboardLayout><AdminDashboard /></DashboardLayout>} />
          <Route path="/admin/users" element={<DashboardLayout><AdminUsers /></DashboardLayout>} />
          <Route path="/admin/dependencies" element={<DashboardLayout><DependencyFlow /></DashboardLayout>} />
        </Route>

        {/* Member Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'member']} />}>
          <Route path="/member" element={<DashboardLayout><MemberDashboard /></DashboardLayout>} />
          <Route path="/member/tasks" element={<DashboardLayout><MemberDashboard /></DashboardLayout>} />
        </Route>

        {/* Default Redirects */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
