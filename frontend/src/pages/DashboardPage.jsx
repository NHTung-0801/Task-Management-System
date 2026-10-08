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

  const [distribution, setDistribution] = useState({
    high: 0,
    medium: 0,
    low: 0,
    urgentCount: 0,
    onTrackCount: 0,
  });

  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, upcomingRes, allTasksRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getUpcomingTasks(6),
        taskService.getTasks({ size: 100 }),
      ]);

      setStats(statsRes.data || { totalTasks: 0, todoTasks: 0, inProgressTasks: 0, doneTasks: 0 });
      setUpcomingTasks(upcomingRes.data || []);

      const taskList = allTasksRes.data?.content || [];
      let high = 0;
      let medium = 0;
      let low = 0;
      let urgent = 0;
      let onTrack = 0;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      taskList.forEach((t) => {
        if (t.priority === 'HIGH') high++;
        else if (t.priority === 'LOW') low++;
        else medium++;

        if (t.status !== 'DONE' && t.dueDate) {
          const due = new Date(t.dueDate);
          due.setHours(0, 0, 0, 0);
          const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
          if (diff <= 2) {
            urgent++;
          } else {
            onTrack++;
          }
        } else {
          onTrack++;
        }
      });

      setDistribution({
        high,
        medium,
        low,
        urgentCount: urgent,
        onTrackCount: onTrack,
      });
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

  const totalDist = distribution.high + distribution.medium + distribution.low || 1;
  const highPct = Math.round((distribution.high / totalDist) * 100);
  const mediumPct = Math.round((distribution.medium / totalDist) * 100);
  const lowPct = Math.max(0, 100 - highPct - mediumPct);

  const getDeadlineInfo = (dueDate) => {
    if (!dueDate) return { text: 'Không có hạn chót', urgent: false };
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
    if (diffDays === 2) {
      return { text: `Còn 2 ngày (${dateFormatted})`, urgent: true };
    }
    return { text: `Còn ${diffDays} ngày (${dateFormatted})`, urgent: false };
  };

  return (
    <AppLayout title="Dashboard">
      <div className="dashboard-container">
        {/* Welcome Banner */}
        <div className="welcome-banner">
          <div className="welcome-info">
            <h2>Xin chào, {currentUser.fullName || currentUser.username || 'Bạn'}!</h2>
            <p>
              Chào mừng bạn trở lại với Taskflow. Dưới đây là bức tranh tổng quan về tiến độ các dự án
              và những công việc cần được ưu tiên xử lý sớm.
            </p>
          </div>
          <button onClick={() => setIsTaskModalOpen(true)} className="btn-welcome-cta">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Tạo công việc mới</span>
          </button>
        </div>

        {/* 4 Stat Cards */}
        <div className="stat-cards-grid">
          {/* Card 1: Total */}
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Tổng số công việc</span>
              <div className="stat-icon total">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <span className="stat-title">Chờ thực hiện</span>
              <div className="stat-icon todo">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

          {/* Card 3: In Progress - Progress loop icon instead of lightning bolt */}
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Đang thực hiện</span>
              <div className="stat-icon inprogress">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
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
              <span className="stat-title">Đã hoàn thành</span>
              <div className="stat-icon done">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

        {/* Two-Column Grid: Upcoming Deadlines & Priority Distribution */}
        <div className="dashboard-grid-layout">
          {/* Cột trái: Công việc sắp tới hạn (Tinh gọn, rõ ràng) */}
          <div className="section-card upcoming-section">
            <div className="section-header">
              <div className="section-title-wrap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <h3 className="section-title">Công việc sắp tới hạn</h3>
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
              <div className="empty-tasks-state">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <h4>Không có công việc nào sắp tới hạn</h4>
                <p>Tất cả tiến độ công việc đều đang được kiểm soát rất tốt.</p>
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

          {/* Cột phải: Phân bổ mức độ quan trọng & Sức khỏe tiến độ */}
          <div className="section-card priority-section">
            <div className="section-header">
              <div className="section-title-wrap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
                <h3 className="section-title">Phân bổ mức độ quan trọng</h3>
              </div>
            </div>

            <div className="priority-insights-box">
              {/* Stacked Segmented Progress Bar */}
              <div className="priority-segmented-bar" title="Thanh phân bổ mức độ quan trọng">
                <div
                  className="segment-fill segment-high"
                  style={{ width: `${highPct}%` }}
                  title={`Ưu tiên cao: ${distribution.high} (${highPct}%)`}
                />
                <div
                  className="segment-fill segment-medium"
                  style={{ width: `${mediumPct}%` }}
                  title={`Ưu tiên trung bình: ${distribution.medium} (${mediumPct}%)`}
                />
                <div
                  className="segment-fill segment-low"
                  style={{ width: `${lowPct}%` }}
                  title={`Ưu tiên thấp: ${distribution.low} (${lowPct}%)`}
                />
              </div>

              {/* Danh sách 3 mức ưu tiên */}
              <div className="priority-breakdown-list">
                <div className="priority-breakdown-row">
                  <div className="priority-label-wrap">
                    <span className="priority-dot dot-high" />
                    <span className="priority-name">Ưu tiên cao</span>
                  </div>
                  <div className="priority-stats-wrap">
                    <span className="priority-count">{distribution.high} công việc</span>
                    <span className="priority-percentage">({highPct}%)</span>
                  </div>
                </div>

                <div className="priority-breakdown-row">
                  <div className="priority-label-wrap">
                    <span className="priority-dot dot-medium" />
                    <span className="priority-name">Ưu tiên trung bình</span>
                  </div>
                  <div className="priority-stats-wrap">
                    <span className="priority-count">{distribution.medium} công việc</span>
                    <span className="priority-percentage">({mediumPct}%)</span>
                  </div>
                </div>

                <div className="priority-breakdown-row">
                  <div className="priority-label-wrap">
                    <span className="priority-dot dot-low" />
                    <span className="priority-name">Ưu tiên thấp</span>
                  </div>
                  <div className="priority-stats-wrap">
                    <span className="priority-count">{distribution.low} công việc</span>
                    <span className="priority-percentage">({lowPct}%)</span>
                  </div>
                </div>
              </div>

              {/* Tình trạng sức khỏe tiến độ */}
              <div className="health-tracker-grid">
                <div className="health-card urgent">
                  <div className="health-card-header">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span>Cần chú ý gấp</span>
                  </div>
                  <div className="health-card-value">
                    {distribution.urgentCount} <span>việc</span>
                  </div>
                  <div className="health-card-desc">Quá hạn hoặc tới hạn trong 2 ngày</div>
                </div>

                <div className="health-card ontrack">
                  <div className="health-card-header">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>Đúng tiến độ</span>
                  </div>
                  <div className="health-card-value">
                    {distribution.onTrackCount} <span>việc</span>
                  </div>
                  <div className="health-card-desc">Trong thời hạn an toàn</div>
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
