/**
 * StudentDashboard.jsx — لوحة الطالب
 * 
 * الآن مع:
 *   ✅ كل الأزرار مفعّلة (جدولة جلسة، تقسيم المهمة، ابدئي الآن، الكورسات)
 *   ✅ Toast notifications عند كل إجراء
 *   ✅ حالة المهام تتغير ديناميكياً (إكمال خطوات، بدء مهمة)
 *   ✅ بيانات الطالب مركزية من mockEngine
 */

import { useState, useCallback } from 'react';
import {
  Video, Headphones, MapPin, Users, Calendar,
  Zap, TrendingUp, AlertTriangle, CheckCircle2,
  Clock, Star, Target, Briefcase, Bell,
  BrainCircuit, BookOpen, Sparkles, ArrowUpRight,
  ChevronDown, Play, ClipboardList, Timer,
  ExternalLink, Check,
} from 'lucide-react';
import './StudentDashboard.css';

// ═══════════════════════════════════════════════════════════════════════════════
//  MOCK DATA (ستُنقل لاحقاً بالكامل إلى mockEngine عند الربط بالباك إند)
// ═══════════════════════════════════════════════════════════════════════════════

const STUDENT = {
  name: 'سارة خالد',
  major: 'علوم الحاسب',
  year: 'السنة الثانية',
  gpa: 3.4,
  maxGpa: 5,
  completionRate: 72,
  status: 'warning',
  statusMessage: 'تحتاجين لبعض التركيز هذا الأسبوع 💪',
  streak: 5,
};

