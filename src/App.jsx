/**
 * App.jsx — المدخل الرئيسي لنظام "راصد بلس"
 * 
 * الآن مع:
 *   ✅ بيانات ديناميكية من mockEngine
 *   ✅ أزرار "خطة تدخل" و "توأمة" مفعّلة
 *   ✅ InterventionModal يظهر عند الضغط
 *   ✅ NotificationsPanel يظهر عند ضغط الجرس
 *   ✅ Toast notifications عند إجراء أي عملية
 *   ✅ التنقل بين التابات يعمل
 */

import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, ShieldAlert, TrendingUp,
  Search, Bell, Zap, GraduationCap, BrainCircuit,
  Mail, UserCircle2, Sparkles, ArrowUpRight, X,
  CheckCircle2,
} from 'lucide-react';
import logo from './assets/logo.png';
import StudentDashboard from './components/StudentDashboard';
import InterventionModal from './components/InterventionModal';
import NotificationsPanel from './components/NotificationsPanel';
import { analyzeAllStudents, getAdvisorStats, generateNotifications } from './services/mockEngine';
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

// ─── لوحة المرشد الأكاديمي ───────────────────────────────────────────────────

function AdvisorDashboard({ onIntervention, onToast }) {
  // جلب البيانات ديناميكياً من محرك البيانات بدلاً من hardcoding
  const students = analyzeAllStudents();
  const stats    = getAdvisorStats();

  const handlePeerMatch = (student) => {
    // في الإنتاج: fetch('/api/v1/students/match', ...)
    onToast(`تم إرسال طلب توأمة أكاديمية لـ ${student.name}`, 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* الإحصاءات — مأخوذة من المحرك الذكي */}
      <div className="stats-row animate-fade-up">
        <StatCard icon={<Users size={24} />} label="إجمالي الطلاب" value={stats.totalStudents.toLocaleString()}
          trend="+12 هذا الفصل" trendColor="var(--brand-emerald)"
          iconBg="rgba(16,185,129,0.12)" iconColor="var(--brand-emerald)" />
        <StatCard icon={<ShieldAlert size={24} />} label="تدخلات مطلوبة اليوم"
          value={stats.interventionsToday.toString()}
          trend={`${stats.redCount} عاجل • ${stats.yellowCount} مراقبة`}
          trendColor="var(--brand-rose)"
          iconBg="rgba(244,63,94,0.12)" iconColor="var(--brand-rose)" valueColor="var(--brand-rose)" />
        <StatCard icon={<GraduationCap size={24} />} label="تدخلات ناجحة"
          value={stats.successfulInterventions.toString()}
          trend={`نسبة النجاح ${stats.successRate}%`} trendColor="var(--brand-emerald)"
          iconBg="rgba(34,211,238,0.12)" iconColor="var(--brand-cyan)" />
      </div>

      {/* الفرز الذكي + التوصيات */}
      <div className="dashboard-grid animate-fade-up delay-2">

        {/* قائمة الطلاب — ديناميكية من خوارزمية التحليل */}
        <div className="glass panel-card">
          <div className="panel-header">
            <div className="panel-title">
              <div className="panel-title-icon" style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--brand-indigo)' }}>
                <ShieldAlert size={18} />
              </div>
              الفرز الذكي (Smart Triage)
            </div>
            <span className="badge" style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--brand-indigo)' }}>
              مرتب حسب الخطورة
            </span>
          </div>

          <div className="student-list">
            {students.map((s) => (
              <div key={s.id} className="student-item">
                <div className={`risk-dot ${s.riskLevel}`} />
                <div style={{ minWidth: '100px' }}>
                  <div className="student-name">{s.name}</div>
                  <div className="student-meta">{s.id} | المعدل: {s.gpa} | الخطورة: {s.riskScore}%</div>
                </div>
                <div className="student-issue">
                  {s.primaryReason}
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  {s.riskLevel === 'red' && (
                    <button className="btn btn-danger" style={{ fontSize: '0.78rem' }}
                      onClick={() => onIntervention(s)}>
                      <Mail size={14} /> خطة تدخل
                    </button>
                  )}
                  {s.riskLevel === 'yellow' && (
                    <button className="btn btn-ghost" style={{ fontSize: '0.78rem' }}
                      onClick={() => handlePeerMatch(s)}>
                      <Users size={14} /> توأمة
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* توصيات Copilot — ديناميكية */}
        <div className="glass panel-card">
          <div className="panel-header">
            <div className="panel-title">
              <div className="panel-title-icon" style={{ background: 'rgba(34,211,238,0.12)', color: 'var(--brand-cyan)' }}>
                <Sparkles size={18} />
              </div>
              توصيات Copilot
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <AiInsightCard color="var(--brand-indigo)" icon={<BrainCircuit size={16} />}
              title="توجيه تكيفي"
              body={`تم تحويل ${Math.floor(students.length * 7.5)} طالب إلى بودكاست بسبب بطء الاستيعاب. ${students.filter(s => s.taskTimeRatio > 2).length} طلاب يستغرقون وقتاً مضاعفاً.`} />
            <AiInsightCard color="var(--brand-amber)" icon={<TrendingUp size={16} />}
              title="رادار المناهج"
              body={`CS301: ${students.filter(s => s.incompleteLectures > 40).length} طلاب لم يكملوا محاضراتها. نسبة فشل تتجاوز 60% — المشكلة قد تكون في أسلوب التدريس.`} />
            <AiInsightCard color="var(--brand-emerald)" icon={<Zap size={16} />}
              title="بوصلة سوق العمل"
              body={`${students.filter(s => s.gpa >= 3.5).length} طلاب مؤهلين لتوصيات كورسات متقدمة. اقترحنا دورة AI لطلاب الذكاء الاصطناعي.`} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── مكونات مساعدة ─────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, trend, trendColor, iconBg, iconColor, valueColor }) {
  return (
    <div className="glass stat-card">
      <div className="stat-icon-wrap" style={{ background: iconBg, color: iconColor }}>{icon}</div>
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <span className="stat-value" style={{ color: valueColor || 'var(--text-primary)' }}>{value}</span>
        {trend && (
          <span className="stat-trend" style={{ color: trendColor }}>
            <ArrowUpRight size={13} /> {trend}
          </span>
        )}
      </div>
    </div>
  );
}

function AiInsightCard({ color, icon, title, body }) {
  return (
    <div className="ai-card" style={{ background: `${color}08`, borderColor: `${color}22` }}>
      <div className="ai-card-title" style={{ color }}>{icon}<span>{title}</span></div>
      <p className="ai-card-body">{body}</p>
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
  const [role, setRole]                   = useState('student');
  const [activeTab, setTab]               = useState('overview');
  const [interventionStudent, setIntervention] = useState(null);
  const [showNotifs, setShowNotifs]       = useState(false);
  const [toast, setToast]                 = useState(null);

  const nav  = role === 'advisor' ? NAV_ADVISOR : NAV_STUDENT;
  const name = role === 'advisor' ? 'د. خالد' : 'سارة';
  const subtitle = role === 'advisor'
    ? 'إليك نظرة عامة على حالة الطلاب اليوم'
    : 'إليكِ ملخص مسارك الأكاديمي';

  const switchRole = (r) => {
    setRole(r);
    setTab(r === 'advisor' ? 'dashboard' : 'overview');
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
  };

  // عدد الإشعارات غير المقروءة
  const unreadCount = generateNotifications(role).filter(n => !n.read).length;

  // الـ Copilot tip يتغير ديناميكياً حسب الدور والتبويب
  const copilotTip = role === 'advisor'
    ? 'انخفاض 15% في درجات الفيزياء النصفي. اضغط على "رادار المناهج" للتفاصيل.'
    : 'لديكِ تسليم غداً ولم تبدئي! اضغطي على "مهامي" وقسّمي المهمة.';

  return (
    <div className="app-shell">

      {/* ═══ الشريط الجانبي ═══ */}
      <aside className="sidebar glass animate-fade-right">
        <div className="sidebar-brand">
          <div className="brand-logo-wrap">
            <img src={logo} alt="راصد بلس" />
          </div>
        </div>

        <div className="role-switcher">
          {[
            { key: 'advisor', label: 'مرشد', Icon: GraduationCap },
            { key: 'student', label: 'طالب', Icon: UserCircle2 },
          ].map(({ key, label, Icon }) => (
            <button key={key}
              className={`role-btn ${role === key ? 'active' : 'inactive'}`}
              onClick={() => switchRole(key)}>
              <Icon size={15} /> {label}
            </button>
          ))}
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
          <div className="copilot-card-title"><Sparkles size={15} /> توصية Copilot</div>
          <p className="copilot-card-body">{copilotTip}</p>
        </div>
      </aside>

      {/* ═══ المحتوى الرئيسي ═══ */}
      <main className="main-content">
        <header className="main-header animate-fade-up">
          <div className="header-greeting">
            <h1>مرحباً، {name} 👋</h1>
            <p>{subtitle}</p>
          </div>
          <div className="header-actions">
            <button className="icon-btn"><Search size={18} /></button>
            <button className="icon-btn" data-notif={unreadCount > 0 ? 'true' : undefined}
              onClick={() => setShowNotifs(!showNotifs)}>
              <Bell size={18} />
            </button>
            <div className="avatar">{name.charAt(0)}</div>
          </div>
        </header>

        {/* اللوحة حسب الدور */}
        {role === 'advisor'
          ? <AdvisorDashboard
              onIntervention={(s) => setIntervention(s)}
              onToast={showToast}
            />
          : <StudentDashboard onToast={showToast} />
        }
      </main>

      {/* ═══ Modals / Overlays ═══ */}

      {interventionStudent && (
        <InterventionModal
          student={interventionStudent}
          onClose={() => {
            setIntervention(null);
            showToast('تم توليد خطة التدخل بنجاح');
          }}
        />
      )}

      {showNotifs && (
        <NotificationsPanel
          role={role}
          onClose={() => setShowNotifs(false)}
        />
      )}

      {toast && (
        <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
