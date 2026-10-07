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
      setProfileAlert({ type: 'success', msg: '✅ Cập nhật hồ sơ thành công!' });
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
      setPwAlert({ type: 'success', msg: '✅ Đổi mật khẩu thành công!' });
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
      <div className="profile-wrapper">
        <div className="profile-card">
          <div className="card-header">
            <div className="card-header-icon blue">👤</div>
            <div className="card-header-text">
              <h2>Thông tin cá nhân</h2>
              <p>Cập nhật họ tên và địa chỉ email của bạn</p>
            </div>
          </div>

          <div className="card-body">
            <div className="avatar-section">
              <div className="avatar-large">
                {getInitials(profile?.fullName || profile?.username)}
              </div>
              <div className="avatar-info">
                <p className="display-name">{profile?.fullName || '—'}</p>
                <p className="display-username">@{profile?.username}</p>
                <span className="badge-joined">
                  🗓 Tham gia từ {formatDate(profile?.createdAt)}
                </span>
              </div>
            </div>

            {profileAlert && (
              <div className={`alert alert-${profileAlert.type}`} style={{ marginBottom: 16 }}>
                {profileAlert.msg}
              </div>
            )}

            <form className="profile-form" onSubmit={handleSaveProfile} noValidate>
              <div className="form-row">
                <div className="field-group">
                  <label className="field-label" htmlFor="fullName">Họ và tên</label>
                  <input
                    id="fullName"
                    className={`field-input ${profileErrors.fullName ? 'error' : ''}`}
                    type="text"
                    value={profileForm.fullName}
                    onChange={(e) => {
                      setProfileForm((p) => ({ ...p, fullName: e.target.value }));
                      if (profileErrors.fullName) setProfileErrors((p) => ({ ...p, fullName: '' }));
                    }}
                    placeholder="Nguyen Van A"
                    disabled={isSavingProfile}
                  />
                  {profileErrors.fullName && <span className="field-error-msg">{profileErrors.fullName}</span>}
                </div>

                <div className="field-group">
                  <label className="field-label">Username</label>
                  <div className="field-locked">
                    <span className="lock-icon">🔒</span>
                    <span>{profile?.username}</span>
                  </div>
                  <span className="field-hint">Username không thể thay đổi</span>
                </div>
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="email">Địa chỉ Email</label>
                <input
                  id="email"
                  className={`field-input ${profileErrors.email ? 'error' : ''}`}
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => {
                    setProfileForm((p) => ({ ...p, email: e.target.value }));
                    if (profileErrors.email) setProfileErrors((p) => ({ ...p, email: '' }));
                  }}
                  placeholder="your@email.com"
                  disabled={isSavingProfile}
                />
                {profileErrors.email ? (
                  <span className="field-error-msg">{profileErrors.email}</span>
                ) : (
                  <span className="field-hint">Email dùng để liên lạc và khôi phục tài khoản</span>
                )}
              </div>

              <div className="card-actions-row">
                <button
                  type="button"
                  className={`btn-toggle-password ${showPasswordSection ? 'active' : ''}`}
                  onClick={() => setShowPasswordSection((prev) => !prev)}
                >
                  <span className="btn-icon">{showPasswordSection ? '🔒' : '🔑'}</span>
                  <span>{showPasswordSection ? 'Ẩn đổi mật khẩu' : 'Đổi mật khẩu'}</span>
                </button>

                <button type="submit" className="btn-save" disabled={isSavingProfile}>
                  {isSavingProfile ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {showPasswordSection && (
          <div className="profile-card password-card-animated">
            <div className="card-header">
              <div className="card-header-icon amber">🔑</div>
              <div className="card-header-text">
                <h2>Bảo mật tài khoản</h2>
                <p>Đổi mật khẩu để bảo vệ tài khoản của bạn</p>
              </div>
            </div>

            <div className="card-body">
              {pwAlert && (
                <div className={`alert alert-${pwAlert.type}`} style={{ marginBottom: 16 }}>
                  {pwAlert.msg}
                </div>
              )}

              <form className="profile-form" onSubmit={handleChangePassword} noValidate>
                <div className="field-group">
                  <label className="field-label" htmlFor="currentPassword">Mật khẩu hiện tại</label>
                  <input
                    id="currentPassword"
                    className={`field-input ${pwErrors.currentPassword ? 'error' : ''}`}
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
                  {pwErrors.currentPassword && <span className="field-error-msg">{pwErrors.currentPassword}</span>}
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="newPassword">Mật khẩu mới</label>
                  <input
                    id="newPassword"
                    className={`field-input ${pwErrors.newPassword ? 'error' : ''}`}
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
                  {pwErrors.newPassword && <span className="field-error-msg">{pwErrors.newPassword}</span>}

                  {pwForm.newPassword && (
                    <div className="password-strength">
                      <div className="strength-bar-track">
                        <div
                          className="strength-bar-fill"
                          style={{ width: strength.width, background: strength.color }}
                        />
                      </div>
                      <span className="strength-label" style={{ color: strength.color }}>
                        {strength.label}
                      </span>
                    </div>
                  )}
                </div>

                <div className="card-actions">
                  <button type="submit" className="btn-save danger" disabled={isSavingPw}>
                    {isSavingPw ? '⏳ Đang lưu...' : '🔐 Đổi mật khẩu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
