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
        <div className="calendar-top-bar">
          <div className="calendar-nav-group">
            <h2 className="calendar-month-title" style={{ textTransform: 'capitalize' }}>
              {monthLabel}
            </h2>
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

          <div className="calendar-actions">
            <button
              className="btn-add-task-cal"
              onClick={() => handleOpenCreateModal(selectedDate)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>+ Thêm công việc</span>
            </button>
          </div>
        </div>

        <div className="calendar-stats-row">
          <div className="cal-stat-card">
            <div className="cal-stat-icon" style={{ background: '#EEF2FF', color: '#6366F1' }}>
              📅
            </div>
            <div className="cal-stat-info">
              <span className="cal-stat-value">{monthStats.total}</span>
              <span className="cal-stat-label">Tổng hạn chót tháng</span>
            </div>
          </div>

          <div className="cal-stat-card">
            <div className="cal-stat-icon" style={{ background: '#FEF3C7', color: '#F59E0B' }}>
              ⏳
            </div>
            <div className="cal-stat-info">
              <span className="cal-stat-value">{monthStats.inProgress}</span>
              <span className="cal-stat-label">Đang thực hiện</span>
            </div>
          </div>

          <div className="cal-stat-card">
            <div className="cal-stat-icon" style={{ background: '#DCFCE7', color: '#10B981' }}>
              ✅
            </div>
            <div className="cal-stat-info">
              <span className="cal-stat-value">{monthStats.done}</span>
              <span className="cal-stat-label">Đã hoàn thành</span>
            </div>
          </div>

          <div className="cal-stat-card">
            <div className="cal-stat-icon" style={{ background: '#FEE2E2', color: '#EF4444' }}>
              ⚠️
            </div>
            <div className="cal-stat-info">
              <span className="cal-stat-value">{monthStats.overdue}</span>
              <span className="cal-stat-label">Quá hạn cần chú ý</span>
            </div>
          </div>
        </div>

        <div className="calendar-layout">
          <div className="calendar-grid-card">
            <div className="calendar-weekdays-header">
              {WEEKDAYS.map((day, idx) => (
                <div
                  key={day}
                  className={`weekday-header-cell ${idx === 5 || idx === 6 ? 'weekend' : ''}`}
                >
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
                        <span className="day-task-count-badge">{dayTasks.length}</span>
                      )}
                    </div>

                    <div className="day-tasks-list">
                      {dayTasks.slice(0, 2).map((t) => (
                        <div
                          key={t.id}
                          className={`task-cal-pill priority-${(t.priority || '').toLowerCase()} ${
                            t.status === 'DONE' ? 'status-done' : ''
                          }`}
                          title={`${t.title} (${t.priority} • ${t.status})`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDate(cell.dateKey);
                            handleOpenEditModal(t);
                          }}
                        >
                          {t.title}
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <div className="task-more-pill">
                          +{dayTasks.length - 2} việc nữa
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="day-details-panel">
            <div className="day-details-header">
              <div>
                <h3 className="day-details-date-title">Chi tiết công việc</h3>
                <p className="day-details-date-subtitle">
                  {formatDisplayDate(selectedDate)}
                </p>
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
                <div className="day-empty-icon">🏖️</div>
                <div className="day-empty-text">
                  Không có hạn chót công việc nào trong ngày này.
                </div>
                <button
                  className="btn-empty-add"
                  onClick={() => handleOpenCreateModal(selectedDate)}
                >
                  + Thêm công việc
                </button>
              </div>
            ) : (
              <div className="day-tasks-container">
                {selectedDayTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`day-task-card ${task.status === 'DONE' ? 'is-done' : ''}`}
                  >
                    <div className="day-task-card-header">
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={task.status === 'DONE'}
                          onChange={() => handleToggleTaskStatus(task)}
                          title="Đánh dấu hoàn thành"
                          style={{ marginTop: '3px', cursor: 'pointer' }}
                        />
                        <div
                          className="day-task-title"
                          onClick={() => handleOpenEditModal(task)}
                        >
                          {task.title}
                        </div>
                      </div>
                    </div>

                    <div className="day-task-badges">
                      <StatusBadge status={task.status} />
                      <PriorityBadge priority={task.priority} />
                    </div>

                    {task.description && (
                      <div className="day-task-desc" title={task.description}>
                        {task.description}
                      </div>
                    )}

                    <div className="day-task-actions">
                      <button
                        className="btn-cal-action edit"
                        onClick={() => handleOpenEditModal(task)}
                      >
                        Sửa
                      </button>
                      <button
                        className="btn-cal-action delete"
                        onClick={() => handleOpenDeleteModal(task)}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
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
