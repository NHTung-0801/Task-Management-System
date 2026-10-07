import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './Auth.css';

export default function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Tên đăng nhập không được để trống';
    }
    if (!formData.password) {
      newErrors.password = 'Mật khẩu không được để trống';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setServerError('');

    try {
      const response = await authService.login({
        username: formData.username.trim(),
        password: formData.password,
      });

      authService.saveAuthData(response.data);
      navigate('/dashboard');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng thử lại!';
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h1 className="auth-title">Đăng nhập</h1>
          <p className="auth-subtitle">Hệ thống Quản lý Công việc - Taskflow</p>
        </div>

        {serverError && (
          <div className="auth-alert-error" role="alert">
            <span>⚠️</span>
            <span>{serverError}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Tên đăng nhập
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              className={`form-input ${errors.username ? 'input-error' : ''}`}
              placeholder="Nhập tên đăng nhập"
              value={formData.username}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.username && <span className="field-error">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Mật khẩu
            </label>
            <div className="password-input-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
              <button
                type="button"
                className="btn-toggle-visibility"
                onClick={() => setShowPassword((prev) => !prev)}
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <button
            type="submit"
            className="auth-btn-submit"
            disabled={isLoading}
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="auth-footer">
          Chưa có tài khoản?{' '}
          <Link to="/register">Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
}
