import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import taskService from '../../services/taskService';
import authService from '../../services/authService';
import StatusBadge from '../common/StatusBadge';
import PriorityBadge from '../common/PriorityBadge';

export default function Navbar({ title, extraAction }) {
  const navigate = useNavigate();
  const user = authService.getCurrentUser() || {};
  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const getInitial = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  const todayFormatted = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  // Debounced live suggestions search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = keyword.trim();
    if (!trimmed) {
      setSuggestions([]);
      setIsOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await taskService.getTasks({
          keyword: trimmed,
          page: 0,
          size: 5,
          sortBy: 'updatedAt',
          sortDir: 'desc',
        });
        setSuggestions(res.data?.content || []);
        setIsOpen(true);
      } catch (err) {
        console.error('Lỗi tìm kiếm gợi ý trên Header:', err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [keyword]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTask = (task) => {
    setIsOpen(false);
    setSelectedIndex(-1);
    navigate(`/tasks?keyword=${encodeURIComponent(task.title)}`);
  };

  const handleViewAllResults = () => {
    if (!keyword.trim()) return;
    setIsOpen(false);
    setSelectedIndex(-1);
    navigate(`/tasks?keyword=${encodeURIComponent(keyword.trim())}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
      return;
    }

    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      if (suggestions.length > 0) setIsOpen(true);
      return;
    }

    const totalSelectable = suggestions.length + (suggestions.length > 0 ? 1 : 0);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < totalSelectable ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : totalSelectable - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelectTask(suggestions[selectedIndex]);
      } else {
        handleViewAllResults();
      }
    }
  };

  const handleClear = () => {
    setKeyword('');
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  return (
    <header className="app-navbar">
      <div className="navbar-page-info">
        <h1 className="navbar-title">{title}</h1>
        <span className="navbar-date">
          {todayFormatted}
        </span>
      </div>

      {/* Global Search Bar */}
      <div className="navbar-search-wrapper" ref={wrapperRef}>
        <div className="navbar-search-box">
          <svg
            className="navbar-search-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>

          <input
            type="text"
            className="navbar-search-input"
            placeholder="Tìm kiếm công việc theo tiêu đề..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onFocus={() => {
              if (keyword.trim() && suggestions.length > 0) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            id="global-header-search-input"
          />

          {loading && <div className="navbar-search-spinner" />}

          {!loading && keyword && (
            <button
              type="button"
              className="navbar-search-clear"
              onClick={handleClear}
              title="Xóa tìm kiếm"
            >
              ✕
            </button>
          )}
        </div>

        {/* Live Suggestions Dropdown */}
        {isOpen && (
          <div className="navbar-search-dropdown">
            <div className="search-dropdown-header">
              <span>Gợi ý công việc</span>
              {suggestions.length > 0 && (
                <span className="search-result-count">{suggestions.length} kết quả</span>
              )}
            </div>

            {suggestions.length > 0 ? (
              <ul className="search-dropdown-list">
                {suggestions.map((task, idx) => (
                  <li
                    key={task.id}
                    className={`search-dropdown-item ${selectedIndex === idx ? 'selected' : ''}`}
                    onClick={() => handleSelectTask(task)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <div className="search-item-left">
                      <div className="search-item-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 11 12 14 22 4"></polyline>
                          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                        </svg>
                      </div>
                      <div className="search-item-text">
                        <span className="search-item-title">{task.title}</span>
                      </div>
                    </div>

                    <div className="search-item-right">
                      <StatusBadge status={task.status} />
                      <PriorityBadge priority={task.priority} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              !loading && (
                <div className="search-dropdown-empty">
                  <span>Không tìm thấy công việc nào khớp với &quot;<strong>{keyword}</strong>&quot;</span>
                </div>
              )
            )}

            {keyword.trim() && (
              <div
                className={`search-dropdown-footer ${
                  selectedIndex === suggestions.length ? 'selected' : ''
                }`}
                onClick={handleViewAllResults}
                onMouseEnter={() => setSelectedIndex(suggestions.length)}
              >
                <span>Xem tất cả kết quả cho &quot;<strong>{keyword}</strong>&quot; trên trang Công việc</span>
                <span className="search-shortcut-hint">↵ Enter</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="navbar-actions">
        {extraAction}
        <button
          type="button"
          className="navbar-profile-shortcut"
          onClick={() => navigate('/profile')}
          title={`Hồ sơ cá nhân: ${user.fullName || user.username || 'Người dùng'}`}
          id="btn-navbar-profile"
        >
          <div className="navbar-avatar-wrapper">
            <div className="navbar-avatar-circle">
              {getInitial(user.fullName || user.username)}
            </div>
            <span className="navbar-avatar-status-dot" />
          </div>
          <span className="navbar-profile-name">
            {user.fullName || user.username || 'Tài khoản'}
          </span>
        </button>
      </div>
    </header>
  );
}
