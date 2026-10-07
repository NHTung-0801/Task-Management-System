export default function Navbar({ title, extraAction }) {
  const todayFormatted = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="app-navbar">
      <div className="navbar-page-info">
        <h1 className="navbar-title">{title}</h1>
        <span style={{ fontSize: '0.8rem', color: '#64748B', textTransform: 'capitalize' }}>
          {todayFormatted}
        </span>
      </div>

      <div className="navbar-actions">
        {extraAction}
      </div>
    </header>
  );
}
