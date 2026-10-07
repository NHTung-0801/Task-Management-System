import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

/**
 * DashboardPage (Trang Tổng quan Sprint 1)
 * - Hiển thị thông tin người dùng đang đăng nhập
 * - Kiểm chứng JWT Token đang hoạt động
 * - Nút Đăng xuất: xóa token và quay về trang Login
 */
export default function DashboardPage() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser() || {};
  const token = authService.getToken() || '';

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Navbar trên cùng */}
      <header
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--border-color)',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              fontWeight: 700,
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '1rem',
            }}
          >
            TF
          </span>
          <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
            Taskflow
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              {user.fullName || user.username || 'Người dùng'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {user.email || 'user@example.com'}
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              border: '1px solid #FCA5A5',
              padding: '6px 14px',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'background-color 150ms',
            }}
          >
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Nội dung chính */}
      <main style={{ maxWidth: '960px', margin: '32px auto', padding: '0 16px' }}>
        {/* Banner thông báo hoàn tất Sprint 1 */}
        <div
          style={{
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
          }}
        >
          <span style={{ fontSize: '1.8rem' }}>🎉</span>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#065F46', marginBottom: '4px' }}>
              Chúc mừng! Bạn đã hoàn thành xuất sắc Sprint 1
            </h2>
            <p style={{ color: '#047857', fontSize: '0.95rem' }}>
              Luồng Xác thực người dùng (Đăng ký, Đăng nhập, Băm mật khẩu BCrypt, Cấp & Xác thực JWT Token, Protected Route) đã hoạt động trơn tru từ Backend đến Frontend.
            </p>
          </div>
        </div>

        {/* Khung thông tin phiên đăng nhập (Phiên làm việc hiện tại) */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '24px',
          }}
        >
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
            Thông tin phiên xác thực (User Session)
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '20px',
            }}
          >
            <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>User ID</div>
              <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>
                {user.userId || 'N/A'}
              </div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tên đăng nhập</div>
              <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>
                {user.username || 'N/A'}
              </div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Email</div>
              <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>
                {user.email || 'N/A'}
              </div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Họ và tên</div>
              <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>
                {user.fullName || 'Chưa cập nhật'}
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#F1F5F9', padding: '14px', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              JWT Token (Được tự động đính kèm vào Header <code>Authorization: Bearer ...</code>):
            </div>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                color: '#334155',
                wordBreak: 'break-all',
                maxHeight: '80px',
                overflowY: 'auto',
              }}
            >
              {token || '(Không tìm thấy token)'}
            </div>
          </div>
        </div>

        {/* Khung hướng dẫn bước tiếp theo: Sprint 2 */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
            Sẵn sàng cho Sprint 2: Quản lý công việc (Task Management)
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
            Ở Sprint tiếp theo, chúng ta sẽ xây dựng các API CRUD cho công việc (Thêm, Sửa, Xóa, Xem danh sách), bộ lọc tìm kiếm, phân trang và bảo mật cách ly dữ liệu theo từng User.
          </p>
        </div>
      </main>
    </div>
  );
}
