/**
 * App.jsx — المدخل الرئيسي لنظام "راصد بلس"
<<<<<<< HEAD
 * 
=======
 *
>>>>>>> origin/main
 * ✅ تنقل التابات يعمل فعلياً (كل tab يعرض محتوى مختلف)
 * ✅ Loading spinners عند تبديل الأدوار
 * ✅ بيانات ديناميكية من السيرفر الحقيقي
 * ✅ InterventionModal + NotificationsPanel + Toast
 * ✅ AdvisorDashboard منفصل في ملف مستقل
<<<<<<< HEAD
=======
 * ✅ SettingsContext + UserContext عالمي
 * ✅ Copilot AI ديناميكي مع حالات تفكير
>>>>>>> origin/main
 */

import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, ShieldAlert, TrendingUp,
  Search, Bell, LogOut, Sparkles, CheckCircle2, Zap, Settings, Rocket,
} from 'lucide-react';
import logo from './assets/logo.png';
import StudentDashboard from './components/StudentDashboard';
import AdvisorDashboard from './components/AdvisorDashboard';
import InterventionModal from './components/InterventionModal';
import NotificationsPanel from './components/NotificationsPanel';
import LoginScreen from './components/LoginScreen';
import SettingsPanel from './components/SettingsPanel';
<<<<<<< HEAD
import RasedFeaturesGalaxy from './components/RasedFeaturesGalaxy';
import AIChatbot from './components/AIChatbot';
import { getNotifications } from './services/api';
=======
import { getNotifications } from './services/api';
import { generateCopilotTip, THINKING_STATES } from './services/aiService';
import { useUser } from './contexts/UserContext';
>>>>>>> origin/main
import { byGender } from './utils/localization';
import './App.css';

// ─── Toast Component ──────────────────────────────────────────────────────────

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', color: '#10B981' },
    info:    { bg: 'rgba(129,140,248,0.15)', border: 'rgba(129,140,248,0.3)', color: '#818CF8' },
    warning: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', color: '#F59E0B' },
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
<<<<<<< HEAD
  { id: 'galaxy',        icon: Rocket,          label: 'مجرة الميزات' },
=======
>>>>>>> origin/main
];

const NAV_STUDENT = [
  { id: 'overview', icon: LayoutDashboard, label: 'نظرة عامة' },
  { id: 'tasks',    icon: Zap,             label: 'مهامي' },
  { id: 'skills',   icon: TrendingUp,      label: 'بوصلة المهارات' },
  { id: 'peers',    icon: Users,           label: 'التوأمة' },
<<<<<<< HEAD
  { id: 'galaxy',   icon: Rocket,          label: 'مجرة الميزات' },
=======
>>>>>>> origin/main
];

// ─── التطبيق الرئيسي ─────────────────────────────────────────────────────────

