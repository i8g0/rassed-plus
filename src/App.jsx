/**
 * App.jsx — المدخل الرئيسي لنظام "راصد بلس"
 */

import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, Users, ShieldAlert, TrendingUp,
  Search, Bell, LogOut, CheckCircle2, Zap, Settings,
} from 'lucide-react';
import logo from './assets/logo.png';
import StudentDashboard from './components/StudentDashboard';
import AdvisorDashboard from './components/AdvisorDashboard';
import InterventionModal from './components/InterventionModal';
import NotificationsPanel from './components/NotificationsPanel';
import LoginScreen from './components/LoginScreen';
import SettingsPanel from './components/SettingsPanel';
import AIChatbot from './components/AIChatbot';
import { getNotifications } from './services/api';
import { useUser } from './contexts/UserContext';
import { useRased } from './contexts/RasedContext';
import { byGender } from './utils/localization';
import './App.css';

// ─── Toast Component ──────────────────────────────────────────────────────────

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: { bg: 'rgba(110,231,183,0.10)', border: 'rgba(110,231,183,0.25)', color: '#6ee7b7' },
    info:    { bg: 'rgba(45,212,191,0.10)', border: 'rgba(45,212,191,0.25)', color: '#2dd4bf' },
    warning: { bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.25)', color: '#fbbf24' },
  };
  const c = colors[type] || colors.success;

  return (
    <div className="toast-container animate-fade-up" style={{
      position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
      zIndex: 1000, padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)',
      background: c.bg, border: `1px solid ${c.border}`, color: c.color,
      backdropFilter: 'blur(20px)', fontWeight: '600', fontSize: '0.88rem',
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
    }}>
      <CheckCircle2 size={16} /> {message}
    </div>
  );
}

// ─── التنقل ───────────────────────────────────────────────────────────────────

const NAV_ADVISOR = [
  { id: 'dashboard',     icon: LayoutDashboard, label: 'لوحة القيادة' },
  { id: 'students',      icon: Users,           label: 'الطلاب' },
  { id: 'interventions', icon: ShieldAlert,     label: 'التدخلات' },
  { id: 'radar',         icon: TrendingUp,      label: 'رادار المناهج' },
];

const NAV_STUDENT = [
  { id: 'overview', icon: LayoutDashboard, label: 'نظرة عامة' },
  { id: 'tasks',    icon: Zap,             label: 'مهامي' },
  { id: 'skills',   icon: TrendingUp,      label: 'بوصلة المهارات' },
  { id: 'peers',    icon: Users,           label: 'التوأمة' },
];

// ─── التطبيق الرئيسي ─────────────────────────────────────────────────────────

