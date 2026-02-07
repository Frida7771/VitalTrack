import { Navigate, Route, Routes } from 'react-router-dom';
import Login from '@/pages/auth/Login.jsx';
import Register from '@/pages/auth/Register.jsx';
import AdminLayout from '@/layouts/AdminLayout.jsx';
import UserLayout from '@/layouts/UserLayout.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import Dashboard from '@/pages/admin/Dashboard.jsx';
import UserManagement from '@/pages/admin/UserManagement.jsx';
import TagsManagement from '@/pages/admin/TagsManagement.jsx';
import HealthModelConfig from '@/pages/admin/HealthModelConfig.jsx';
import UserHealthManagement from '@/pages/admin/UserHealthManagement.jsx';
import MessageManagement from '@/pages/admin/MessageManagement.jsx';
import EvaluationsManagement from '@/pages/admin/EvaluationsManagement.jsx';
import UserHealthModel from '@/pages/user/UserHealthModel.jsx';
import Record from '@/pages/user/Record.jsx';
import MessageCenter from '@/pages/user/MessageCenter.jsx';

const AppRouter = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    <Route element={<ProtectedRoute allowedRoles={[1]} />}>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="tags" element={<TagsManagement />} />
        <Route path="model-config" element={<HealthModelConfig />} />
        <Route path="health-records" element={<UserHealthManagement />} />
        <Route path="messages" element={<MessageManagement />} />
        <Route path="evaluations" element={<EvaluationsManagement />} />
      </Route>
    </Route>

    <Route element={<ProtectedRoute allowedRoles={[2]} />}>
      <Route path="/user" element={<UserLayout />}>
        <Route index element={<Navigate to="record" replace />} />
        <Route path="health-model" element={<UserHealthModel />} />
        <Route path="record" element={<Record />} />
        <Route path="message" element={<MessageCenter />} />
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

export default AppRouter;
