import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/common/ProtectedRoute';

/**
 * Component gốc — định nghĩa hệ thống Routing của ứng dụng
 * - /login       -> Trang Đăng nhập (Công khai)
 * - /register    -> Trang Đăng ký (Công khai)
 * - /dashboard   -> Trang Tổng quan (Yêu cầu đăng nhập thông qua ProtectedRoute)
 * - / (hoặc khác)-> Tự động điều hướng về /dashboard (nếu chưa đăng nhập ProtectedRoute sẽ đẩy về /login)
 */
function App() {
  return (
    <Routes>
      {/* === Route công khai (Public) === */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* === Route được bảo vệ (Private / Protected) === */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* === Điều hướng mặc định === */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
