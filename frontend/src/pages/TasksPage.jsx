import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import taskService from '../services/taskService';
import dashboardService from '../services/dashboardService';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import TaskModal from '../components/common/TaskModal';
import ConfirmModal from '../components/common/ConfirmModal';
import Toast from '../components/common/Toast';
import './Tasks.css';

export default function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialUrlKeyword = searchParams.get('keyword') || '';

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [stats, setStats] = useState({
    totalTasks: 0,
    todoTasks: 0,
    inProgressTasks: 0,
    doneTasks: 0,
  });

  const [keyword, setKeyword] = useState(initialUrlKeyword);
  const [debouncedKeyword, setDebouncedKeyword] = useState(initialUrlKeyword);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [viewMode, setViewMode] = useState('table');

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword);
      setPage(0);
    }, 350);
    return () => clearTimeout(handler);
  }, [keyword]);

  // Synchronize keyword when URL query param changes
  useEffect(() => {
    const q = searchParams.get('keyword') || '';
    if (q !== keyword) {
      setKeyword(q);
      setDebouncedKeyword(q);
      setPage(0);
    }
  }, [searchParams]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await dashboardService.getStats();
      if (res.data) setStats(res.data);
    } catch (err) {
      console.error('Lỗi khi tải thống kê tab:', err);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size,
        sortBy,
        sortDir,
      };
      if (debouncedKeyword.trim()) params.keyword = debouncedKeyword.trim();
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;

      const response = await taskService.getTasks(params);
      const data = response.data;
      setTasks(data.content || []);
      setTotalElements(data.totalElements || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Lỗi khi tải danh sách công việc:', err);
      setToast({
        message: err.response?.data?.message || 'Không thể tải danh sách công việc',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [page, size, debouncedKeyword, statusFilter, priorityFilter, sortBy, sortDir]);

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [fetchTasks, fetchStats]);

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (formData) => {
    try {
      setIsSubmitting(true);
      if (editingTask) {
        await taskService.updateTask(editingTask.id, formData);
        setToast({ message: 'Đã cập nhật công việc thành công!', type: 'success' });
      } else {
        await taskService.createTask(formData);
        setToast({ message: 'Tạo công việc mới thành công!', type: 'success' });
      }
      setIsTaskModalOpen(false);
      fetchTasks();
      fetchStats();
    } catch (err) {
      console.error('Lỗi khi lưu công việc:', err);
      setToast({
        message: err.response?.data?.message || 'Có lỗi xảy ra khi lưu công việc',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (task) => {
    setDeletingTask(task);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTask) return;
    try {
      setIsDeleting(true);
      await taskService.deleteTask(deletingTask.id);
      setToast({ message: 'Đã xóa công việc thành công!', type: 'success' });
      setIsDeleteModalOpen(false);
      setDeletingTask(null);
      fetchTasks();
      fetchStats();
    } catch (err) {
      console.error('Lỗi khi xóa công việc:', err);
      setToast({
        message: err.response?.data?.message || 'Có lỗi xảy ra khi xóa công việc',
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const renderDeadlineBadge = (dueDate, status) => {
    if (!dueDate) return <span className="deadline-none">—</span>;
    const target = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    const formatted = formatDate(dueDate);

    if (status === 'DONE') {
      return (
        <span className="deadline-badge done" title={`Đã hoàn thành - Hạn chót: ${formatted}`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>{formatted}</span>
        </span>
      );
    }

    if (diffDays < 0) {
      return (
        <span className="deadline-badge overdue" title={`Quá hạn ${Math.abs(diffDays)} ngày`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>Quá hạn ({formatted})</span>
        </span>
      );
    }

    if (diffDays === 0) {
      return (
        <span className="deadline-badge today" title="Hôm nay là hạn chót!">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>Hôm nay ({formatted})</span>
        </span>
      );
    }

    if (diffDays === 1) {
      return (
        <span className="deadline-badge tomorrow" title="Hạn chót ngày mai!">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>Ngày mai ({formatted})</span>
        </span>
      );
    }

    return (
      <span className="deadline-badge normal" title={`Hạn chót: ${formatted}`}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <span>{formatted}</span>
      </span>
    );
  };

  const handleResetFilters = () => {
    setKeyword('');
    setDebouncedKeyword('');
    setStatusFilter('');
    setPriorityFilter('');
    setSortBy('createdAt');
    setSortDir('desc');
    setPage(0);
    setSearchParams({}, { replace: true });
  };

  const isFiltered = keyword || statusFilter || priorityFilter || sortBy !== 'createdAt';

  return (
    <AppLayout title="My Tasks">
      <div className="tasks-container">
        {/* Header Title */}
        <div className="tasks-header">
          <div className="tasks-header-info">
            <h2>Danh sách công việc</h2>
            <p>Theo dõi tiến độ, quản lý mức độ ưu tiên và tối ưu hóa quy trình làm việc</p>
          </div>
          <button onClick={handleOpenCreateModal} className="btn-primary" id="btn-create-task-main">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Tạo công việc</span>
          </button>
        </div>

        {/* 1-Click Segmented Status Tabs */}
        <div className="status-tabs-container">
          <button
            className={`status-tab ${statusFilter === '' ? 'active' : ''}`}
            onClick={() => {
              setStatusFilter('');
              setPage(0);
            }}
          >
            <span>Tất cả</span>
            <span className="tab-count">{stats.totalTasks}</span>
          </button>

          <button
            className={`status-tab ${statusFilter === 'TODO' ? 'active' : ''}`}
            onClick={() => {
              setStatusFilter('TODO');
              setPage(0);
            }}
          >
            <span className="tab-indicator todo" />
            <span>Chờ thực hiện</span>
            <span className="tab-count">{stats.todoTasks}</span>
          </button>

          <button
            className={`status-tab ${statusFilter === 'IN_PROGRESS' ? 'active' : ''}`}
            onClick={() => {
              setStatusFilter('IN_PROGRESS');
              setPage(0);
            }}
          >
            <span className="tab-indicator inprogress" />
            <span>Đang thực hiện</span>
            <span className="tab-count">{stats.inProgressTasks}</span>
          </button>

          <button
            className={`status-tab ${statusFilter === 'DONE' ? 'active' : ''}`}
            onClick={() => {
              setStatusFilter('DONE');
              setPage(0);
            }}
          >
            <span className="tab-indicator done" />
            <span>Đã hoàn thành</span>
            <span className="tab-count">{stats.doneTasks}</span>
          </button>
        </div>

        {/* Unified 1-Line Filter Toolbar (No wrap / No rớt dòng) */}
        <div className="filter-toolbar">
          <div className="filter-group-left">
            {/* Search Input */}
            <div className="search-input-wrapper">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="search-input"
                id="search-task-input"
              />
              {keyword && (
                <button
                  type="button"
                  className="btn-clear-search"
                  onClick={() => {
                    setKeyword('');
                    setSearchParams({}, { replace: true });
                  }}
                  title="Xóa tìm kiếm"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Priority Filter (Thuần Việt, không emoji) */}
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(0);
              }}
              className="filter-select"
              id="filter-priority-select"
            >
              <option value="">Tất cả mức ưu tiên</option>
              <option value="HIGH">Ưu tiên Cao</option>
              <option value="MEDIUM">Ưu tiên Trung bình</option>
              <option value="LOW">Ưu tiên Thấp</option>
            </select>

            {/* Sort Select */}
            <select
              value={`${sortBy}-${sortDir}`}
              onChange={(e) => {
                const [sb, sd] = e.target.value.split('-');
                setSortBy(sb);
                setSortDir(sd);
                setPage(0);
              }}
              className="filter-select"
              id="filter-sort-select"
            >
              <option value="createdAt-desc">Mới tạo nhất</option>
              <option value="createdAt-asc">Cũ nhất</option>
              <option value="dueDate-asc">Hạn chót gần nhất</option>
              <option value="priority-desc">Mức ưu tiên cao nhất</option>
            </select>

            {/* Reset Button */}
            {isFiltered && (
              <button onClick={handleResetFilters} className="btn-reset-filter" title="Đặt lại bộ lọc">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="1 4 1 10 7 10"></polyline>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                </svg>
                <span>Đặt lại</span>
              </button>
            )}
          </div>

          <div className="filter-group-right">
            {/* View Toggle */}
            <div className="view-toggle">
              <button
                onClick={() => setViewMode('table')}
                className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                title="Dạng bảng danh sách"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                title="Dạng lưới thẻ"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="table-card" style={{ padding: '24px' }}>
            <div className="skeleton-row" style={{ width: '100%' }}></div>
            <div className="skeleton-row" style={{ width: '100%' }}></div>
            <div className="skeleton-row" style={{ width: '100%' }}></div>
            <div className="skeleton-row" style={{ width: '100%' }}></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="table-card">
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <h3 className="empty-title">
                {isFiltered ? 'Không tìm thấy công việc nào phù hợp' : 'Chưa có công việc nào'}
              </h3>
              <p className="empty-desc">
                {isFiltered
                  ? 'Hãy thử thay đổi từ khóa tìm kiếm hoặc bấm Đặt lại để xem tất cả.'
                  : 'Bắt đầu tổ chức công việc của bạn bằng cách tạo một task mới ngay bây giờ.'}
              </p>
              {isFiltered ? (
                <button onClick={handleResetFilters} className="btn-primary">
                  Đặt lại bộ lọc
                </button>
              ) : (
                <button onClick={handleOpenCreateModal} className="btn-primary">
                  + Tạo công việc đầu tiên
                </button>
              )}
            </div>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div className="table-card">
            <table className="tasks-table">
              <thead>
                <tr>
                  <th style={{ width: '42%' }}>Công việc</th>
                  <th style={{ width: '16%' }}>Trạng thái</th>
                  <th style={{ width: '16%' }}>Mức ưu tiên</th>
                  <th style={{ width: '18%' }}>Hạn chót</th>
                  <th style={{ width: '8%', textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    onClick={() => handleOpenEditModal(task)}
                    className="task-row"
                    title="Nhấn để xem và chỉnh sửa chi tiết"
                  >
                    <td className="task-title-cell">
                      <div className="task-title">{task.title}</div>
                    </td>
                    <td>
                      <StatusBadge status={task.status} />
                    </td>
                    <td>
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="due-date-cell">
                      {renderDeadlineBadge(task.dueDate, task.status)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div
                        className="action-buttons"
                        style={{ justifyContent: 'center' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleOpenEditModal(task)}
                          className="btn-icon edit"
                          title="Chỉnh sửa công việc"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(task)}
                          className="btn-icon delete"
                          title="Xóa công việc"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid View */
          <div className="tasks-grid">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="task-grid-card"
                onClick={() => handleOpenEditModal(task)}
                title="Nhấn để xem và chỉnh sửa"
              >
                <div className="task-grid-header">
                  <div className="task-grid-badges">
                    <StatusBadge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                  </div>
                  <div className="action-buttons" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleOpenEditModal(task)}
                      className="btn-icon edit"
                      title="Sửa"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(task)}
                      className="btn-icon delete"
                      title="Xóa"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="task-grid-title">{task.title}</div>

                <div className="task-grid-footer">
                  {renderDeadlineBadge(task.dueDate, task.status)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {totalElements > 0 && (
          <div className="pagination-container">
            <div>
              Hiển thị <strong>{page * size + 1}</strong> - <strong>{Math.min((page + 1) * size, totalElements)}</strong> trong <strong>{totalElements}</strong> công việc
            </div>

            <div className="pagination-controls">
              <select
                value={size}
                onChange={(e) => {
                  setSize(Number(e.target.value));
                  setPage(0);
                }}
                className="filter-select"
                style={{ padding: '0 8px', height: '34px', fontSize: '0.82rem' }}
              >
                <option value={5}>5 / trang</option>
                <option value={10}>10 / trang</option>
                <option value={20}>20 / trang</option>
                <option value={50}>50 / trang</option>
              </select>

              <button
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                disabled={page === 0}
                className="page-btn"
              >
                ← Trước
              </button>

              {Array.from({ length: totalPages }, (_, idx) => (
                <button
                  key={idx}
                  onClick={() => setPage(idx)}
                  className={`page-btn ${page === idx ? 'active' : ''}`}
                >
                  {idx + 1}
                </button>
              ))}

              <button
                onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
                disabled={page >= totalPages - 1}
                className="page-btn"
              >
                Sau →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Task Modal (Create & Edit) */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleSaveTask}
        initialData={editingTask}
        isSubmitting={isSubmitting}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Xác nhận xóa công việc"
        message={
          deletingTask
            ? `Bạn có chắc chắn muốn xóa vĩnh viễn công việc "${deletingTask.title}"? Hành động này không thể hoàn tác.`
            : 'Xác nhận xóa công việc này?'
        }
        onConfirm={handleConfirmDelete}
        onClose={() => setIsDeleteModalOpen(false)}
        isDeleting={isDeleting}
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
