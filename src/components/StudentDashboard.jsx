import { useEffect, useState } from 'react';
import {
  Video, Headphones, MapPin, Users, Calendar,
  Zap, TrendingUp, AlertTriangle, CheckCircle2,
  Clock, Target, Briefcase,
  BrainCircuit, Sparkles, ArrowUpRight,
  ChevronDown, Play, ClipboardList, Timer,
  ExternalLink, Check, X, Activity,
} from 'lucide-react';
import {
  createAiLog,
  getStudentDashboard,
  requestPeerMatch,
  updateStudentTaskProgress,
} from '../services/api';
import { verbByGender } from '../utils/localization';
import './StudentDashboard.css';

const SPLIT_ICON_MAP = {
  video: Video,
  podcast: Headphones,
  map: MapPin,
};

function CircleProgress({ value, max, label, color, size = 110 }) {
  const pct = (value / max) * 100;
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="circle-progress">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.22,1,0.36,1)', filter: `drop-shadow(0 0 6px ${color}55)` }}
        />
        <text x={size / 2} y={size / 2 + 1} textAnchor="middle" dominantBaseline="central" fill="white" fontFamily="Tajawal" fontSize={size * 0.2} fontWeight="800">
          {value}{max === 100 ? '%' : ''}
        </text>
      </svg>
      <span className="circle-label">{label}</span>
    </div>
  );
}

