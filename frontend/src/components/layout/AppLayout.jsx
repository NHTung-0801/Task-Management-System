import Sidebar from './Sidebar';
import Navbar from './Navbar';
import './Layout.css';

export default function AppLayout({ title = 'Taskflow', extraAction = null, children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Navbar title={title} extraAction={extraAction} />
        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  );
}