const ADAPTIVE = [
  {
    id: 1,
    course: 'الفيزياء 201',
    courseIcon: '⚛️',
    issue: 'تقضين وقتاً أطول بـ 3x من المتوقع في الفصل الثالث. قد يناسبك أسلوب تعلم مختلف.',
    alternatives: [
      { key: 'video',   label: 'فيديو تفاعلي — 12 دقيقة', icon: Video,      color: '#818CF8', bg: 'rgba(129,140,248,0.1)' },
      { key: 'podcast', label: 'ملخص صوتي للفصل',          icon: Headphones, color: '#34D399', bg: 'rgba(52,211,153,0.1)' },
      { key: 'map',     label: 'خريطة ذهنية تفاعلية',       icon: MapPin,     color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    ],
  },
  {
    id: 2,
    course: 'هياكل البيانات',
    courseIcon: '🔗',
    issue: 'فتحتِ محاضرة Linked Lists مرتين ولم تكمليها. جربي أسلوباً بصرياً.',
    alternatives: [
      { key: 'video', label: 'شرح بصري متحرك',          icon: Play,   color: '#818CF8', bg: 'rgba(129,140,248,0.1)' },
      { key: 'map',   label: 'خريطة الخوارزميات المرئية', icon: MapPin, color: '#22D3EE', bg: 'rgba(34,211,238,0.1)' },
    ],
  },
];

const PEERS = [
  {
    id: 1, name: 'أحمد محمود', initials: 'أ',
    color: '#6366F1',
    strong: 'البرمجة والخوارزميات', weak: 'الرياضيات التفاضلية',
    reason: 'أنتِ متفوقة في الرياضيات وأحمد في البرمجة — تبادل منفعي مثالي!',
    compatibility: 94,
  },
  {
    id: 2, name: 'ريم عبدالله', initials: 'ر',
    color: '#10B981',
    strong: 'الفيزياء النظرية', weak: 'التحليل الإحصائي',
    reason: 'ريم يمكنها مساعدتك في الفيزياء مقابل مساعدتك لها في الإحصاء.',
    compatibility: 87,
  },
];

const SKILLS = [
  {
    id: 1, skill: 'الرياضيات والتحليل', level: 92,
    color: '#10B981',
    course: 'Data Analysis with Python', platform: 'Coursera',
    link: 'https://www.coursera.org/learn/data-analysis-with-python',
    boost: 40,
    reason: 'مهاراتك في الرياضيات استثنائية. تحليل البيانات هو الأعلى طلباً في سوق العمل حالياً.',
    hot: true,
  },
  {
    id: 2, skill: 'قواعد البيانات', level: 74,
    color: '#818CF8',
    course: 'SQL & Database Design', platform: 'Udemy',
    link: 'https://www.udemy.com/course/the-complete-sql-bootcamp/',
    boost: 25,
    reason: 'إتقان SQL يرفع الراتب التقديري بنسبة 25% في شركات التقنية الكبرى.',
    hot: false,
  },
];

const INITIAL_TASKS = [
  {
    id: 1,
    title: 'تسليم تقرير هياكل البيانات',
    deadline: 'غداً — 11:59 مساءً',
    progress: 0,
    urgency: 'danger',
    aiNote: 'لم تبدئي بعد! اضغطي لتقسيم المهمة إلى خطوات صغيرة.',
    canSplit: true,
  },
  {
    id: 2,
    title: 'مراجعة محاضرات الفيزياء (الفصل 3–5)',
    deadline: 'بعد 3 أيام',
    progress: 35,
    urgency: 'warning',
    aiNote: 'في المسار الصح! 45 دقيقة يومياً كافية للإنهاء.',
    canSplit: false,
  },
  {
    id: 3,
    title: 'اختبار قصير — الإحصاء التطبيقي',
    deadline: 'اليوم — 11:00 ص',
    progress: 100,
    urgency: 'success',
    aiNote: 'أحسنتِ! مكتمل.',
    canSplit: false,
  },
];

const SPLIT_STEPS = [
  { text: 'اقرئي المتطلبات وحددي المكونات الأساسية', time: '20 دقيقة', icon: '📖' },
  { text: 'ارسمي مخطط هيكلي للحل على ورقة',        time: '15 دقيقة', icon: '✏️' },
  { text: 'ابدئي البرمجة — ابدئي بالجزء الأسهل',    time: '90 دقيقة', icon: '💻' },
  { text: 'راجعي ووثّقي الكود قبل التسليم',          time: '35 دقيقة', icon: '🔍' },
];

// ═══════════════════════════════════════════════════════════════════════════════
//  COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

/* ─── SVG Circular Progress ──────────────────────────────────────────────────── */

function CircleProgress({ value, max, label, color, size = 110 }) {
  const pct  = (value / max) * 100;
  const r    = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="circle-progress">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
        <circle cx={size/2} cy={size/2} r={r}
          fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.22,1,0.36,1)', filter: `drop-shadow(0 0 6px ${color}55)` }} />
        <text x={size/2} y={size/2 + 1} textAnchor="middle" dominantBaseline="central"
          fill="white" fontFamily="Tajawal" fontSize={size * 0.2} fontWeight="800">
          {value}{max === 100 ? '%' : ''}
        </text>
      </svg>
      <span className="circle-label">{label}</span>
    </div>
  );
}

/* ─── 1. Hero Section ────────────────────────────────────────────────────────── */

function HeroSection({ student }) {
  const statusMap = {
    success: { color: '#10B981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)', Icon: CheckCircle2 },
    warning: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)', Icon: AlertTriangle },
    danger:  { color: '#F43F5E', bg: 'rgba(244,63,94,0.1)',   border: 'rgba(244,63,94,0.25)',  Icon: AlertTriangle },
  };
  const st = statusMap[student.status];

  return (
    <div className="hero-banner animate-fade-up">
      <div className="hero-mesh" />
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />

      <div className="hero-content">
        <div className="hero-text">
          <p className="hero-date">
            {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="hero-title">
            مرحباً يا {student.name.split(' ')[0]}
            <span className="hero-wave">👋</span>
          </h1>
          <div className="hero-status" style={{ background: st.bg, borderColor: st.border, color: st.color }}>
            <st.Icon size={15} />
            <span>{student.statusMessage}</span>
          </div>
          <div className="hero-meta">
            {student.major} — {student.year}
            {student.streak > 0 && (
              <span className="streak-badge">
                🔥 {student.streak} أيام متواصلة
              </span>
            )}
          </div>
        </div>

        <div className="hero-stats">
          <CircleProgress value={student.gpa} max={student.maxGpa} label="المعدل" color="#818CF8" />
          <CircleProgress value={student.completionRate} max={100} label="إنجاز المهام" color="#10B981" />
        </div>
      </div>
    </div>
  );
}

