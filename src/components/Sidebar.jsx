import logo from '../assets/logo.png';

export default function Sidebar({ nav = [], activeTab, onTabChange, user, role, t }) {
  return (
    <aside className="sidebar glass animate-fade-right">
      <div className="sidebar-brand">
        <div className="brand-logo-wrap" aria-label={t('common.appName')}>
          <img src={logo} alt={t('common.appName')} className="sidebar-logo-image" />
          <span className="sidebar-brand-name">{t('common.appName')}</span>
        </div>
      </div>

      <div className="session-user glass" style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)' }}>
        <div style={{ fontWeight: 700, fontSize: '0.86rem' }}>{user?.name}</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>
          {role === 'advisor' ? t('app.academicAdvisor') : t('app.studentRole')}
        </div>
      </div>

      <nav className="nav-list">
        {nav.map((item) => (
          <a
            key={item.id}
            className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            {item.icon ? <item.icon size={19} /> : null} {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}
