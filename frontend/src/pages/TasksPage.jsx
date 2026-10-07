import { useState, useEffect, useCallback } from 'react';
import AppLayout from '../components/layout/AppLayout';
import taskService from '../services/taskService';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import TaskModal from '../components/common/TaskModal';
import ConfirmModal from '../components/common/ConfirmModal';
import Toast from '../components/common/Toast';
import './Tasks.css';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
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
  }, [fetchTasks]);

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

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'DONE') return false;
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  const handleResetFilters = () => {
    setKeyword('');
    setStatusFilter('');
    setPriorityFilter('');
    setSortBy('createdAt');
    setSortDir('desc');
    setPage(0);
  };

  const isFiltered = keyword || statusFilter || priorityFilter || sortBy !== 'createdAt';

  return (
    <AppLayout
      title="My Tasks"
      extraAction={
        <button onClick={handleOpenCreateModal} className="btn-primary" id="btn-create-task-top">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Tạo công việc</span>
        </button>
      }
    >
      <div className="tasks-container">
        {/* Subheader info */}
        <div className="tasks-header">
          <div className="tasks-header-info">
            <h2>Danh sách công việc</h2>
            <p>Theo dõi tiến độ, lọc theo trạng thái và tối ưu hóa quy trình làm việc</p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="filter-toolbar">
          <div className="filter-group-left">
            {/* Search Input */}
            <div className="search-input-wrapper">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Tìm theo tiêu đề hoặc mô tả..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="search-input"
                id="search-task-input"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              className="filter-select"
              id="filter-status-select"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="TODO">Chờ làm (To Do)</option>
              <option value="IN_PROGRESS">Đang làm (In Progress)</option>
              <option value="DONE">Hoàn thành (Done)</option>
            </select>

            {/* Priority Filter */}
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
              <option value="HIGH">🔴 Ưu tiên Cao</option>
              <option value="MEDIUM">🟡 Ưu tiên Trung bình</option>
              <option value="LOW">🔵 Ưu tiên Thấp</option>
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
              <button
                onClick={handleResetFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4F46E5',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '6px 8px',
                }}
              >
                Đặt lại
              </button>
            )}
          </div>

          <div className="filter-group-right">
            {/* View Toggle */}
            <div className="view-toggle">
              <button
                onClick={() => setViewMode('table')}
                className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                title="Dạng bảng"
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
                title="Dạng lưới"
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
                  ? 'Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt các bộ lọc đang chọn.'
                  : 'Bắt đầu tổ chức công việc của bạn bằng cách tạo một task mới ngay bây giờ.'}
              </p>
              {isFiltered ? (
                <button onClick={handleResetFilters} className="btn-primary">
                  Xóa bộ lọc
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
                  <th style={{ width: '35%' }}>Công việc</th>
                  <th style={{ width: '15%' }}>Trạng thái</th>
                  <th style={{ width: '15%' }}>Mức ưu tiên</th>
                  <th style={{ width: '15%' }}>Hạn chót</th>
                  <th style={{ width: '12%' }}>Ngày tạo</th>
                  <th style={{ width: '8%', textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td className="task-title-cell">
                      <div className="task-title">{task.title}</div>
                      {task.description && (
                        <div className="task-desc" title={task.description}>
                          {task.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={task.status} />
                    </td>
                    <td>
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="due-date-cell">
                      <span>{formatDate(task.dueDate)}</span>
                      {isOverdue(task.dueDate, task.status) && (
                        <span className="overdue-tag">Quá hạn</span>
                      )}
                    </td>
                    <td>{formatDate(task.createdAt)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="action-buttons" style={{ justifyContent: 'center' }}>
                        <button
                          onClick={() => handleOpenEditModal(task)}
                          className="btn-icon edit"
                          title="Chỉnh sửa"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(task)}
                          className="btn-icon delete"
                          title="Xóa"
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
              <div key={task.id} className="task-grid-card">
                <div className="task-grid-header">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="task-grid-title">{task.title}</div>
                    {task.description && (
                      <div className="task-grid-desc">{task.description}</div>
                    )}
                  </div>
                  <div className="action-buttons">
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

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <StatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                </div>

                <div className="task-grid-footer">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>{formatDate(task.dueDate)}</span>
                    {isOverdue(task.dueDate, task.status) && (
                      <span className="overdue-tag">Quá hạn</span>
                    )}
                  </div>
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
                style={{ padding: '4px 8px', fontSize: '0.82rem' }}
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