function HeroSection({ student }) {
  const statusMap = {
    success: { color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', Icon: CheckCircle2 },
    warning: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', Icon: AlertTriangle },
    danger: { color: '#F43F5E', bg: 'rgba(244,63,94,0.1)', border: 'rgba(244,63,94,0.25)', Icon: AlertTriangle },
  };
  const st = statusMap[student.status] || statusMap.warning;

  return (
    <div className="hero-banner animate-fade-up">
      <div className="hero-mesh" />
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />

      <div className="hero-content">
        <div className="hero-text">
          <p className="hero-date">{new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <h1 className="hero-title">مرحباً يا {student.name.split(' ')[0]}<span className="hero-wave">👋</span></h1>
          <div className="hero-status" style={{ background: st.bg, borderColor: st.border, color: st.color }}>
            <st.Icon size={15} />
            <span>{student.statusMessage}</span>
          </div>
          <div className="hero-meta">
            {student.major} — {student.year}
            {student.streak > 0 && <span className="streak-badge">🔥 {student.streak} أيام متواصلة</span>}
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


function PeersSection({ peers, onToast, studentId }) {
  const [requested, setRequested] = useState({});

  const handleRequest = async (peer) => {
    const wasRequested = requested[peer.id];
    if (wasRequested) {
      setRequested((prev) => ({ ...prev, [peer.id]: false }));
      onToast(`تم إلغاء الطلب لـ ${peer.name}`, 'warning');
      return;
    }

    try {
      const match = await requestPeerMatch(studentId, peer.weak || 'الرياضيات');
      setRequested((prev) => ({ ...prev, [peer.id]: true }));
      onToast(match.message || `تم إرسال طلب جلسة لـ ${peer.name}`, 'success');
    } catch {
      onToast('تعذرت عملية التوأمة من الخادم', 'warning');
    }
  };

  return (
    <div className="glass panel-card animate-fade-up delay-3">
      <div className="panel-header">
        <div className="panel-title">
          <div className="panel-title-icon" style={{ background: 'rgba(52,211,153,0.12)', color: '#34D399' }}><Users size={18} /></div>
          التوأمة الأكاديمية
        </div>
        <span className="badge" style={{ background: 'rgba(52,211,153,0.12)', color: '#34D399' }}>توافق عالي</span>
      </div>

      <div className="peers-list">
        {peers.map((p) => (
          <div key={p.id} className="peer-card">
            <div className="peer-top">
              <div className="peer-avatar" style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color}88)` }}>{p.initials}</div>
              <div className="peer-info">
                <span className="peer-name">{p.name}</span>
                <div className="peer-skills">
                  <span className="peer-skill good">✅ {p.strong}</span>
                  <span className="peer-skill need">📚 يحتاج: {p.weak}</span>
                </div>
              </div>
              <div className="peer-compat"><span className="compat-value">{p.compatibility}%</span><span className="compat-label">توافق</span></div>
            </div>
            <p className="peer-reason">{p.reason}</p>
            <button className={`btn ${requested[p.id] ? 'btn-ghost' : 'btn-success'}`} style={{ width: '100%', justifyContent: 'center' }} onClick={() => handleRequest(p)}>
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

function SkillsSection({ skills, onToast }) {
  const handleCourseClick = async (skill) => {
    window.open(skill.link, '_blank');
    onToast(`تم فتح ${skill.course} على ${skill.platform}`, 'info');
  };

  return (
    <div className="glass panel-card animate-fade-up delay-4">
      <div className="panel-header">
        <div className="panel-title">
          <div className="panel-title-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}><Target size={18} /></div>
          بوصلة المهارات
        </div>
        <span className="badge" style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}><Briefcase size={11} /> سوق العمل</span>
      </div>

      <div className="skills-list">
        {skills.map((s) => (
          <div key={s.id} className="skill-card" style={{ '--skill-color': s.color }}>
            <div className="skill-top">
              <span className="skill-name" style={{ color: s.color }}>{s.skill}</span>
              {s.hot && <span className="badge" style={{ background: 'rgba(244,63,94,0.12)', color: '#F43F5E', fontWeight: 800 }}>🔥 فرصة الآن</span>}
            </div>

            <div className="progress-track" style={{ marginBottom: '0.3rem' }}>
              <div className="progress-fill" style={{ width: `${s.level}%`, background: `linear-gradient(90deg, ${s.color}, ${s.color}88)` }} />
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>مستواك: {s.level}%</span>

            <p className="skill-reason">{s.reason}</p>

            <div className="skill-bottom">
              <span className="skill-boost" style={{ color: '#10B981' }}><ArrowUpRight size={14} /> +{s.boost}% فرص التوظيف</span>
              <button className="btn btn-ghost" style={{ fontSize: '0.78rem' }} onClick={() => handleCourseClick(s)}>
                <ExternalLink size={13} /> {s.course}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TasksSection({ onToast, studentId, initialTasks = [], splitSteps = [], gender = 'male' }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [expandedId, setExpandedId] = useState(null);
  const [completedSteps, setCompletedSteps] = useState({});
  const [processingAdaptive, setProcessingAdaptive] = useState(null);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const urgencyMap = {
    danger: { color: '#F43F5E', bg: 'rgba(244,63,94,0.06)', border: 'rgba(244,63,94,0.18)', Icon: AlertTriangle },
    warning: { color: '#F59E0B', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.18)', Icon: Clock },
    success: { color: '#10B981', bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.18)', Icon: CheckCircle2 },
  };

  const activeCount = tasks.filter((t) => t.urgency !== 'success').length;
  const splitTaskLabel = `${verbByGender(gender, 'قسّم', 'قسّمي')} المهمة`;
  const startNowLabel = `${verbByGender(gender, 'ابدأ', 'ابدئي')} الآن — الخطوة الأولى`;

  const persistProgress = async (progress) => {
    try {
      await updateStudentTaskProgress(studentId, progress);
    } catch {
      onToast('تعذر تحديث تقدم المهمة في قاعدة البيانات', 'warning');
    }
  };

  const handleStartTask = async (taskId) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, progress: 15, urgency: 'warning', aiNote: 'بدأت! استمر بهذا الزخم 🚀' } : t)));
    await persistProgress(15);
    onToast('تم بدء المهمة! الخطوة الأولى أمامك الآن 🚀', 'success');
  };

  const handleToggleStep = async (taskId, stepIndex) => {
    const key = `${taskId}-${stepIndex}`;
    setCompletedSteps((prev) => ({ ...prev, [key]: !prev[key] }));

    const totalSteps = splitSteps.length || 1;
    const snapshot = { ...completedSteps, [key]: !completedSteps[key] };
    const doneCount = splitSteps.filter((_, i) => snapshot[`${taskId}-${i}`]).length;
    const newProgress = Math.round((doneCount / totalSteps) * 100);

    setTasks((prevTasks) => prevTasks.map((t) => {
      if (t.id !== taskId) return t;
      const newUrgency = newProgress === 100 ? 'success' : newProgress > 0 ? 'warning' : 'danger';
      const newNote = newProgress === 100 ? 'أحسنت! مكتمل 🎉' : newProgress > 50 ? `ممتاز! أكملت ${doneCount} من ${totalSteps} خطوات` : t.aiNote;
      return { ...t, progress: newProgress, urgency: newUrgency, aiNote: newNote };
    }));

    await persistProgress(newProgress);
    if (!completedSteps[key]) onToast(`تم إكمال الخطوة ${stepIndex + 1} ✅`, 'success');
  };

  const handleAdaptiveMock = (taskId, type) => {
    setProcessingAdaptive(taskId);
    setTimeout(() => {
      setProcessingAdaptive(null);
      const label = type === 'map' ? 'الخريطة الذهنية' : 'المقطع الصوتي';
      onToast(`تم تحويل المحتوى إلى ${label} بنجاح!`, 'success');
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, aiNote: `تم تفعيل ${label} 🧠` } : t));
    }, 2000);
  };

  return (
    <div className="glass panel-card animate-fade-up delay-5">
      <div className="panel-header">
        <div className="panel-title">
          <div className="panel-title-icon" style={{ background: 'rgba(244,63,94,0.12)', color: '#F43F5E' }}><ClipboardList size={18} /></div>
          المهام الذكية
        </div>
        <span className="badge" style={{ background: 'rgba(244,63,94,0.12)', color: '#F43F5E' }}>{activeCount} نشط</span>
      </div>

      <div className="tasks-list">
        {tasks.map((t) => {
          const u = urgencyMap[t.urgency] || urgencyMap.warning;
          const open = expandedId === t.id;
          return (
            <div key={t.id} className="task-card" style={{ background: u.bg, borderColor: u.border }}>
              <div className="task-row">
                <div className="task-icon" style={{ color: u.color }}><u.Icon size={20} /></div>
                <div className="task-body">
                  <span className="task-title">{t.title}</span>
                  <span className="task-deadline"><Timer size={12} /> {t.deadline}</span>
                  {t.progress > 0 && t.progress < 100 && (
                    <div style={{ marginTop: '0.4rem' }}>
                       <div className="progress-track"><div className="progress-fill" style={{ width: `${t.progress}%`, background: `linear-gradient(90deg, ${u.color}, ${u.color}88)` }} /></div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{t.progress}%</span>
                    </div>
                  )}
                  {t.urgency === 'danger' && !t.aiNote?.includes('تم تفعيل') && (
                    <div style={{ background: 'rgba(244,63,94,0.08)', padding: '0.7rem', borderRadius: '8px', marginTop: '0.6rem', border: '1px solid rgba(244,63,94,0.2)' }}>
                      <p style={{ fontSize: '0.82rem', marginBottom: '0.5rem', color: '#F43F5E', fontWeight: 600 }}>يبدو أن هذا المحتوى النصي معقد، هل تفضل تحويله الآن؟</p>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', color: '#818CF8', borderColor: 'rgba(129,140,248,0.3)' }} onClick={() => handleAdaptiveMock(t.id, 'map')} disabled={processingAdaptive === t.id}>
                          {processingAdaptive === t.id ? 'جاري التحويل...' : <><MapPin size={12}/> خريطة ذهنية</>}
                        </button>
                        <button className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', color: '#34D399', borderColor: 'rgba(52,211,153,0.3)' }} onClick={() => handleAdaptiveMock(t.id, 'audio')} disabled={processingAdaptive === t.id}>
                           {processingAdaptive === t.id ? 'جاري التحويل...' : <><Headphones size={12}/> مقطع صوتي</>}
                        </button>
                      </div>
                    </div>
                  )}
                  <p className="task-ai-note" style={{ color: u.color }}><Sparkles size={12} /> {t.aiNote}</p>
                </div>
                {t.canSplit && t.urgency !== 'danger' && (
                  <button className="btn btn-danger" style={{ fontSize: '0.78rem', flexShrink: 0 }} onClick={() => setExpandedId(open ? null : t.id)}>
                    <Zap size={13} /> {splitTaskLabel}
                    <ChevronDown size={13} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
                  </button>
                )}
              </div>

              {open && (
                <div className="split-panel">
                  <p className="split-title">📋 الخطة المقترحة — إجمالي: ~2.7 ساعة</p>
                  {splitSteps.map((step, i) => {
                    const isDone = completedSteps[`${t.id}-${i}`];
                    return (
                      <div key={i} className={`split-step ${isDone ? 'split-step-done' : ''}`} onClick={() => handleToggleStep(t.id, i)} style={{ cursor: 'pointer' }}>
                        <span className={`split-check ${isDone ? 'checked' : ''}`}>{isDone ? <Check size={12} /> : <span className="split-num-inner">{i + 1}</span>}</span>
                        <span className="split-icon">{step.icon}</span>
                        <span className="split-text" style={{ textDecoration: isDone ? 'line-through' : 'none', opacity: isDone ? 0.5 : 1 }}>{step.text}</span>
                        <span className="split-time"><Timer size={11} /> {step.time}</span>
                      </div>
                    );
                  })}
                  <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem' }} onClick={() => handleStartTask(t.id)}>
                    <Zap size={14} /> {startNowLabel}
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

function DigitalFatigueModal({ onClose }) {
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onClose]);

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-container glass animate-scale-in" style={{ maxWidth: '400px', textAlign: 'center' }}>
        <div style={{ padding: '2rem' }}>
          <Activity size={48} color="#22D3EE" style={{ margin: '0 auto 1rem' }} className="copilot-spin" />
          <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: '#22D3EE' }}>أخذت وقتاً طويلاً!</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            جلساتك الرقمية ممتدة. الاستراحة الآن تزيد تركيزك بنسبة 20%. خذ نفساً عميقاً واسترخِ لمدة نصف دقيقة.
          </p>
          
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#A5B4FC', margin: '1rem 0' }}>
            00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
             <button className="btn btn-primary" onClick={onClose}>
               لقد استرحت 🧘‍♂️
             </button>
             <button className="btn btn-ghost" onClick={onClose}>
               تخطي الآن
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboard({ activeTab, onToast, currentUser, gender = 'male' }) {
  const toast = onToast || (() => {});
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ student: null, adaptive: [], peers: [], skills: [], tasks: [], splitSteps: [] });
  const [showFatigue, setShowFatigue] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!currentUser?.id) return;

    setLoading(true);
    getStudentDashboard(currentUser.id)
      .then((payload) => {
        if (mounted) setData(payload);
      })
      .catch(() => {
        if (mounted) toast('تعذر تحميل لوحة الطالب من الخادم', 'warning');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [currentUser?.id, activeTab, toast]);

  // منبه الإرهاق الرقمي يظهر بعد دقيقة (للشوز استخدم 10 ثواني)
  useEffect(() => {
    const fatigueTimer = setTimeout(() => setShowFatigue(true), 15000);
    return () => clearTimeout(fatigueTimer);
  }, []);

  if (loading || !data.student) {
    return <div className="glass panel-card">جاري تحميل بيانات الطالب...</div>;
  }

  const renderFatigue = showFatigue ? <DigitalFatigueModal onClose={() => setShowFatigue(false)} /> : null;

  switch (activeTab) {
    case 'tasks':
      return (
        <div className="student-dash">
          {renderFatigue}
          <HeroSection student={data.student} />
          <TasksSection onToast={toast} studentId={currentUser.id} initialTasks={data.tasks} splitSteps={data.splitSteps} gender={gender} />
        </div>
      );
    case 'skills':
      return (
        <div className="student-dash">
          {renderFatigue}
          <HeroSection student={data.student} />
          <SkillsSection skills={data.skills} onToast={toast} />
        </div>
      );
    case 'peers':
      return (
        <div className="student-dash">
          {renderFatigue}
          <HeroSection student={data.student} />
          <PeersSection peers={data.peers} onToast={toast} studentId={currentUser.id} />
        </div>
      );
    default:
      return (
        <div className="student-dash">
          {renderFatigue}
          <HeroSection student={data.student} />
          <div className="dashboard-grid-even">
            <TasksSection onToast={toast} studentId={currentUser.id} initialTasks={data.tasks} splitSteps={data.splitSteps} gender={gender} />
            <PeersSection peers={data.peers} onToast={toast} studentId={currentUser.id} />
          </div>
          <div className="dashboard-grid-even">
            <SkillsSection skills={data.skills} onToast={toast} />
          </div>
        </div>
      );
  }
}
