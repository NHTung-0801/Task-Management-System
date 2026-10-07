import { useState, useEffect, useCallback, useMemo } from 'react';
import AppLayout from '../components/layout/AppLayout';
import taskService from '../services/taskService';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import TaskModal from '../components/common/TaskModal';
import ConfirmModal from '../components/common/ConfirmModal';
import Toast from '../components/common/Toast';
import './Calendar.css';

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

function padZero(num) {
  return num < 10 ? `0${num}` : `${num}`;
}

function formatDateKey(year, month, day) {
  return `${year}-${padZero(month + 1)}-${padZero(day)}`;
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export default function CalendarPage() {
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(
    () => formatDateKey(today.getFullYear(), today.getMonth(), today.getDate()),
    [today]
  );

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

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
      const res = await taskService.getTasks({
        size: 100,
        sortBy: 'dueDate',
        sortDir: 'asc',
      });
      setTasks(res.data.content || []);
    } catch (err) {
      console.error('Lỗi khi tải tasks cho lịch:', err);
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

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(todayStr);
  };

  const tasksByDate = useMemo(() => {
    const map = new Map();
    tasks.forEach((t) => {
      if (t.dueDate) {
        const key = t.dueDate.substring(0, 10);
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(t);
      }
    });
    return map;
  }, [tasks]);

  const monthStats = useMemo(() => {
    const prefix = `${currentYear}-${padZero(currentMonth + 1)}`;
    const monthTasks = tasks.filter((t) => t.dueDate && t.dueDate.startsWith(prefix));
    const total = monthTasks.length;
    const done = monthTasks.filter((t) => t.status === 'DONE').length;
    const inProgress = monthTasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const overdue = monthTasks.filter(
      (t) => t.dueDate < todayStr && t.status !== 'DONE'
    ).length;

    return { total, done, inProgress, overdue };
  }, [tasks, currentYear, currentMonth, todayStr]);

  const calendarCells = useMemo(() => {
    const firstDayObj = new Date(currentYear, currentMonth, 1);
    // Chuyển sang tuần bắt đầu từ Thứ Hai (0 = T2 ... 6 = CN)
    const startWeekday = (firstDayObj.getDay() + 6) % 7;

    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const cells = [];

    // Lấp đầy ngày của tháng trước cho tuần đầu tiên
    for (let i = startWeekday - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateKey = formatDateKey(prevYear, prevMonth, day);
      cells.push({
        dayNumber: day,
        dateKey,
        isOtherMonth: true,
      });
    }

    // Các ngày trong tháng hiện tại
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const dateKey = formatDateKey(currentYear, currentMonth, day);
      cells.push({
        dayNumber: day,
        dateKey,
        isOtherMonth: false,
      });
    }

    // Lấp đầy tuần cuối bằng ngày của tháng sau (tổng 35 hoặc 42 ô)
    const totalCells = cells.length > 35 ? 42 : 35;
    const remaining = totalCells - cells.length;
    for (let day = 1; day <= remaining; day++) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateKey = formatDateKey(nextYear, nextMonth, day);
      cells.push({
        dayNumber: day,
        dateKey,
        isOtherMonth: true,
      });
    }

    return cells;
  }, [currentYear, currentMonth]);

  const selectedDayTasks = useMemo(() => {
    return tasksByDate.get(selectedDate) || [];
  }, [tasksByDate, selectedDate]);

  const handleOpenCreateModal = (dateStr) => {
    setEditingTask({ dueDate: dateStr || selectedDate });
    setIsTaskModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      if (editingTask && editingTask.id) {
        await taskService.updateTask(editingTask.id, formData);
        setToast({ message: 'Cập nhật công việc thành công!', type: 'success' });
      } else {
        await taskService.createTask(formData);
        setToast({ message: 'Tạo công việc mới thành công!', type: 'success' });
      }
      setIsTaskModalOpen(false);
      setEditingTask(null);
      await fetchTasks();
    } catch (err) {
      console.error('Lỗi lưu task:', err);
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
      await fetchTasks();
    } catch (err) {
      console.error('Lỗi xóa task:', err);
      setToast({
        message: err.response?.data?.message || 'Không thể xóa công việc',
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleTaskStatus = async (task) => {
    try {
      const nextStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
      await taskService.updateTask(task.id, {
        title: task.title,
        description: task.description,
        status: nextStatus,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.substring(0, 10) : null,
      });
      setToast({
        message: `Đã đổi trạng thái sang ${nextStatus === 'DONE' ? 'Hoàn thành' : 'Cần làm'}`,
        type: 'success',
      });
      await fetchTasks();
    } catch (err) {
      console.error('Lỗi đổi trạng thái:', err);
      setToast({ message: 'Không thể cập nhật trạng thái', type: 'error' });
    }
  };

  const monthLabel = new Intl.DateTimeFormat('vi-VN', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(currentYear, currentMonth, 1));

  return (
    <AppLayout title="Calendar">
      <div className="calendar-page-container">
        {/* Header Title & Primary Action */}
        <div className="calendar-header">
          <div className="calendar-header-info">
            <h2>Lịch công việc</h2>
            <p>Theo dõi và quản lý thời hạn hoàn thành công việc theo dòng thời gian</p>
          </div>
          <button
            onClick={() => handleOpenCreateModal(selectedDate)}
            className="btn-primary"
            id="btn-create-task-calendar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Tạo công việc</span>
          </button>
        </div>

        <div className="calendar-top-bar">
          <div className="calendar-title-wrap">
            <h3 className="calendar-month-title" style={{ textTransform: 'capitalize' }}>
              {monthLabel}
            </h3>
            <span className="calendar-month-badge">
              {monthStats.total} công việc
            </span>
            {monthStats.overdue > 0 && (
              <span className="calendar-overdue-badge">
                {monthStats.overdue} quá hạn
              </span>
            )}
          </div>

          <div className="calendar-nav-controls">
            <button
              className="btn-nav-month"
              onClick={handlePrevMonth}
              title="Tháng trước"
              aria-label="Tháng trước"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button
              className="btn-nav-month"
              onClick={handleNextMonth}
              title="Tháng sau"
              aria-label="Tháng sau"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
            <button className="btn-today" onClick={handleToday}>
              Hôm nay
            </button>
          </div>
        </div>

        <div className="calendar-layout">
          <div className="calendar-grid-card">
            <div className="calendar-weekdays-header">
              {WEEKDAYS.map((day) => (
                <div key={day} className="weekday-header-cell">
                  {day}
                </div>
              ))}
            </div>

            <div className="calendar-cells-grid">
              {calendarCells.map((cell) => {
                const dayTasks = tasksByDate.get(cell.dateKey) || [];
                const isSelected = cell.dateKey === selectedDate;
                const isToday = cell.dateKey === todayStr;

                return (
                  <div
                    key={cell.dateKey}
                    className={`day-cell ${cell.isOtherMonth ? 'other-month' : ''} ${
                      isSelected ? 'is-selected' : ''
                    } ${isToday ? 'is-today' : ''}`}
                    onClick={() => setSelectedDate(cell.dateKey)}
                  >
                    <div className="day-cell-top">
                      <span className="day-number">{cell.dayNumber}</span>
                      {dayTasks.length > 0 && (
                        <span className="day-task-count-badge">
                          {dayTasks.length} việc
                        </span>
                      )}
                    </div>

                    {dayTasks.length > 0 && (
                      <div className="day-cell-content">
                        <div className="day-dots-container">
                          {dayTasks.slice(0, 4).map((t) => {
                            let dotType = 'dot-medium';
                            if (t.status === 'DONE') dotType = 'dot-done';
                            else if (t.priority === 'HIGH') dotType = 'dot-high';
                            else if (t.priority === 'LOW') dotType = 'dot-low';

                            return (
                              <span
                                key={t.id}
                                className={`cal-dot ${dotType}`}
                                title={`${t.title} (${t.priority === 'HIGH' ? 'Cao' : t.priority === 'MEDIUM' ? 'Trung bình' : 'Thấp'} • ${t.status === 'DONE' ? 'Hoàn thành' : 'Chưa xong'})`}
                              />
                            );
                          })}
                          {dayTasks.length > 4 && (
                            <span className="cal-dot-extra">+{dayTasks.length - 4}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="day-details-panel">
            <div className="day-details-header">
              <div className="day-details-title-wrap">
                <h3 className="day-details-date-title">Chi tiết công việc</h3>
                <p className="day-details-date-subtitle">
                  {formatDisplayDate(selectedDate)}
                </p>
                {selectedDayTasks.length > 0 && (
                  <div className="day-progress-container">
                    <div className="day-progress-info">
                      <span className="day-progress-text">
                        {selectedDayTasks.filter((t) => t.status === 'DONE').length} / {selectedDayTasks.length} hoàn thành
                      </span>
                      <span className="day-progress-percent">
                        {Math.round(
                          (selectedDayTasks.filter((t) => t.status === 'DONE').length /
                            selectedDayTasks.length) *
                            100
                        )}%
                      </span>
                    </div>
                    <div className="day-progress-bar-track">
                      <div
                        className="day-progress-bar-fill"
                        style={{
                          width: `${Math.round(
                            (selectedDayTasks.filter((t) => t.status === 'DONE').length /
                              selectedDayTasks.length) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <button
                className="btn-add-for-day"
                onClick={() => handleOpenCreateModal(selectedDate)}
                title="Thêm công việc vào ngày này"
                aria-label="Thêm công việc vào ngày này"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>

            {selectedDayTasks.length === 0 ? (
              <div className="day-empty-state">
                <div className="day-empty-icon-svg">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                    <rect x="3" y="4" width="18" height="18" rx="3" ry="3"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <div className="day-empty-text">
                  Không có hạn chót công việc nào trong ngày này.
                </div>
                <button
                  className="btn-empty-add"
                  onClick={() => handleOpenCreateModal(selectedDate)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <span>Thêm công việc</span>
                </button>
              </div>
            ) : (
              <div className="day-tasks-container">
                {selectedDayTasks.map((task) => {
                  const priorityClass = (task.priority || 'MEDIUM').toLowerCase();
                  return (
                    <div
                      key={task.id}
                      className={`day-task-card priority-accent-${priorityClass} ${
                        task.status === 'DONE' ? 'is-done' : ''
                      }`}
                    >
                      <div className="day-task-card-top">
                        <button
                          type="button"
                          className={`custom-cal-checkbox ${task.status === 'DONE' ? 'checked' : ''}`}
                          onClick={() => handleToggleTaskStatus(task)}
                          title={task.status === 'DONE' ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu hoàn thành'}
                          aria-label="Đổi trạng thái công việc"
                        >
                          {task.status === 'DONE' && (
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          )}
                        </button>

                        <span
                          className="day-task-title"
                          onClick={() => handleOpenEditModal(task)}
                          title="Bấm để chỉnh sửa"
                        >
                          {task.title}
                        </span>

                        <div className="day-task-ghost-actions">
                          <button
                            className="btn-ghost-action edit"
                            onClick={() => handleOpenEditModal(task)}
                            title="Chỉnh sửa công việc"
                            aria-label="Chỉnh sửa công việc"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button
                            className="btn-ghost-action delete"
                            onClick={() => handleOpenDeleteModal(task)}
                            title="Xóa công việc"
                            aria-label="Xóa công việc"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="day-task-badges-row">
                        <div className="badges-row-left">
                          <StatusBadge status={task.status} />
                        </div>
                        <div className="badges-row-right">
                          <PriorityBadge priority={task.priority} />
                        </div>
                      </div>

                      {task.description && (
                        <div className="day-task-desc" title={task.description}>
                          {task.description}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleTaskSubmit}
        initialData={editingTask}
        isSubmitting={isSubmitting}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Xóa công việc"
        message={`Bạn có chắc chắn muốn xóa "${deletingTask?.title}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingTask(null);
        }}
        isDeleting={isDeleting}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </AppLayout>
  );
}
