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

  const fillCredentials = (username, password) => {
    setFormData({ username, password });
    setErrors({});
    setServerError('');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">✓</div>
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
              placeholder="Nhập username của bạn"
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
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className={`form-input ${errors.password ? 'input-error' : ''}`}
              placeholder="Nhập mật khẩu"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
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

        <details className="demo-credentials-box">
          <summary>💡 Tài khoản mẫu dùng để test nhanh</summary>
          <div className="demo-credentials-content">
            <button
              type="button"
              className="btn-fill-demo"
              onClick={() => fillCredentials('user01', 'Pass12345')}
            >
              👉 user01 / Pass12345 (Vừa tạo)
            </button>
            <button
              type="button"
              className="btn-fill-demo"
              onClick={() => fillCredentials('testuser', '123456')}
            >
              👉 testuser / 123456 (Dữ liệu mẫu database)
            </button>
          </div>
        </details>
      </div>
    </div>
  );
}
