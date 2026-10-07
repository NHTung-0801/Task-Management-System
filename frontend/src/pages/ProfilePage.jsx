import { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import userService from '../services/userService';
import authService from '../services/authService';
import './Profile.css';

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: '', color: '', width: '0%' },
    { label: 'Rất yếu', color: '#EF4444', width: '20%' },
    { label: 'Yếu', color: '#F97316', width: '40%' },
    { label: 'Trung bình', color: '#EAB308', width: '60%' },
    { label: 'Mạnh', color: '#22C55E', width: '80%' },
    { label: 'Rất mạnh', color: '#16A34A', width: '100%' },
  ];
  return levels[score];
}

function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0][0].toUpperCase();
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [profileForm, setProfileForm] = useState({ fullName: '', email: '' });
  const [profileErrors, setProfileErrors] = useState({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileAlert, setProfileAlert] = useState(null);

  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [isSavingPw, setIsSavingPw] = useState(false);
  const [pwAlert, setPwAlert] = useState(null);

  const strength = getPasswordStrength(pwForm.newPassword);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await userService.getProfile();
        const data = res.data;
        setProfile(data);
        setProfileForm({ fullName: data.fullName || '', email: data.email || '' });
      } catch {
        setProfileAlert({ type: 'error', msg: 'Không thể tải thông tin hồ sơ. Vui lòng thử lại.' });
      } finally {
        setIsLoadingProfile(false);
      }
    };
    loadProfile();
  }, []);

  const validateProfile = () => {
    const errs = {};
    if (!profileForm.fullName.trim()) errs.fullName = 'Họ và tên không được để trống';
    if (!profileForm.email.trim()) errs.email = 'Email không được để trống';
    else if (!/\S+@\S+\.\S+/.test(profileForm.email)) errs.email = 'Địa chỉ email không hợp lệ';
    setProfileErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!validateProfile()) return;
    setIsSavingProfile(true);
    setProfileAlert(null);
    try {
      const res = await userService.updateProfile({
        fullName: profileForm.fullName.trim(),
        email: profileForm.email.trim().toLowerCase(),
      });
      const updated = res.data;
      setProfile(updated);

      // Cập nhật lại cache localStorage để sidebar hiển thị đồng bộ
      const cached = authService.getCurrentUser();
      if (cached) {
        authService.saveAuthData({ ...cached, fullName: updated.fullName, email: updated.email });
      }
      setProfileAlert({ type: 'success', msg: 'Cập nhật hồ sơ cá nhân thành công!' });
      setTimeout(() => setProfileAlert(null), 4000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Cập nhật thất bại. Vui lòng thử lại.';
      setProfileAlert({ type: 'error', msg });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const validatePassword = () => {
    const errs = {};
    if (!pwForm.currentPassword) errs.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    if (!pwForm.newPassword) errs.newPassword = 'Vui lòng nhập mật khẩu mới';
    else if (pwForm.newPassword.length < 6) errs.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    setPwErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;
    setIsSavingPw(true);
    setPwAlert(null);
    try {
      await userService.changePassword(pwForm);
      setPwAlert({ type: 'success', msg: 'Đổi mật khẩu thành công!' });
      setPwForm({ currentPassword: '', newPassword: '' });
      setPwErrors({});
      setTimeout(() => setPwAlert(null), 4000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Đổi mật khẩu thất bại. Kiểm tra lại mật khẩu hiện tại.';
      setPwAlert({ type: 'error', msg });
    } finally {
      setIsSavingPw(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <AppLayout title="Profile">
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
          <div className="spinner" style={{ width: 40, height: 40 }} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Profile">
      <div className="profile-container">
        {/* Cột trái: Thẻ định danh & Tổng quan an toàn */}
        <div className="profile-sidebar-col">
          <div className="profile-identity-card">
            <div className="identity-avatar-wrap">
              <div className="identity-avatar">
                {getInitials(profile?.fullName || profile?.username)}
              </div>
              <span className="identity-status-dot" title="Tài khoản đang hoạt động" />
            </div>

            <h3 className="identity-name">{profile?.fullName || '—'}</h3>
            <p className="identity-username">@{profile?.username}</p>

            <div className="identity-badges-list">
              <div className="identity-pill role">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <polyline points="17 11 19 13 23 9"></polyline>
                </svg>
                <span>Thành viên chính thức</span>
              </div>

              <div className="identity-pill date">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>Tham gia: {formatDate(profile?.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="profile-security-info-card">
            <div className="sec-card-header">
              <div className="sec-icon-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <span className="sec-title">Bảo mật tài khoản</span>
            </div>
            <p className="sec-desc">
              Tài khoản được bảo vệ bằng cơ chế xác thực JWT và mã hóa mật khẩu an toàn.
            </p>
          </div>
        </div>

        {/* Cột phải: Form cài đặt & Bảo mật */}
        <div className="profile-main-col">
          {/* Card 1: Thông tin cơ bản */}
          <div className="profile-section-card">
            <div className="sec-card-title-bar">
              <div className="sec-card-icon blue">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div>
                <h2 className="sec-heading">Thông tin cá nhân</h2>
                <p className="sec-subheading">Cập nhật họ tên và thông tin liên hệ của bạn</p>
              </div>
            </div>

            {profileAlert && (
              <div className={`profile-alert alert-${profileAlert.type}`}>
                {profileAlert.type === 'success' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                )}
                <span>{profileAlert.msg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} noValidate>
              <div className="profile-fields-grid">
                <div className="profile-field-item">
                  <label className="field-label" htmlFor="fullName">
                    Họ và tên
                  </label>
                  <div className="input-with-icon">
                    <svg className="input-inner-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <input
                      id="fullName"
                      className={`field-input has-icon ${profileErrors.fullName ? 'error' : ''}`}
                      type="text"
                      value={profileForm.fullName}
                      onChange={(e) => {
                        setProfileForm((p) => ({ ...p, fullName: e.target.value }));
                        if (profileErrors.fullName) setProfileErrors((p) => ({ ...p, fullName: '' }));
                      }}
                      placeholder="Nhập họ và tên của bạn"
                      disabled={isSavingProfile}
                    />
                  </div>
                  {profileErrors.fullName && <span className="field-error-msg">{profileErrors.fullName}</span>}
                </div>

                <div className="profile-field-item">
                  <label className="field-label">Tên đăng nhập</label>
                  <div className="input-with-icon">
                    <svg className="input-inner-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <input
                      className="field-input has-icon locked"
                      type="text"
                      value={profile?.username || ''}
                      disabled
                      readOnly
                    />
                  </div>
                  <span className="field-hint">Tên đăng nhập cố định và không thể thay đổi</span>
                </div>
              </div>

              <div className="profile-field-item" style={{ marginTop: '16px' }}>
                <label className="field-label" htmlFor="email">
                  Địa chỉ Email
                </label>
                <div className="input-with-icon">
                  <svg className="input-inner-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <input
                    id="email"
                    className={`field-input has-icon ${profileErrors.email ? 'error' : ''}`}
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => {
                      setProfileForm((p) => ({ ...p, email: e.target.value }));
                      if (profileErrors.email) setProfileErrors((p) => ({ ...p, email: '' }));
                    }}
                    placeholder="email@example.com"
                    disabled={isSavingProfile}
                  />
                </div>
                {profileErrors.email ? (
                  <span className="field-error-msg">{profileErrors.email}</span>
                ) : (
                  <span className="field-hint">Dùng để nhận thông báo và quản lý tài khoản</span>
                )}
              </div>

              <div className="profile-form-footer">
                <button
                  type="button"
                  className={`btn-toggle-password ${showPasswordSection ? 'active' : ''}`}
                  onClick={() => setShowPasswordSection((prev) => !prev)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 2l-2 2m-1.5 1.5L14 9l-3 3-2 2-4 4-2-2 4-4 2-2 3-3 3.5-3.5z"></path>
                  </svg>
                  <span>{showPasswordSection ? 'Ẩn đổi mật khẩu' : 'Đổi mật khẩu'}</span>
                </button>

                <button type="submit" className="btn-profile-primary" disabled={isSavingProfile}>
                  {isSavingProfile ? (
                    <div className="btn-spinner" />
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                      <polyline points="17 21 17 13 7 13 7 21"></polyline>
                      <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                  )}
                  <span>{isSavingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Card 2: Bảo mật & Đổi mật khẩu (chỉ hiện khi nhấn nút) */}
          {showPasswordSection && (
            <div className="profile-section-card password-card-animated">
              <div className="sec-card-title-bar">
                <div className="sec-card-icon amber">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <div>
                  <h2 className="sec-heading">Bảo mật tài khoản</h2>
                  <p className="sec-subheading">Đổi mật khẩu định kỳ để nâng cao an toàn cho tài khoản</p>
                </div>
              </div>

              {pwAlert && (
                <div className={`profile-alert alert-${pwAlert.type}`}>
                  {pwAlert.type === 'success' ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  )}
                  <span>{pwAlert.msg}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} noValidate>
                <div className="profile-fields-grid">
                  <div className="profile-field-item">
                    <label className="field-label" htmlFor="currentPassword">
                      Mật khẩu hiện tại
                    </label>
                    <div className="input-with-icon">
                      <svg className="input-inner-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                      <input
                        id="currentPassword"
                        className={`field-input has-icon ${pwErrors.currentPassword ? 'error' : ''}`}
                        type="password"
                        value={pwForm.currentPassword}
                        onChange={(e) => {
                          setPwForm((p) => ({ ...p, currentPassword: e.target.value }));
                          if (pwErrors.currentPassword) setPwErrors((p) => ({ ...p, currentPassword: '' }));
                        }}
                        placeholder="Nhập mật khẩu hiện tại"
                        autoComplete="current-password"
                        disabled={isSavingPw}
                      />
                    </div>
                    {pwErrors.currentPassword && <span className="field-error-msg">{pwErrors.currentPassword}</span>}
                  </div>

                  <div className="profile-field-item">
                    <label className="field-label" htmlFor="newPassword">
                      Mật khẩu mới
                    </label>
                    <div className="input-with-icon">
                      <svg className="input-inner-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 2l-2 2m-1.5 1.5L14 9l-3 3-2 2-4 4-2-2 4-4 2-2 3-3 3.5-3.5z"></path>
                      </svg>
                      <input
                        id="newPassword"
                        className={`field-input has-icon ${pwErrors.newPassword ? 'error' : ''}`}
                        type="password"
                        value={pwForm.newPassword}
                        onChange={(e) => {
                          setPwForm((p) => ({ ...p, newPassword: e.target.value }));
                          if (pwErrors.newPassword) setPwErrors((p) => ({ ...p, newPassword: '' }));
                        }}
                        placeholder="Tối thiểu 6 ký tự"
                        autoComplete="new-password"
                        disabled={isSavingPw}
                      />
                    </div>
                    {pwErrors.newPassword && <span className="field-error-msg">{pwErrors.newPassword}</span>}

                    {pwForm.newPassword && (
                      <div className="password-strength-container">
                        <div className="strength-bar-track">
                          <div
                            className="strength-bar-fill"
                            style={{ width: strength.width, background: strength.color }}
                          />
                        </div>
                        <span className="strength-label" style={{ color: strength.color }}>
                          Độ mạnh: {strength.label}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="profile-form-footer">
                  <button type="submit" className="btn-profile-secondary" disabled={isSavingPw}>
                    {isSavingPw ? (
                      <div className="btn-spinner" />
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 2l-2 2m-1.5 1.5L14 9l-3 3-2 2-4 4-2-2 4-4 2-2 3-3 3.5-3.5z"></path>
                      </svg>
                    )}
                    <span>{isSavingPw ? 'Đang cập nhật...' : 'Đổi mật khẩu'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
