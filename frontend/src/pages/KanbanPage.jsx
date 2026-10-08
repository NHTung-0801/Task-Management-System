import { useState, useEffect, useCallback, useRef } from 'react';
import AppLayout from '../components/layout/AppLayout';
import taskService from '../services/taskService';
import PriorityBadge from '../components/common/PriorityBadge';
import TaskModal from '../components/common/TaskModal';
import ConfirmModal from '../components/common/ConfirmModal';
import Toast from '../components/common/Toast';
import './Kanban.css';

const COLUMNS = [
  { id: 'TODO', label: 'Chờ thực hiện', indicator: 'todo' },
  { id: 'IN_PROGRESS', label: 'Đang thực hiện', indicator: 'in_progress' },
  { id: 'DONE', label: 'Đã hoàn thành', indicator: 'done' },
];

export default function KanbanPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const overlayRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0, width: 300 });
  const initialPosRef = useRef({ left: 0, top: 0 });

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toast, setToast] = useState({ message: '', type: 'success' });

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await taskService.getTasks({ size: 100, sortBy: 'createdAt', sortDir: 'desc' });
      setTasks(response.data.content || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách Kanban:', err);
      setToast({
        message: err.response?.data?.message || 'Không thể tải danh sách công việc',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Lắng nghe di chuyển chuột khi đang kéo thẻ để di chuyển Custom Drag Overlay 60FPS không giật
  useEffect(() => {
    if (!draggedTask) return;

    const onGlobalDragOver = (e) => {
      e.preventDefault();
      if (e.clientX === 0 && e.clientY === 0) return;
      if (overlayRef.current) {
        overlayRef.current.style.left = `${e.clientX - dragOffsetRef.current.x}px`;
        overlayRef.current.style.top = `${e.clientY - dragOffsetRef.current.y}px`;
      }
    };

    window.addEventListener('dragover', onGlobalDragOver);
    return () => {
      window.removeEventListener('dragover', onGlobalDragOver);
    };
  }, [draggedTask]);

  const handleDragStart = (e, task) => {
    e.dataTransfer.setData('text/plain', String(task.id));
    e.dataTransfer.effectAllowed = 'move';

    // 1. Tạo 1 canvas 1x1 trong suốt để triệt tiêu hoàn toàn drag ghost mờ mặc định của Chrome
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    e.dataTransfer.setDragImage(canvas, 0, 0);

    // 2. Tính toán vị trí chuột so với góc trái thẻ
    const rect = e.currentTarget.getBoundingClientRect();
    dragOffsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      width: rect.width,
    };
    initialPosRef.current = {
      left: rect.left,
      top: rect.top,
    };

    setDraggedTaskId(task.id);
    setDraggedTask(task);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDragOverColumn(null);

    const taskIdStr = e.dataTransfer.getData('text/plain');
    const taskId = Number(taskIdStr || draggedTaskId);

    setDraggedTaskId(null);
    setDraggedTask(null);

    if (!taskId) return;

    const taskToMove = tasks.find((t) => t.id === taskId);
    if (!taskToMove || taskToMove.status === targetStatus) return;

    await updateTaskStatus(taskToMove, targetStatus);
  };

  const updateTaskStatus = async (task, newStatus) => {
    const previousTasks = [...tasks];

    // Optimistic UI update: cập nhật state ngay lập tức để giao diện mượt mà
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );

    try {
      await taskService.updateTask(task.id, {
        title: task.title,
        description: task.description,
        status: newStatus,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.substring(0, 10) : null,
      });

      const statusLabels = {
        TODO: 'Chờ thực hiện',
        IN_PROGRESS: 'Đang thực hiện',
        DONE: 'Đã hoàn thành',
      };
      setToast({
        message: `Đã chuyển "${task.title}" sang "${statusLabels[newStatus]}"!`,
        type: 'success',
      });
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái:', err);
      // Rollback về danh sách cũ nếu API thất bại
      setTasks(previousTasks);
      setToast({
        message: err.response?.data?.message || 'Không thể cập nhật trạng thái công việc',
        type: 'error',
      });
    }
  };

  const handleOpenCreateWithStatus = (status = 'TODO') => {
    setEditingTask({ status, priority: 'MEDIUM' });
    setIsTaskModalOpen(true);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (formData) => {
    try {
      setIsSubmitting(true);
      if (editingTask && editingTask.id) {
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

  const handleOpenDelete = (task) => {
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
    if (!dateString) return null;
    try {
      const d = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
      }).format(d);
    } catch {
      return dateString;
    }
  };

  const renderDeadlineBadge = (dueDate, status) => {
    if (!dueDate) return null;
    const target = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    const formatted = formatDate(dueDate);

    if (status === 'DONE') {
      return (
        <span className="card-due-tag done" title={`Đã hoàn thành - Hạn: ${formatted}`}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>{formatted}</span>
        </span>
      );
    }

    if (diffDays < 0) {
      return (
        <span className="card-due-tag overdue" title={`Quá hạn ${Math.abs(diffDays)} ngày (${formatted})`}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>Quá hạn</span>
        </span>
      );
    }

    if (diffDays === 0) {
      return (
        <span className="card-due-tag today" title={`Hôm nay là hạn chót (${formatted})`}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>Hôm nay</span>
        </span>
      );
    }

    if (diffDays === 1) {
      return (
        <span className="card-due-tag tomorrow" title={`Hạn chót ngày mai (${formatted})`}>
          <span>Ngày mai</span>
        </span>
      );
    }

    return (
      <span className="card-due-tag normal" title={`Hạn chót: ${formatted}`}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
        </svg>
        <span>{formatted}</span>
      </span>
    );
  };

  const filteredTasks = tasks.filter((task) => {
    if (priorityFilter && task.priority !== priorityFilter) return false;
    if (!searchKeyword.trim()) return true;
    const q = searchKeyword.toLowerCase();
    return task.title.toLowerCase().includes(q);
  });

  return (
    <AppLayout title="Projects">
      <div className="kanban-container">
        {/* Header Title */}
        <div className="kanban-header">
          <div className="kanban-header-info">
            <h2>Quy trình làm việc</h2>
            <p>Kéo thả các thẻ công việc giữa các cột để cập nhật tiến độ tức thì</p>
          </div>
          <button
            onClick={() => handleOpenCreateWithStatus('TODO')}
            className="btn-primary"
            id="btn-create-task-kanban"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Tạo công việc</span>
          </button>
        </div>

        {/* Toolbar Cố định 1 hàng */}
        <div className="kanban-toolbar">
          <div className="kanban-toolbar-left">
            <div className="kanban-search-wrapper">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="kanban-search-input"
              />
              {searchKeyword && (
                <button
                  type="button"
                  className="btn-clear-kanban-search"
                  onClick={() => setSearchKeyword('')}
                  title="Xóa tìm kiếm"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="kanban-priority-select"
              title="Lọc theo mức ưu tiên"
            >
              <option value="">Tất cả mức ưu tiên</option>
              <option value="HIGH">Ưu tiên Cao</option>
              <option value="MEDIUM">Ưu tiên Trung bình</option>
              <option value="LOW">Ưu tiên Thấp</option>
            </select>

            {(searchKeyword || priorityFilter) && (
              <button
                onClick={() => {
                  setSearchKeyword('');
                  setPriorityFilter('');
                }}
                className="btn-kanban-reset"
                title="Đặt lại bộ lọc"
              >
                Đặt lại
              </button>
            )}
          </div>

          <div className="kanban-stats-summary">
            <span>
              Tổng số: <strong>{tasks.length}</strong> công việc
            </span>
            <span>•</span>
            <span>
              Hoàn thành:{' '}
              <strong style={{ color: '#16A34A' }}>
                {tasks.filter((t) => t.status === 'DONE').length}
              </strong>
            </span>
          </div>
        </div>

        {/* Kanban Board (3 Cột Cố Định Chiều Ngang 100%) */}
        {loading ? (
          <div className="kanban-board">
            <div className="kanban-column" style={{ padding: '20px' }}>
              <div className="skeleton-row" style={{ height: '80px' }}></div>
              <div className="skeleton-row" style={{ height: '80px' }}></div>
            </div>
            <div className="kanban-column" style={{ padding: '20px' }}>
              <div className="skeleton-row" style={{ height: '80px' }}></div>
            </div>
            <div className="kanban-column" style={{ padding: '20px' }}>
              <div className="skeleton-row" style={{ height: '80px' }}></div>
            </div>
          </div>
        ) : (
          <div className="kanban-board">
            {COLUMNS.map((col) => {
              const columnTasks = filteredTasks.filter((t) => t.status === col.id);
              const isDragOver = dragOverColumn === col.id;

              return (
                <div
                  key={col.id}
                  className={`kanban-column ${isDragOver ? 'drag-over' : ''}`}
                  onDragOver={(e) => handleDragOver(e, col.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, col.id)}
                >
                  {/* Column Header */}
                  <div className="column-header">
                    <div className="column-title-group">
                      <span className={`column-indicator ${col.indicator}`} />
                      <h3 className="column-title">{col.label}</h3>
                      <span className="column-count">{columnTasks.length}</span>
                    </div>

                    <button
                      onClick={() => handleOpenCreateWithStatus(col.id)}
                      className="btn-add-column-task"
                      title={`Thêm công việc vào ${col.label}`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </button>
                  </div>

                  {/* Cards Container (Cuộn dọc nội bộ) */}
                  <div className="column-cards">
                    {columnTasks.length === 0 ? (
                      <div className="column-empty-dropzone">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="3 3"></rect>
                        </svg>
                        <span>Kéo thẻ vào đây hoặc bấm (+) để tạo</span>
                      </div>
                    ) : (
                      columnTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`kanban-card ${draggedTaskId === task.id ? 'is-dragging' : ''}`}
                          draggable={true}
                          onDragStart={(e) => handleDragStart(e, task)}
                          onDragEnd={handleDragEnd}
                          onClick={() => handleOpenEdit(task)}
                          title="Nhấp để xem và chỉnh sửa chi tiết"
                        >
                          {/* Card Top: Thời gian (trái) + Mức ưu tiên (phải) */}
                          <div className="card-top">
                            <div className="card-top-left">
                              {renderDeadlineBadge(task.dueDate, task.status)}
                            </div>
                            <div className="card-top-right">
                              <PriorityBadge priority={task.priority} />
                            </div>
                          </div>

                          {/* Card Title */}
                          <h4 className="card-title">{task.title}</h4>

                          {/* Card Footer: Nút Sửa & Xóa đưa xuống cuối thay cho số thứ tự */}
                          <div className="card-footer" onClick={(e) => e.stopPropagation()}>
                            <div className="card-actions">
                              <button
                                onClick={() => handleOpenEdit(task)}
                                className="card-action-btn edit"
                                title="Chỉnh sửa công việc"
                                aria-label="Chỉnh sửa công việc"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                              </button>

                              <button
                                onClick={() => handleOpenDelete(task)}
                                className="card-action-btn delete"
                                title="Xóa công việc"
                                aria-label="Xóa công việc"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}

                    {/* Nút mờ nhỏ thêm công việc ở cuối cột */}
                    <button
                      type="button"
                      className="btn-quick-add-card"
                      onClick={() => handleOpenCreateWithStatus(col.id)}
                      title={`Thêm công việc vào ${col.label}`}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      <span>Thêm công việc</span>
                    </button>
                  </div>
                </div>
              );
            })}
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
            ? `Bạn có chắc muốn xóa vĩnh viễn thẻ công việc "${deletingTask.title}"?`
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

      {/* Custom Drag Overlay: Rõ nét 100%, không bị Chrome làm mờ */}
      {draggedTask && (
        <div
          ref={overlayRef}
          className="kanban-drag-overlay"
          style={{
            width: `${dragOffsetRef.current.width}px`,
            left: `${initialPosRef.current.left}px`,
            top: `${initialPosRef.current.top}px`,
          }}
        >
          <div className="card-top">
            <div className="card-top-left">
              {renderDeadlineBadge(draggedTask.dueDate, draggedTask.status)}
            </div>
            <div className="card-top-right">
              <PriorityBadge priority={draggedTask.priority} />
            </div>
          </div>
          <h4 className="card-title">{draggedTask.title}</h4>
        </div>
      )}
    </AppLayout>
  );
}
