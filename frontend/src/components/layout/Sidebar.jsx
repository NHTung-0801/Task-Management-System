import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser() || {};
  const isProfileActive = location.pathname === '/profile';

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const getInitial = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <div className="brand-badge">TF</div>
        <span className="brand-title">Taskflow</span>
        <span className="brand-version">v1.0</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">General</div>
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </span>
          <span>Dashboard</span>
        </NavLink>

        <div className="nav-section-title" style={{ marginTop: '12px' }}>Workspace</div>
        <NavLink
          to="/tasks"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
          </span>
          <span>My Tasks</span>
        </NavLink>

        <NavLink
          to="/kanban"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="5" height="18" rx="1"></rect>
              <rect x="10" y="3" width="5" height="12" rx="1"></rect>
              <rect x="17" y="3" width="5" height="15" rx="1"></rect>
            </svg>
          </span>
          <span>Projects</span>
        </NavLink>

        <NavLink
          to="/calendar"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </span>
          <span>Calendar</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div
          className={`user-profile-btn ${isProfileActive ? 'active' : ''}`}
          onClick={() => navigate('/profile')}
          title="Xem và chỉnh sửa hồ sơ cá nhân"
          role="button"
          tabIndex={0}
        >
          <div className="user-avatar">
            {getInitial(user.fullName || user.username)}
          </div>
          <div className="user-details">
            <div className="user-name" title={user.fullName || user.username}>
              {user.fullName || user.username || 'Người dùng'}
            </div>
            <div className="user-email" title={user.email}>
              {user.email || 'user@example.com'}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="btn-logout"
          title="Đăng xuất"
          aria-label="Đăng xuất"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    </aside>
  );
}