export default function App() {
<<<<<<< HEAD
  const [role, setRole]                         = useState('student');
  const [authUser, setAuthUser]                 = useState(null);
=======
  const { user, role, gender, name, login: loginUser, logout: logoutUser } = useUser();

>>>>>>> origin/main
  const [activeTab, setTab]                     = useState('overview');
  const [interventionStudent, setIntervention]  = useState(null);
  const [showNotifs, setShowNotifs]             = useState(false);
  const [notifications, setNotifications]       = useState([]);
  const [toast, setToast]                       = useState(null);
  const [showSettings, setShowSettings]         = useState(false);

<<<<<<< HEAD
  const nav  = role === 'advisor' ? NAV_ADVISOR : NAV_STUDENT;
  const studentGender = authUser?.gender || 'male';
  const name = authUser?.name || (role === 'advisor' ? 'د. خالد' : 'محمد');
  const headerTitle = `مرحباً، ${name} 👋`;
  const subtitle = role === 'advisor'
    ? 'إليك نظرة عامة على حالة الطلاب اليوم'
    : 'ابدأ يومك الدراسي بوضوح وخطة إنجاز ذكية';

  const handleLogin = (user) => {
    const nextRole = user.role;
    setAuthUser(user);
    setRole(nextRole);
    setTab(nextRole === 'advisor' ? 'dashboard' : 'overview');
  };

  const handleLogout = () => {
    setAuthUser(null);
    setRole('student');
=======
  // Copilot AI
  const [copilotTip, setCopilotTip]             = useState('');
  const [copilotThinking, setCopilotThinking]   = useState(false);

  const nav  = role === 'advisor' ? NAV_ADVISOR : NAV_STUDENT;
  const headerTitle = `مرحباً، ${name} 👋`;
  const subtitle = role === 'advisor'
    ? 'إليك نظرة عامة على حالة الطلاب اليوم'
    : `${byGender(gender, 'ابدأ', 'ابدئي')} يومك الدراسي بوضوح وخطة إنجاز ذكية`;

  const handleLogin = (userData) => {
    loginUser(userData);
    setTab(userData.role === 'advisor' ? 'dashboard' : 'overview');
  };

  const handleLogout = () => {
    logoutUser();
>>>>>>> origin/main
    setTab('overview');
    setShowNotifs(false);
    setIntervention(null);
    setToast(null);
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
  };

  useEffect(() => {
<<<<<<< HEAD
    if (!authUser) return;
    getNotifications(role)
      .then((data) => setNotifications(data || []))
      .catch(() => setNotifications([]));
  }, [authUser, role, showNotifs, activeTab]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // الـ Copilot tip يتغير ديناميكياً حسب الدور والتبويب النشط
  const copilotTips = {
    advisor: {
      dashboard: 'تم رصد 2 طلاب بمؤشرات حمراء — اضغط "خطة تدخل" لتوليد رسالة فورية.',
      students: 'استخدم الفلتر للتركيز على الحالات الحمراء أولاً.',
      interventions: '3 تدخلات مكتملة هذا الشهر — نسبة نجاح 88%',
      radar: 'CS301 يحتاج مراجعة عاجلة — نسبة رسوب 62%',
      features: 'يمكنك تفعيل/تعطيل 100 ميزة وربطها فوراً بقاعدة البيانات.',
    },
    student: {
      overview: `${byGender(studentGender, 'لديك', 'لديكِ')} تسليم غداً ولم ${byGender(studentGender, 'تبدأ', 'تبدئي')}! ${byGender(studentGender, 'اضغط', 'اضغطي')} على "مهامي" و${byGender(studentGender, 'قسّم', 'قسّمي')} المهمة.`,
      tasks: `${byGender(studentGender, 'ابدأ', 'ابدئي')} بالمهمة الأسهل أولاً — ذلك يبني الزخم.`,
      skills: 'كورس Data Analysis هو الأعلى طلباً هذا الفصل!',
      peers: 'أحمد وافق على جلسة التوأمة — غداً 4 مساءً.',
      features: 'مركز الميزات الأسطورية يمنحك تجربة Super App متكاملة.',
    },
  };
  const copilotTip = copilotTips[role]?.[activeTab] || copilotTips[role]?.overview || '';

  if (!authUser) {
=======
    if (!user) return;
    getNotifications(role)
      .then((data) => setNotifications(data || []))
      .catch(() => setNotifications([]));
  }, [user, role, showNotifs, activeTab]);

  // Copilot AI tip — يتغير ديناميكياً حسب الدور والتبويب النشط
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    setCopilotThinking(true);
    generateCopilotTip(role, activeTab, user, (thinkingState) => {
      if (!cancelled && thinkingState.state === THINKING_STATES.ANALYZING) {
        setCopilotTip('🤔 أفكر...');
      }
    }).then((tip) => {
      if (!cancelled) {
        setCopilotTip(tip);
        setCopilotThinking(false);
      }
    }).catch(() => {
      if (!cancelled) {
        setCopilotTip('راصد بلس يراقب أداءك ويقدم توصيات ذكية.');
        setCopilotThinking(false);
      }
    });

    return () => { cancelled = true; };
  }, [user, role, activeTab]);

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!user) {
>>>>>>> origin/main
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
<<<<<<< HEAD
          <div style={{ fontWeight: 700, fontSize: '0.86rem' }}>{authUser.name}</div>
=======
          <div style={{ fontWeight: 700, fontSize: '0.86rem' }}>{user.name}</div>
>>>>>>> origin/main
          <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>
            {role === 'advisor' ? 'مرشد أكاديمي' : 'طالب'}
          </div>
        </div>

        <nav className="nav-list">
          {nav.map(({ id, icon: Icon, label }) => (
            <a key={id}
              className={`nav-link ${activeTab === id ? 'active' : ''}`}
              onClick={() => setTab(id)}>
              <Icon size={19} /> {label}
            </a>
          ))}
        </nav>

        <div className="copilot-card">
<<<<<<< HEAD
          <div className="copilot-card-title"><Sparkles size={15} /> توصية Copilot</div>
=======
          <div className="copilot-card-title">
            <Sparkles size={15} className={copilotThinking ? 'copilot-spin' : ''} /> توصية Copilot
          </div>
>>>>>>> origin/main
          <p className="copilot-card-body">{copilotTip}</p>
        </div>
      </aside>

      {/* ═══ المحتوى الرئيسي ═══ */}
      <main className="main-content">
        <header className="main-header animate-fade-up">
          <div className="header-greeting">
            <h1>{headerTitle}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <div className="header-actions">
            <button className="icon-btn"><Search size={18} /></button>
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

        {/* اللوحة حسب الدور — الآن activeTab يتم تمريره */}
<<<<<<< HEAD
        {activeTab === 'galaxy'
          ? <RasedFeaturesGalaxy />
          : role === 'advisor'
            ? <AdvisorDashboard
                activeTab={activeTab}
                onIntervention={(s) => setIntervention(s)}
                onToast={showToast}
              />
            : <StudentDashboard activeTab={activeTab} onToast={showToast} currentUser={authUser} gender={studentGender} />
=======
        {role === 'advisor'
          ? <AdvisorDashboard
              activeTab={activeTab}
              onIntervention={(s) => setIntervention(s)}
              onToast={showToast}
            />
          : <StudentDashboard activeTab={activeTab} onToast={showToast} currentUser={user} gender={gender} />
>>>>>>> origin/main
        }
      </main>

      {/* ═══ Modals / Overlays ═══ */}

      {interventionStudent && (
        <InterventionModal
          student={interventionStudent}
<<<<<<< HEAD
          advisorId={authUser?.id}
=======
          advisorId={user?.id}
>>>>>>> origin/main
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
<<<<<<< HEAD

      {/* ═══ AI Chatbot (Floating) ═══ */}
      <AIChatbot user={authUser} role={role} />
=======
>>>>>>> origin/main
    </div>
  );
}