export default function App() {
  const { user, role, gender, name, login: loginUser, logout: logoutUser } = useUser();
  const { runSystemDiagnostic } = useRased();

  const [activeTab, setTab]                     = useState('overview');
  const [interventionStudent, setIntervention]  = useState(null);
  const [showNotifs, setShowNotifs]             = useState(false);
  const [notifications, setNotifications]       = useState([]);
  const [toast, setToast]                       = useState(null);
  const [showSettings, setShowSettings]         = useState(false);
  const [searchSignal, setSearchSignal]         = useState(0);
  const hasRunDiagnostic = useRef(false);

  const nav  = role === 'advisor' ? NAV_ADVISOR : NAV_STUDENT;
  const headerTitle = `مرحباً، ${name} 👋`;
  const subtitle = role === 'advisor'
    ? 'إليك نظرة عامة على حالة الطلاب اليوم'
    : `${byGender(gender, 'ابدأ', 'ابدئي')} يومك الدراسي بوضوح وخطة إنجاز ذكية`;

  const handleLogin = (userData) => {
    try {
      loginUser(userData);
      setTab(userData?.role === 'advisor' ? 'dashboard' : 'overview');
    } catch (err) {
      console.error('Login flow failed:', err);
      showToast('تعذر إكمال تسجيل الدخول حالياً', 'warning');
    }
  };

  const handleLogout = () => {
    try {
      logoutUser();
      setTab('overview');
      setShowNotifs(false);
      setIntervention(null);
      setToast(null);
      hasRunDiagnostic.current = false;
    } catch (err) {
      console.error('Logout flow failed:', err);
      showToast('تعذر تسجيل الخروج حالياً', 'warning');
    }
  };

  const showToast = (msg, type = 'success') => {
    try {
      setToast({ msg, type });
    } catch (err) {
      console.error('Toast error:', err);
    }
  };

  const handleSearchClick = () => {
    try {
      if (role === 'advisor') {
        setTab('students');
      }
      setSearchSignal((prev) => prev + 1);
      showToast('تم تفعيل البحث الذكي', 'info');
    } catch (err) {
      console.error('Search workflow failed:', err);
      showToast('تعذر تفعيل البحث حالياً', 'warning');
    }
  };

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getNotifications(role)
      .then((data) => {
        if (!cancelled) setNotifications(data || []);
      })
      .catch(() => {
        if (!cancelled) setNotifications([]);
      });
    return () => {
      cancelled = true;
    };
  }, [user, role, showNotifs, activeTab]);

  useEffect(() => {
    if (!user || hasRunDiagnostic.current) return;
    hasRunDiagnostic.current = true;

    try {
      runSystemDiagnostic?.();
    } catch (err) {
      console.error('Diagnostic bootstrap failed:', err);
    }
  }, [user, runSystemDiagnostic]);

  const unreadCount = (Array.isArray(notifications) ? notifications : []).filter(n => !n.read).length;

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell">

      {/* ═══ الشريط الجانبي ═══ */}
      <aside className="sidebar glass animate-fade-right">
        <div className="sidebar-brand">
          <div className="brand-logo-wrap">
            <img src={logo} alt="راصد بلس" />
          </div>
        </div>

        <div className="session-user glass" style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontWeight: 700, fontSize: '0.86rem' }}>{user.name}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>
            {role === 'advisor' ? 'مرشد أكاديمي' : 'طالب'}
          </div>
        </div>

        <nav className="nav-list">
          {nav.map((item) => (
            <a key={item.id}
              className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setTab(item.id)}>
              {item.icon ? <item.icon size={19} /> : null} {item.label}
            </a>
          ))}
        </nav>
      </aside>

      {/* ═══ المحتوى الرئيسي ═══ */}
      <main className="main-content">
        <header className="main-header animate-fade-up">
          <div className="header-greeting">
            <h1>{headerTitle}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <div className="header-actions">
            <button className="icon-btn" title="بحث" onClick={handleSearchClick}><Search size={18} /></button>
            <button className="icon-btn" data-notif={unreadCount > 0 ? 'true' : undefined}
              onClick={() => setShowNotifs(!showNotifs)}>
              <Bell size={18} />
            </button>
            <button className="icon-btn" title="الإعدادات والتخصيص" onClick={() => setShowSettings(!showSettings)}>
              <Settings size={18} />
            </button>
            <button className="icon-btn" title="تسجيل الخروج" onClick={handleLogout}>
              <LogOut size={17} />
            </button>
            <div className="avatar">{name.charAt(0)}</div>
          </div>
        </header>

        {/* اللوحة حسب الدور */}
        {role === 'advisor'
          ? <AdvisorDashboard
              activeTab={activeTab}
              onIntervention={(s) => setIntervention(s)}
              onToast={showToast}
              searchSignal={searchSignal}
            />
          : <StudentDashboard activeTab={activeTab} onToast={showToast} currentUser={user} gender={gender} />
        }
      </main>

      {/* ═══ Modals / Overlays ═══ */}

      {interventionStudent && (
        <InterventionModal
          student={interventionStudent}
          advisorId={user?.id}
          onToast={showToast}
          onClose={() => {
            setIntervention(null);
            showToast('تم توليد خطة التدخل بنجاح');
          }}
        />
      )}

      {showNotifs && (
        <NotificationsPanel
          notifications={notifications}
          onClose={() => setShowNotifs(false)}
        />
      )}

      <SettingsPanel
        open={showSettings}
        onClose={() => setShowSettings(false)}
        onToast={showToast}
      />

      {toast && (
        <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* ═══ AI Chatbot (Floating) ═══ */}
      <AIChatbot user={user} role={role} />
    </div>
  );
}
