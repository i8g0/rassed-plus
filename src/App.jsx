/**
 * App.jsx — المدخل الرئيسي لنظام "راصد بلس"
 * 
 * يدير التنقل بين:
 *   - لوحة المرشد الأكاديمي (AdvisorDashboard)
 *   - لوحة الطالب (StudentDashboard)
 */

import { useState } from 'react';
import {
  LayoutDashboard, Users, ShieldAlert, TrendingUp,
  Search, Bell, Zap, GraduationCap, BrainCircuit,
  Mail, UserCircle2, Sparkles, ArrowUpRight,
} from 'lucide-react';
import logo from './assets/logo.png';
import StudentDashboard from './components/StudentDashboard';
import './App.css';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const ADVISOR_STUDENTS = [
  { id: 1, name: 'أحمد محمود',  num: '44120345', risk: 'red',    issue: 'انخفاض مفاجئ في الحضور وفشل في تسليم واجبين',          gpa: 2.1 },
  { id: 2, name: 'سارة خالد',   num: '44210988', risk: 'yellow', issue: 'تستغرق 3 أضعاف الوقت المتوقع في مهام البرمجة',           gpa: 3.4 },
  { id: 3, name: 'فهد عبدالله',  num: '43990122', risk: 'green',  issue: 'مسار سليم — أداء ممتاز في جميع المقررات',                gpa: 4.8 },
  { id: 4, name: 'نورة سعد',    num: '44112340', risk: 'red',    issue: 'نمط دخول متأخر متكرر يشير لاضطراب في إدارة الوقت',       gpa: 2.5 },
  { id: 5, name: 'عمر الشمري',  num: '44315200', risk: 'yellow', issue: 'عدم إكمال 40% من المحاضرات المسجلة',                      gpa: 3.8 },
];

// ─── لوحة المرشد ──────────────────────────────────────────────────────────────

function AdvisorDashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* بطاقات الإحصاء */}
      <div className="stats-row animate-fade-up">
        <StatCard icon={<Users size={24} />} label="إجمالي الطلاب" value="1,248"
          trend="+12 هذا الفصل" trendColor="var(--brand-emerald)"
          iconBg="rgba(16,185,129,0.12)" iconColor="var(--brand-emerald)" />
        <StatCard icon={<ShieldAlert size={24} />} label="تدخلات مطلوبة اليوم" value="8"
          trend="4 أكاديمي • 2 سلوكي" trendColor="var(--brand-rose)"
          iconBg="rgba(244,63,94,0.12)" iconColor="var(--brand-rose)" valueColor="var(--brand-rose)" />
        <StatCard icon={<GraduationCap size={24} />} label="تدخلات ناجحة" value="34"
          trend="نسبة النجاح 88%" trendColor="var(--brand-emerald)"
          iconBg="rgba(34,211,238,0.12)" iconColor="var(--brand-cyan)" />
      </div>

      {/* الفرز الذكي + التوصيات */}
      <div className="dashboard-grid animate-fade-up delay-2">

        {/* جدول الفرز */}
        <div className="glass panel-card">
          <div className="panel-header">
            <div className="panel-title">
              <div className="panel-title-icon" style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--brand-indigo)' }}>
                <ShieldAlert size={18} />
              </div>
              الفرز الذكي (Smart Triage)
            </div>
            <button className="btn btn-ghost" style={{ fontSize: '0.8rem' }}>عرض الكل</button>
          </div>

          <div className="student-list">
            {ADVISOR_STUDENTS.map((s) => (
              <div key={s.id} className="student-item">
                <div className={`risk-dot ${s.risk}`} />
                <div>
                  <div className="student-name">{s.name}</div>
                  <div className="student-meta">{s.num} | المعدل: {s.gpa}</div>
                </div>
                <div className="student-issue">{s.issue}</div>
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  {s.risk === 'red' && <button className="btn btn-danger" style={{ fontSize: '0.78rem' }}><Mail size={14} /> خطة تدخل</button>}
                  {s.risk === 'yellow' && <button className="btn btn-ghost" style={{ fontSize: '0.78rem' }}><Users size={14} /> توأمة</button>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* توصيات Copilot */}
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
              body="تم تحويل 45 طالب إلى بودكاست ملخص بسبب بطء الاستيعاب الملحوظ في القراءة هذا الأسبوع." />
            <AiInsightCard color="var(--brand-amber)" icon={<TrendingUp size={16} />}
              title="رادار المناهج"
              body="CS301: نسبة فشل فوق 60% في مهام الفرز. المشكلة قد تكون في أسلوب التدريس." />
            <AiInsightCard color="var(--brand-emerald)" icon={<Zap size={16} />}
              title="بوصلة سوق العمل"
              body="اقترحنا دورة Node.js لـ 12 طالب متميز في برمجة الويب لتعزيز الجاهزية الوظيفية." />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── مكونات مساعدة صغيرة ──────────────────────────────────────────────────────

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

// ─── التنقل ──────────────────────────────────────────────────────────────────

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

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [role, setRole]       = useState('student');
  const [activeTab, setTab]   = useState('overview');

  const nav  = role === 'advisor' ? NAV_ADVISOR : NAV_STUDENT;
  const name = role === 'advisor' ? 'د. خالد' : 'سارة';
  const subtitle = role === 'advisor'
    ? 'إليك نظرة عامة على حالة الطلاب اليوم'
    : 'إليكِ ملخص مسارك الأكاديمي';

  const switchRole = (r) => {
    setRole(r);
    setTab(r === 'advisor' ? 'dashboard' : 'overview');
  };

  return (
    <div className="app-shell">

      {/* ═══ الشريط الجانبي ═══ */}
      <aside className="sidebar glass animate-fade-right">

        {/* الشعار */}
        <div className="sidebar-brand">
          <div className="brand-logo-wrap">
            <img src={logo} alt="راصد بلس" />
          </div>
        </div>

        {/* مبدّل الدور */}
        <div className="role-switcher">
          {[
            { key: 'advisor', label: 'مرشد', Icon: GraduationCap },
            { key: 'student', label: 'طالب', Icon: UserCircle2 },
          ].map(({ key, label, Icon }) => (
            <button
              key={key}
              className={`role-btn ${role === key ? 'active' : 'inactive'}`}
              onClick={() => switchRole(key)}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {/* القائمة */}
        <nav className="nav-list">
          {nav.map(({ id, icon: Icon, label }) => (
            <a key={id}
              className={`nav-link ${activeTab === id ? 'active' : ''}`}
              onClick={() => setTab(id)}>
              <Icon size={19} /> {label}
            </a>
          ))}
        </nav>

        {/* بطاقة Copilot */}
        <div className="copilot-card">
          <div className="copilot-card-title"><Sparkles size={15} /> توصية Copilot</div>
          <p className="copilot-card-body">
            {role === 'advisor'
              ? 'انخفاض 15% في درجات الفيزياء النصفي. جدولة مراجعة عامة قبل النهائي.'
              : 'لديكِ تسليم غداً ولم تبدئي! الآن أفضل وقت للبدء.'}
          </p>
        </div>
      </aside>

      {/* ═══ المحتوى الرئيسي ═══ */}
      <main className="main-content">

        {/* الرأس */}
        <header className="main-header animate-fade-up">
          <div className="header-greeting">
            <h1>مرحباً، {name} 👋</h1>
            <p>{subtitle}</p>
          </div>
          <div className="header-actions">
            <button className="icon-btn"><Search size={18} /></button>
            <button className="icon-btn" data-notif="true"><Bell size={18} /></button>
            <div className="avatar">{name.charAt(0)}</div>
          </div>
        </header>

        {/* اللوحة */}
        {role === 'advisor' ? <AdvisorDashboard /> : <StudentDashboard />}

      </main>
    </div>
  );
}
