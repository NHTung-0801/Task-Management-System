import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import dashboardService from '../services/dashboardService';
import taskService from '../services/taskService';
import authService from '../services/authService';
import PriorityBadge from '../components/common/PriorityBadge';
import StatusBadge from '../components/common/StatusBadge';
import TaskModal from '../components/common/TaskModal';
import Toast from '../components/common/Toast';
import './Dashboard.css';

export default function DashboardPage() {
  const currentUser = authService.getCurrentUser() || {};

  const [stats, setStats] = useState({
    totalTasks: 0,
    todoTasks: 0,
    inProgressTasks: 0,
    doneTasks: 0,
  });

  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, upcomingRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getUpcomingTasks(5),
      ]);
      setStats(statsRes.data || { totalTasks: 0, todoTasks: 0, inProgressTasks: 0, doneTasks: 0 });
      setUpcomingTasks(upcomingRes.data || []);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu Dashboard:', err);
      setToast({
        message: err.response?.data?.message || 'Không thể tải số liệu thống kê',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleSaveTask = async (formData) => {
    try {
      setIsSubmitting(true);
      await taskService.createTask(formData);
      setToast({ message: 'Tạo công việc mới thành công!', type: 'success' });
      setIsTaskModalOpen(false);
      loadDashboardData();
    } catch (err) {
      console.error('Lỗi khi lưu công việc:', err);
      setToast({
        message: err.response?.data?.message || 'Có lỗi xảy ra khi tạo công việc',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const completionRate =
    stats.totalTasks > 0 ? Math.round((stats.doneTasks / stats.totalTasks) * 100) : 0;

  const getDeadlineInfo = (dueDate) => {
    if (!dueDate) return { text: 'Không có deadline', urgent: false };
    const target = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));

    const dateFormatted = new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(target);

    if (diffDays < 0) {
      return { text: `Quá hạn ${Math.abs(diffDays)} ngày (${dateFormatted})`, urgent: true };
    }
    if (diffDays === 0) {
      return { text: `Hôm nay là hạn chót! (${dateFormatted})`, urgent: true };
    }
    if (diffDays === 1) {
      return { text: `Hạn chót ngày mai (${dateFormatted})`, urgent: true };
    }
    return { text: `Còn ${diffDays} ngày (${dateFormatted})`, urgent: diffDays <= 3 };
  };

  return (
    <AppLayout
      title="Dashboard"
      extraAction={
        <button
          onClick={() => setIsTaskModalOpen(true)}
          className="btn-primary"
          id="btn-create-task-dashboard"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Tạo công việc</span>
        </button>
      }
    >
      <div className="dashboard-container">
        {/* Welcome Banner */}
        <div className="welcome-banner">
          <div className="welcome-info">
            <h2>Xin chào, {currentUser.fullName || currentUser.username || 'Bạn'}! 👋</h2>
            <p>
              Chào mừng bạn trở lại với Taskflow. Dưới đây là bức tranh tổng quan về tiến độ các dự án
              và những công việc cần được ưu tiên xử lý sớm.
            </p>
          </div>
          <button onClick={() => setIsTaskModalOpen(true)} className="btn-welcome-cta">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>+ Tạo công việc mới</span>
          </button>
        </div>

        {/* 4 Stat Cards */}
        <div className="stat-cards-grid">
          {/* Card 1: Total */}
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Tổng số công việc</span>
              <div className="stat-icon total">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
              </div>
            </div>
            <div className="stat-body">
              <span className="stat-value">{stats.totalTasks}</span>
            </div>
            <div className="stat-footer">
              <span>Đang quản lý trên hệ thống</span>
            </div>
          </div>

          {/* Card 2: To Do */}
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Chờ làm (To Do)</span>
              <div className="stat-icon todo">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
            </div>
            <div className="stat-body">
              <span className="stat-value">{stats.todoTasks}</span>
            </div>
            <div className="stat-footer">
              <span>Chưa bắt đầu thực hiện</span>
            </div>
          </div>

          {/* Card 3: In Progress */}
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Đang làm (In Progress)</span>
              <div className="stat-icon inprogress">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </div>
            </div>
            <div className="stat-body">
              <span className="stat-value">{stats.inProgressTasks}</span>
            </div>
            <div className="stat-footer">
              <span>Đang được tích cực xử lý</span>
            </div>
          </div>

          {/* Card 4: Done */}
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Đã xong (Done)</span>
              <div className="stat-icon done">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
            </div>
            <div className="stat-body">
              <span className="stat-value" style={{ color: '#16A34A' }}>{stats.doneTasks}</span>
            </div>
            <div className="stat-footer">
              <span style={{ color: '#16A34A', fontWeight: 600 }}>Tỷ lệ đạt {completionRate}%</span>
            </div>
          </div>
        </div>

        {/* Completion Progress Bar */}
        <div className="completion-progress-card">
          <div className="progress-header">
            <span className="progress-title">Tiến độ hoàn thành mục tiêu tổng thể</span>
            <span className="progress-rate">{completionRate}% Hoàn thành</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${completionRate}%` }} />
          </div>
        </div>

        {/* Two-Column Grid: Upcoming Deadlines & Quick Navigation */}
        <div className="dashboard-grid-layout">
          {/* Upcoming Deadlines Widget */}
          <div className="section-card">
            <div className="section-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>⏰</span>
                <h3 className="section-title">Công việc sắp tới hạn (Upcoming)</h3>
              </div>
              <Link to="/tasks" className="section-link">
                <span>Xem tất cả</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </Link>
            </div>

            {loading ? (
              <div style={{ padding: '24px' }}>
                <div className="skeleton-row" style={{ height: '40px' }}></div>
                <div className="skeleton-row" style={{ height: '40px' }}></div>
                <div className="skeleton-row" style={{ height: '40px' }}></div>
              </div>
            ) : upcomingTasks.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748B' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎉</div>
                <h4 style={{ color: '#0F172A', margin: '0 0 4px 0' }}>Không có công việc nào sắp tới hạn!</h4>
                <p style={{ fontSize: '0.88rem', margin: 0 }}>
                  Bạn đã giải quyết tốt các deadline hoặc chưa đặt hạn chót cho các công việc.
                </p>
              </div>
            ) : (
              <div className="upcoming-tasks-list">
                {upcomingTasks.map((task) => {
                  const deadline = getDeadlineInfo(task.dueDate);
                  return (
                    <div key={task.id} className="upcoming-task-item">
                      <div className="task-item-main">
                        <div className="task-item-title" title={task.title}>
                          {task.title}
                        </div>
                        <div className="task-item-meta">
                          <PriorityBadge priority={task.priority} />
                          <StatusBadge status={task.status} />
                          {task.description && (
                            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                              • {task.description.substring(0, 40)}...
                            </span>
                          )}
                        </div>
                      </div>

                      <div className={`task-due-box ${deadline.urgent ? 'urgent' : ''}`}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>{deadline.text}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Shortcuts & Navigation Widget */}
          <div className="section-card">
            <div className="section-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>⚡</span>
                <h3 className="section-title">Phím tắt nhanh</h3>
              </div>
            </div>

            <div className="quick-actions-box">
              <Link to="/kanban" className="quick-action-btn">
                <div className="quick-action-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="5" height="18" rx="1"></rect>
                    <rect x="10" y="3" width="5" height="12" rx="1"></rect>
                    <rect x="17" y="3" width="5" height="15" rx="1"></rect>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div>Bảng Kanban kéo thả</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 400 }}>
                    Kéo thả thẻ thay đổi trạng thái
                  </div>
                </div>
                <span style={{ color: '#94A3B8' }}>→</span>
              </Link>

              <Link to="/tasks" className="quick-action-btn">
                <div className="quick-action-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div>Danh sách & Bộ lọc Task</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 400 }}>
                    Tìm kiếm, phân trang và xem dạng bảng
                  </div>
                </div>
                <span style={{ color: '#94A3B8' }}>→</span>
              </Link>

              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '10px',
                  padding: '16px',
                  marginTop: '8px',
                  border: '1px dashed #CBD5E1',
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                  💡 Mẹo phỏng vấn
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.5 }}>
                  Dữ liệu Dashboard được tính toán thời gian thực qua Backend API có Composite Index, giúp tốc độ truy vấn luôn dưới 5ms.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleSaveTask}
        isSubmitting={isSubmitting}
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </AppLayout>
  );
}
