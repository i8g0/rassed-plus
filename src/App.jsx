/**
 * App.jsx — المدخل الرئيسي لنظام "راصد بلس"
 */

import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, Users, ShieldAlert, TrendingUp,
  Search, Bell, LogOut, CheckCircle2, Zap, Settings,
} from 'lucide-react';
import StudentDashboard from './components/StudentDashboard';
import Dashboard from './components/Dashboard';
import InterventionModal from './components/InterventionModal';
import NotificationsPanel from './components/NotificationsPanel';
import LoginScreen from './components/LoginScreen';
import SettingsPanel from './components/SettingsPanel';
import AIChatbot from './components/AIChatbot';
import Sidebar from './components/Sidebar';
import { getNotifications } from './services/api';
import { useUser } from './contexts/UserContext';
import { useRased } from './contexts/RasedContext';
import { byGender } from './utils/localization';
import { useLanguage } from './contexts/LanguageProvider';
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

// ─── التطبيق الرئيسي ─────────────────────────────────────────────────────────

export default function App() {
  const { user, role, gender, name, login: loginUser, logout: logoutUser } = useUser();
  const { runSystemDiagnostic } = useRased();
  const { t, language } = useLanguage();

  const navAdvisor = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('app.navDashboard') },
    { id: 'students', icon: Users, label: t('app.navStudents') },
    { id: 'interventions', icon: ShieldAlert, label: t('app.navInterventions') },
    { id: 'radar', icon: TrendingUp, label: t('app.navCurriculumRadar') },
  ];

  const navStudent = [
    { id: 'overview', icon: LayoutDashboard, label: t('app.navOverview') },
    { id: 'tasks', icon: Zap, label: t('app.navMyTasks') },
    { id: 'skills', icon: TrendingUp, label: t('app.navSkillsCompass') },
    { id: 'peers', icon: Users, label: t('app.navPeerMatch') },
  ];

  const [activeTab, setTab]                     = useState('overview');
  const [interventionStudent, setIntervention]  = useState(null);
  const [showNotifs, setShowNotifs]             = useState(false);
  const [notifications, setNotifications]       = useState([]);
  const [toast, setToast]                       = useState(null);
  const [showSettings, setShowSettings]         = useState(false);
  const [searchSignal, setSearchSignal]         = useState(0);
  const hasRunDiagnostic = useRef(false);

  const nav  = role === 'advisor' ? navAdvisor : navStudent;
  const headerTitle = (
    <span dir="auto">
      {t('app.greeting')} <bdi>{name}</bdi> 👋
    </span>
  );
  const subtitle = role === 'advisor'
    ? t('app.advisorSubtitle')
    : gender === 'female'
      ? t('app.studentSubtitleFemale')
      : t('app.studentSubtitleMale');

  const handleLogin = (userData) => {
    try {
      loginUser(userData);
      setTab(userData?.role === 'advisor' ? 'dashboard' : 'overview');
    } catch (err) {
      console.error('Login flow failed:', err);
      showToast(t('app.loginFailed'), 'warning');
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
      showToast(t('app.logoutFailed'), 'warning');
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
      showToast(t('app.smartSearchActivated'), 'info');
    } catch (err) {
      console.error('Search workflow failed:', err);
      showToast(t('app.searchFailed'), 'warning');
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
      <Sidebar
        nav={nav}
        activeTab={activeTab}
        onTabChange={setTab}
        user={user}
        role={role}
        t={t}
      />

      {/* ═══ المحتوى الرئيسي ═══ */}
      <main className="main-content">
        <header className="main-header animate-fade-up">
          {role === 'advisor' && (
            <div className="header-greeting">
              <h1>{headerTitle}</h1>
              {subtitle && <p>{subtitle}</p>}
            </div>
          )}
          <div className="header-actions">
            <button className="icon-btn" title={t('app.search')} onClick={handleSearchClick}><Search size={18} /></button>
            <button className="icon-btn" data-notif={unreadCount > 0 ? 'true' : undefined}
              onClick={() => setShowNotifs(!showNotifs)}>
              <Bell size={18} />
            </button>
            <button className="icon-btn" title={t('app.settingsTooltip')} onClick={() => setShowSettings(!showSettings)}>
              <Settings size={18} />
            </button>
            <button className="icon-btn" title={t('app.logout')} onClick={handleLogout}>
              <LogOut size={17} />
            </button>
            <div className="avatar">{name.charAt(0)}</div>
          </div>
        </header>

        {/* اللوحة حسب الدور */}
        {role === 'advisor'
          ? <Dashboard
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
            showToast(t('app.interventionSuccess'));
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
