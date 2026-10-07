import { Navigate } from 'react-router-dom';
import authService from '../../services/authService';

/**
 * ProtectedRoute: Kiểm tra trạng thái đăng nhập
 * - Nếu đã có token (isAuthenticated = true) -> Cho phép truy cập component con
 * - Nếu chưa có token -> Điều hướng về trang /login
 */
export default function ProtectedRoute({ children }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