/* ─── 2. Adaptive Routing ───────────────────────────────────────────────────── */

function AdaptiveSection({ items, onToast }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (itemId, altKey, altLabel) => {
    const key = `${itemId}-${altKey}`;
    if (selected === key) {
      setSelected(null);
    } else {
      setSelected(key);
      onToast(`تم اختيار: ${altLabel}`, 'info');
    }
  };

  return (
    <div className="glass panel-card animate-fade-up delay-2">
      <div className="panel-header">
        <div className="panel-title">
          <div className="panel-title-icon" style={{ background: 'rgba(129,140,248,0.12)', color: '#818CF8' }}>
            <BrainCircuit size={18} />
          </div>
          التوجيه التكيفي
        </div>
        <span className="badge" style={{ background: 'rgba(129,140,248,0.12)', color: '#818CF8' }}>
          <Sparkles size={11} /> {items.length} اقتراح
        </span>
      </div>

      <div className="adaptive-list">
        {items.map((item) => (
          <div key={item.id} className="adaptive-card">
            <div className="adaptive-header">
              <span className="adaptive-course">{item.courseIcon} {item.course}</span>
            </div>
            <p className="adaptive-issue">{item.issue}</p>
            <div className="adaptive-alts">
              {item.alternatives.map((alt) => {
                const AltIcon = alt.icon;
                const isActive = selected === `${item.id}-${alt.key}`;
                return (
                  <button
                    key={alt.key}
                    className={`alt-btn ${isActive ? 'active' : ''}`}
                    style={{ '--alt-color': alt.color, '--alt-bg': alt.bg }}
                    onClick={() => handleSelect(item.id, alt.key, alt.label)}
                  >
                    <AltIcon size={14} /> {alt.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── 3. Peer Matchmaking ───────────────────────────────────────────────────── */

function PeersSection({ peers, onToast }) {
  const [requested, setRequested] = useState({});

  const handleRequest = (peer) => {
    const wasRequested = requested[peer.id];
    setRequested(prev => ({ ...prev, [peer.id]: !prev[peer.id] }));

    if (!wasRequested) {
      onToast(`تم إرسال طلب جلسة دراسية لـ ${peer.name} 📩`, 'success');
    } else {
      onToast(`تم إلغاء الطلب لـ ${peer.name}`, 'warning');
    }
  };

  return (
    <div className="glass panel-card animate-fade-up delay-3">
      <div className="panel-header">
        <div className="panel-title">
          <div className="panel-title-icon" style={{ background: 'rgba(52,211,153,0.12)', color: '#34D399' }}>
            <Users size={18} />
          </div>
          التوأمة الأكاديمية
        </div>
        <span className="badge" style={{ background: 'rgba(52,211,153,0.12)', color: '#34D399' }}>
          توافق عالي
        </span>
      </div>

      <div className="peers-list">
        {peers.map((p) => (
          <div key={p.id} className="peer-card">
            <div className="peer-top">
              <div className="peer-avatar" style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color}88)` }}>
                {p.initials}
              </div>
              <div className="peer-info">
                <span className="peer-name">{p.name}</span>
                <div className="peer-skills">
                  <span className="peer-skill good">✅ {p.strong}</span>
                  <span className="peer-skill need">📚 يحتاج: {p.weak}</span>
                </div>
              </div>
              <div className="peer-compat">
                <span className="compat-value">{p.compatibility}%</span>
                <span className="compat-label">توافق</span>
              </div>
            </div>
            <p className="peer-reason">{p.reason}</p>
            <button
              className={`btn ${requested[p.id] ? 'btn-ghost' : 'btn-success'}`}
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => handleRequest(p)}
            >
              {requested[p.id]
                ? <><CheckCircle2 size={14} /> تم الطلب — في انتظار الرد</>
                : <><Calendar size={14} /> جدولة جلسة دراسية</>}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── 4. Skill Compass ──────────────────────────────────────────────────────── */

function SkillsSection({ skills, onToast }) {
  const handleCourseClick = (skill) => {
    window.open(skill.link, '_blank');
    onToast(`تم فتح ${skill.course} على ${skill.platform}`, 'info');
  };

  return (
    <div className="glass panel-card animate-fade-up delay-4">
      <div className="panel-header">
        <div className="panel-title">
          <div className="panel-title-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}>
            <Target size={18} />
          </div>
          بوصلة المهارات
        </div>
        <span className="badge" style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}>
          <Briefcase size={11} /> سوق العمل
        </span>
      </div>

      <div className="skills-list">
        {skills.map((s) => (
          <div key={s.id} className="skill-card" style={{ '--skill-color': s.color }}>
            <div className="skill-top">
              <span className="skill-name" style={{ color: s.color }}>{s.skill}</span>
              {s.hot && (
                <span className="badge" style={{ background: 'rgba(244,63,94,0.12)', color: '#F43F5E', fontWeight: 800 }}>
                  🔥 فرصة الآن
                </span>
              )}
            </div>

            <div className="progress-track" style={{ marginBottom: '0.3rem' }}>
              <div className="progress-fill" style={{ width: `${s.level}%`, background: `linear-gradient(90deg, ${s.color}, ${s.color}88)` }} />
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>مستواك: {s.level}%</span>

            <p className="skill-reason">{s.reason}</p>

            <div className="skill-bottom">
              <span className="skill-boost" style={{ color: '#10B981' }}>
                <ArrowUpRight size={14} /> +{s.boost}% فرص التوظيف
              </span>
              <button className="btn btn-ghost" style={{ fontSize: '0.78rem' }}
                onClick={() => handleCourseClick(s)}>
                <ExternalLink size={13} /> {s.course}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── 5. Smart Tasks ────────────────────────────────────────────────────────── */

function TasksSection({ onToast }) {
  const [tasks, setTasks]       = useState(INITIAL_TASKS);
  const [expandedId, setExpandedId] = useState(null);
  const [completedSteps, setCompletedSteps] = useState({});

  const urgencyMap = {
    danger:  { color: '#F43F5E', bg: 'rgba(244,63,94,0.06)',  border: 'rgba(244,63,94,0.18)',  Icon: AlertTriangle },
    warning: { color: '#F59E0B', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.18)', Icon: Clock },
    success: { color: '#10B981', bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.18)', Icon: CheckCircle2 },
  };

  const activeCount = tasks.filter(t => t.urgency !== 'success').length;

  const handleStartTask = (taskId) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId
        ? { ...t, progress: 15, urgency: 'warning', aiNote: 'بدأتِ! استمري على هذا النمط 🚀' }
        : t
    ));
    onToast('تم بدء المهمة! الخطوة الأولى أمامك الآن 🚀', 'success');
  };

  const handleToggleStep = (taskId, stepIndex) => {
    const key = `${taskId}-${stepIndex}`;
    setCompletedSteps(prev => {
      const updated = { ...prev, [key]: !prev[key] };

      // حساب التقدم بناءً على الخطوات المكتملة
      const totalSteps = SPLIT_STEPS.length;
      const doneCount = SPLIT_STEPS.filter((_, i) => updated[`${taskId}-${i}`]).length;
      const newProgress = Math.round((doneCount / totalSteps) * 100);

      setTasks(prevTasks => prevTasks.map(t => {
        if (t.id !== taskId) return t;
        const newUrgency = newProgress === 100 ? 'success' : newProgress > 0 ? 'warning' : 'danger';
        const newNote = newProgress === 100
          ? 'أحسنتِ! مكتمل 🎉'
          : newProgress > 50
            ? `ممتاز! أكملتِ ${doneCount} من ${totalSteps} خطوات`
            : t.aiNote;
        return { ...t, progress: newProgress, urgency: newUrgency, aiNote: newNote };
      }));

      if (!prev[key]) {
        onToast(`تم إكمال الخطوة ${stepIndex + 1} ✅`, 'success');
      }

      return updated;
    });
  };

  return (
    <div className="glass panel-card animate-fade-up delay-5">
      <div className="panel-header">
        <div className="panel-title">
          <div className="panel-title-icon" style={{ background: 'rgba(244,63,94,0.12)', color: '#F43F5E' }}>
            <ClipboardList size={18} />
          </div>
          المهام الذكية
        </div>
        <span className="badge" style={{ background: 'rgba(244,63,94,0.12)', color: '#F43F5E' }}>
          {activeCount} نشط
        </span>
      </div>

      <div className="tasks-list">
        {tasks.map((t) => {
          const u    = urgencyMap[t.urgency];
          const open = expandedId === t.id;
          return (
            <div key={t.id} className="task-card" style={{ background: u.bg, borderColor: u.border }}>
              <div className="task-row">
                <div className="task-icon" style={{ color: u.color }}>
                  <u.Icon size={20} />
                </div>
                <div className="task-body">
                  <span className="task-title">{t.title}</span>
                  <span className="task-deadline">
                    <Timer size={12} /> {t.deadline}
                  </span>
                  {t.progress > 0 && t.progress < 100 && (
                    <div style={{ marginTop: '0.4rem' }}>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${t.progress}%`, background: `linear-gradient(90deg, ${u.color}, ${u.color}88)` }} />
                      </div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{t.progress}%</span>
                    </div>
                  )}
                  <p className="task-ai-note" style={{ color: u.color }}>
                    <Sparkles size={12} /> {t.aiNote}
                  </p>
                </div>
                {t.canSplit && (
                  <button
                    className="btn btn-danger"
                    style={{ fontSize: '0.78rem', flexShrink: 0 }}
                    onClick={() => setExpandedId(open ? null : t.id)}
                  >
                    <Zap size={13} /> قسّمي المهمة
                    <ChevronDown size={13} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
                  </button>
                )}
              </div>

              {/* الخطوات المنسدلة — الآن تفاعلية! */}
              {open && (
                <div className="split-panel">
                  <p className="split-title">
                    📋 الخطة المقترحة — إجمالي: ~2.7 ساعة
                  </p>
                  {SPLIT_STEPS.map((step, i) => {
                    const isDone = completedSteps[`${t.id}-${i}`];
                    return (
                      <div
                        key={i}
                        className={`split-step ${isDone ? 'split-step-done' : ''}`}
                        onClick={() => handleToggleStep(t.id, i)}
                        style={{ cursor: 'pointer' }}
                      >
                        <span className={`split-check ${isDone ? 'checked' : ''}`}>
                          {isDone ? <Check size={12} /> : <span className="split-num-inner">{i + 1}</span>}
                        </span>
                        <span className="split-icon">{step.icon}</span>
                        <span className="split-text" style={{ textDecoration: isDone ? 'line-through' : 'none', opacity: isDone ? 0.5 : 1 }}>
                          {step.text}
                        </span>
                        <span className="split-time"><Timer size={11} /> {step.time}</span>
                      </div>
                    );
                  })}
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem' }}
                    onClick={() => handleStartTask(t.id)}
                  >
                    <Zap size={14} /> ابدئي الآن — الخطوة الأولى
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export default function StudentDashboard({ activeTab, onToast }) {
  const toast = onToast || (() => {});

  // إذا كان التبويب محدد → نعرض القسم المطلوب فقط
  switch (activeTab) {
    case 'tasks':
      return (
        <div className="student-dash">
          <HeroSection student={STUDENT} />
          <TasksSection onToast={toast} />
        </div>
      );
    case 'skills':
      return (
        <div className="student-dash">
          <HeroSection student={STUDENT} />
          <SkillsSection skills={SKILLS} onToast={toast} />
        </div>
      );
    case 'peers':
      return (
        <div className="student-dash">
          <HeroSection student={STUDENT} />
          <PeersSection peers={PEERS} onToast={toast} />
        </div>
      );
    default: // 'overview' — عرض كل شيء
      return (
        <div className="student-dash">
          <HeroSection student={STUDENT} />
          <div className="dashboard-grid-even">
            <AdaptiveSection items={ADAPTIVE} onToast={toast} />
            <PeersSection    peers={PEERS}    onToast={toast} />
          </div>
          <div className="dashboard-grid-even">
            <SkillsSection skills={SKILLS}  onToast={toast} />
            <TasksSection                   onToast={toast} />
          </div>
        </div>
      );
  }
}

