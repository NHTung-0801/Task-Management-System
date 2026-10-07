import { useState, useEffect } from 'react';
import './TaskModal.css';

const STATUS_OPTIONS = [
  { value: 'TODO', label: 'Chờ làm', dotColor: '#94a3b8' },
  { value: 'IN_PROGRESS', label: 'Đang làm', dotColor: '#3b82f6' },
  { value: 'DONE', label: 'Hoàn thành', dotColor: '#10b981' },
];

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Thấp', dotColor: '#3b82f6' },
  { value: 'MEDIUM', label: 'Trung bình', dotColor: '#f59e0b' },
  { value: 'HIGH', label: 'Cao', dotColor: '#ef4444' },
];

export default function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        status: initialData.status || 'TODO',
        priority: initialData.priority || 'MEDIUM',
        dueDate: initialData.dueDate ? initialData.dueDate.substring(0, 10) : '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectStatus = (statusValue) => {
    setFormData((prev) => ({ ...prev, status: statusValue }));
  };

  const handleSelectPriority = (priorityValue) => {
    setFormData((prev) => ({ ...prev, priority: priorityValue }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề công việc không được để trống';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Tiêu đề không được vượt quá 100 ký tự';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      status: formData.status,
      priority: formData.priority,
      dueDate: formData.dueDate ? formData.dueDate : null,
    };

    onSubmit(payload);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="task-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="task-modal-header">
          <div className="task-modal-title-wrap">
            <div className="task-modal-icon-badge">
              {initialData ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              )}
            </div>
            <h2 className="task-modal-title">
              {initialData ? 'Chỉnh sửa công việc' : 'Tạo công việc mới'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="task-modal-close-btn"
            title="Đóng cửa sổ"
            aria-label="Đóng cửa sổ"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="task-modal-body">
            {/* Tiêu đề */}
            <div className="modal-form-group">
              <label className="modal-label" htmlFor="task-title-input">
                Tiêu đề công việc <span className="required-asterisk">*</span>
              </label>
              <input
                id="task-title-input"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ví dụ: Thiết kế giao diện Dashboard"
                className={`modal-input ${errors.title ? 'error' : ''}`}
                autoFocus
              />
              {errors.title && <span className="modal-error-msg">{errors.title}</span>}
            </div>

            {/* Mô tả */}
            <div className="modal-form-group">
              <label className="modal-label" htmlFor="task-desc-input">
                Mô tả chi tiết
              </label>
              <textarea
                id="task-desc-input"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Nhập ghi chú hoặc yêu cầu chi tiết cho công việc này..."
                className="modal-textarea"
              />
            </div>

            {/* Trạng thái & Mức ưu tiên dạng Segmented Buttons */}
            <div className="modal-grid-row">
              <div className="modal-form-group">
                <label className="modal-label">Trạng thái</label>
                <div className="segmented-control">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`segmented-btn ${formData.status === opt.value ? 'active' : ''}`}
                      onClick={() => handleSelectStatus(opt.value)}
                    >
                      <span
                        className="segmented-dot"
                        style={{ backgroundColor: opt.dotColor }}
                      />
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="modal-form-group">
                <label className="modal-label">Mức ưu tiên</label>
                <div className="segmented-control">
                  {PRIORITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`segmented-btn ${formData.priority === opt.value ? 'active' : ''}`}
                      onClick={() => handleSelectPriority(opt.value)}
                    >
                      <span
                        className="segmented-dot"
                        style={{ backgroundColor: opt.dotColor }}
                      />
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Hạn hoàn thành */}
            <div className="modal-form-group">
              <label className="modal-label" htmlFor="task-due-date-input">
                Hạn hoàn thành
              </label>
              <input
                id="task-due-date-input"
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="modal-input"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="task-modal-footer">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-modal-cancel"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-modal-submit"
            >
              {isSubmitting ? (
                <>
                  <div className="modal-spinner" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>{initialData ? 'Cập nhật' : 'Tạo mới'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
