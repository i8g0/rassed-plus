import { useEffect, useRef, useState } from 'react';
import {
  Video, Headphones, MapPin, Users, Calendar,
  Zap, TrendingUp, AlertTriangle, CheckCircle2,
  Clock, Target, Briefcase,
  BrainCircuit, Sparkles, ArrowUpRight,
  ChevronDown, Play, ClipboardList, Timer,
  ExternalLink, Check, X, Activity,
} from 'lucide-react';
import { createAiLog } from '../services/api';
import { useRased } from '../contexts/RasedContext';
import { useLanguage } from '../contexts/LanguageProvider';
import AssignmentsList from './AssignmentsList';
import AttendanceRadar from './AttendanceRadar';
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
  const { t, formatDate } = useLanguage();
  const statusMap = {
    success: { color: '#6ee7b7', bg: 'rgba(110,231,183,0.1)', border: 'rgba(110,231,183,0.25)', Icon: CheckCircle2 },
    warning: { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)', Icon: AlertTriangle },
    danger: { color: '#fda4af', bg: 'rgba(253,164,175,0.1)', border: 'rgba(253,164,175,0.25)', Icon: AlertTriangle },
  };
  const st = statusMap[student?.status] || statusMap.warning;

  return (
    <div className="hero-banner animate-fade-up">
      <div className="hero-mesh" />
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />

      <div className="hero-content">
        <div className="hero-text">
          <p className="hero-date">{formatDate(new Date(), { weekday: 'long' })}</p>
          <h1 className="hero-title">{t('student.welcome', { name: (student?.name || t('common.studentPlaceholder')).split(' ')[0] })}<span className="hero-wave">👋</span></h1>
          <div className="hero-status" style={{ background: st.bg, borderColor: st.border, color: st.color }}>
            <st.Icon size={15} />
            <span>{student?.statusMessage || t('student.loadingStatus')}</span>
          </div>
          <div className="hero-meta">
            {student?.major || ''} — {student?.year || ''}
            {student?.streak > 0 && <span className="streak-badge">🔥 {student.streak} {t('student.streakDays')}</span>}
          </div>
        </div>

        <div className="hero-stats">
          <CircleProgress value={student?.gpa ?? 0} max={student?.maxGpa ?? 5} label={t('student.gpa')} color="#2dd4bf" />
          <CircleProgress value={student?.completionRate ?? 0} max={100} label={t('student.tasksProgress')} color="#6ee7b7" />
        </div>
      </div>
    </div>
  );
}

function AdaptiveSection({ items, onToast, studentId }) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState(null);

  const handleSelect = async (itemId, altKey, altLabel) => {
    const key = `${itemId}-${altKey}`;
    setSelected((prev) => (prev === key ? null : key));
    onToast(t('student.selectedOption', { label: altLabel }), 'info');

    try {
      await createAiLog({
        actor_role: 'student',
        actor_id: studentId,
        action_type: 'adaptive_route_selected',
        entity_type: 'course',
        entity_id: String(itemId),
        prompt: altLabel,
        response: 'adaptive route selected',
        metadata: { option: altKey, label: altLabel },
      });
    } catch (err) {
      console.error('Action selected error:', err);
      onToast(t('student.saveAdaptiveFailed'), 'warning');
    }
  };

  const safeItems = Array.isArray(items) ? items : [];

  return (
    <div className="glass panel-card animate-fade-up delay-2">
      <div className="panel-header">
        <div className="panel-title">
          <div className="panel-title-icon" style={{ background: 'rgba(45,212,191,0.12)', color: '#2dd4bf' }}><BrainCircuit size={18} /></div>
          {t('student.adaptiveGuidance')}
        </div>
        <span className="badge" style={{ background: 'rgba(45,212,191,0.12)', color: '#2dd4bf' }}><Sparkles size={11} /> {t('student.suggestionsCount', { count: safeItems.length })}</span>
      </div>

      <div className="adaptive-list">
        {safeItems.map((item) => (
          <div key={item.id} className="adaptive-card">
            <div className="adaptive-header"><span className="adaptive-course">{item.courseIcon} {item.course}</span></div>
            <p className="adaptive-issue">{item.issue}</p>
            <div className="adaptive-alts">
              {(Array.isArray(item.alternatives) ? item.alternatives : []).map((alt) => {
                const AltIcon = SPLIT_ICON_MAP[alt.key] || Play;
                const isActive = selected === `${item.id}-${alt.key}`;
                return (
                  <button key={alt.key} className={`alt-btn ${isActive ? 'active' : ''}`} style={{ '--alt-color': alt.color, '--alt-bg': alt.bg }} onClick={() => handleSelect(item.id, alt.key, alt.label)}>
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

function PeersSection({ peers, onToast, currentStudentId }) {
  const { t } = useLanguage();
  const { triggerPeerMatch, matchLoading } = useRased();
  const [selectedPeer, setSelectedPeer] = useState(null);

  const handleRequest = async (peer) => {
    const chosenPeer = peer || null;
    setSelectedPeer(chosenPeer);

    if (peer?.requested) {
      onToast(t('student.requestAlreadySent', { name: peer?.name }), 'warning');
      return;
    }

    try {
      const match = await triggerPeerMatch(currentStudentId, peer?.weak || t('student.defaultWeakSkill'), peer?.id);
      const peerName = chosenPeer?.name || match?.match?.name || t('student.selectedPeerFallback');
      onToast(t('student.scheduledWith', { name: peerName }), 'success');
    } catch (err) {
      console.error('PeerMatch error:', err);
      onToast(t('student.peerServerFailed'), 'error');
    }
  };

  const safePeers = Array.isArray(peers) ? peers : [];

  return (
    <div className="glass panel-card animate-fade-up delay-3">
      <div className="panel-header">
        <div className="panel-title">
          <div className="panel-title-icon" style={{ background: 'rgba(110,231,183,0.12)', color: '#6ee7b7' }}><Users size={18} /></div>
          {t('student.peerMatching')}
        </div>
        <span className="badge" style={{ background: 'rgba(110,231,183,0.12)', color: '#6ee7b7' }}>{t('student.highCompatibility')}</span>
      </div>

      <div className="peers-list">
        {safePeers.map((p) => (
          <div key={p.id} className="peer-card">
            <div className="peer-top">
              <div className="peer-avatar" style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color}88)` }}>{p.initials}</div>
              <div className="peer-info">
                <span className="peer-name">{p.name}</span>
                <div className="peer-skills">
                  <span className="peer-skill good">✅ {p.strong}</span>
                  <span className="peer-skill need">📚 {t('student.needPrefix')}: {p.weak}</span>
                </div>
              </div>
              <div className="peer-compat"><span className="compat-value">{p.compatibility}%</span><span className="compat-label">{t('student.compatibility')}</span></div>
            </div>
            <p className="peer-reason">{p.reason}</p>
            <button className={`btn ${p.requested ? 'btn-ghost' : 'btn-success'}`} style={{ width: '100%', justifyContent: 'center' }} onClick={() => handleRequest(p)} disabled={Boolean(matchLoading?.[currentStudentId])}>
              {matchLoading?.[currentStudentId] && selectedPeer?.id === p?.id ? <><CheckCircle2 size={14} /> {t('student.searchingForPeer', { name: selectedPeer?.name })}</> : p.requested
                ? <><CheckCircle2 size={14} /> {t('student.requestedWaiting')}</>
                : <><Calendar size={14} /> {t('student.scheduleSessionWith', { name: p?.name })}</>}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillsSection({ skills, onToast }) {
  const { t } = useLanguage();
  const handleCourseClick = async (skill) => {
    try {
      window.open(skill?.link, '_blank', 'noopener,noreferrer');
      onToast(t('student.openCourse', { course: skill?.course, platform: skill?.platform }), 'info');
    } catch (err) {
      console.error('Course redirect failed:', err);
      onToast(t('student.openCourseFailed'), 'warning');
    }
  };

  return (
    <div className="glass panel-card animate-fade-up delay-4">
      <div className="panel-header">
        <div className="panel-title">
          <div className="panel-title-icon" style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}><Target size={18} /></div>
          {t('student.skillsCompass')}
        </div>
        <span className="badge" style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}><Briefcase size={11} /> {t('student.jobMarket')}</span>
      </div>

      <div className="skills-list">
        {(Array.isArray(skills) ? skills : []).map((s) => (
          <div key={s.id} className="skill-card" style={{ '--skill-color': s.color }}>
            <div className="skill-top">
              <span className="skill-name" style={{ color: s.color }}>{s.skill}</span>
              {s.hot && <span className="badge" style={{ background: 'rgba(253,164,175,0.12)', color: '#fda4af', fontWeight: 800 }}>🔥 {t('student.opportunityNow')}</span>}
            </div>

            <div className="progress-track" style={{ marginBottom: '0.3rem' }}>
              <div className="progress-fill" style={{ width: `${s.level}%`, background: `linear-gradient(90deg, ${s.color}, ${s.color}88)` }} />
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{t('student.levelYour')}: {s.level}%</span>

            <p className="skill-reason">{s.reason}</p>

            <div className="skill-bottom">
              <span className="skill-boost" style={{ color: '#6ee7b7' }}><ArrowUpRight size={14} /> +{s.boost}% {t('student.employmentBoost')}</span>
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

function TasksSection({ onToast, initialTasks = [], splitSteps = [] }) {
  const { t: tr } = useLanguage();
  const { adaptiveLoading, triggerAdaptiveRouting, updateTask } = useRased();
  const [tasks, setTasks] = useState(initialTasks);
  const [expandedId, setExpandedId] = useState(null);
  const [completedSteps, setCompletedSteps] = useState({});

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const urgencyMap = {
    danger: { color: '#fda4af', bg: 'rgba(253,164,175,0.06)', border: 'rgba(253,164,175,0.18)', Icon: AlertTriangle },
    warning: { color: '#fbbf24', bg: 'rgba(251,191,36,0.06)', border: 'rgba(251,191,36,0.18)', Icon: Clock },
    success: { color: '#6ee7b7', bg: 'rgba(110,231,183,0.06)', border: 'rgba(110,231,183,0.18)', Icon: CheckCircle2 },
  };

  const activeCount = tasks.filter((t) => t.urgency !== 'success').length;
  const splitTaskLabel = tr('student.splitTask');
  const startNowLabel = tr('student.startNowFirstStep');

  const handleStartTask = async (taskId) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, progress: 15, urgency: 'warning', aiNote: tr('student.taskStartedNote') } : task)));
    await updateTask(taskId, 15);
    onToast(tr('student.taskStarted'), 'success');
  };

  const handleStepComplete = async (taskId, stepIndex) => {
    const key = `${taskId}-${stepIndex}`;
    setCompletedSteps(prev => ({ ...prev, [key]: !prev[key] }));
    const tTask = tasks.find((task) => task.id === taskId);
    const newProgress = Math.min(100, (tTask?.progress || 0) + 20);
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, progress: newProgress } : task)));

    await updateTask(taskId, newProgress);
    if (!completedSteps[key]) onToast(tr('student.stepCompleted', { step: stepIndex + 1 }), 'success');
  };

  const handleAdaptiveMock = async (taskId, title, type) => {
    if (adaptiveLoading?.[taskId]) return;
    try {
      const content = await triggerAdaptiveRouting(taskId, title, type);
      const label = type === 'map' ? tr('student.mindMapLabel') : tr('student.audioLabel');
      onToast(tr('student.adaptiveGenerated'), 'success');
      setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, aiNote: `🎙️ ${label}:\n${content}`, aiActivated: true } : task)));
    } catch {
      onToast(tr('student.adaptiveError'), 'error');
    }
  };

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeSplitSteps = Array.isArray(splitSteps) ? splitSteps : [];

  return (
    <div className="glass panel-card animate-fade-up delay-5">
      <div className="panel-header">
        <div className="panel-title">
          <div className="panel-title-icon" style={{ background: 'rgba(253,164,175,0.12)', color: '#fda4af' }}><ClipboardList size={18} /></div>
          {tr('student.smartTasks')}
        </div>
        <span className="badge" style={{ background: 'rgba(253,164,175,0.12)', color: '#fda4af' }}>{tr('student.activeCount', { count: activeCount })}</span>
      </div>

      <div className="tasks-list">
        {safeTasks.map((task) => {
          const u = urgencyMap[task?.urgency] || urgencyMap.warning;
          const open = expandedId === task.id;
          return (
            <div key={task.id} className="task-card" style={{ background: u.bg, borderColor: u.border }}>
              <div className="task-row">
                <div className="task-icon" style={{ color: u.color }}><u.Icon size={20} /></div>
                <div className="task-body">
                  <span className="task-title">{task.title}</span>
                  <span className="task-deadline"><Timer size={12} /> {task.deadline}</span>
                  {task.progress > 0 && task.progress < 100 && (
                    <div style={{ marginTop: '0.4rem' }}>
                      <div className="progress-track"><div className="progress-fill" style={{ width: `${task.progress}%`, background: `linear-gradient(90deg, ${u.color}, ${u.color}88)` }} /></div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{task.progress}%</span>
                    </div>
                  )}
                  {task.urgency === 'danger' && !task.aiActivated && (
                    <div style={{ background: 'rgba(253,164,175,0.08)', padding: '0.7rem', borderRadius: '8px', marginTop: '0.6rem', border: '1px solid rgba(253,164,175,0.2)' }}>
                      <p style={{ fontSize: '0.82rem', marginBottom: '0.5rem', color: '#fda4af', fontWeight: 600 }}>{tr('student.contentTooComplex')}</p>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', color: '#2dd4bf', borderColor: 'rgba(45,212,191,0.3)' }} onClick={() => handleAdaptiveMock(task.id, task.title, 'map')} disabled={adaptiveLoading?.[task.id]}>
                          {adaptiveLoading?.[task.id] ? tr('student.smartAnalyzing') : <><MapPin size={12}/> {tr('student.mindMap')}</>}
                        </button>
                        <button className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', color: '#6ee7b7', borderColor: 'rgba(110,231,183,0.3)' }} onClick={() => handleAdaptiveMock(task.id, task.title, 'audio')} disabled={adaptiveLoading?.[task.id]}>
                           {adaptiveLoading?.[task.id] ? tr('student.proactivePreparing') : <><Headphones size={12}/> {tr('student.audioClip')}</>}
                        </button>
                      </div>
                    </div>
                  )}
                  <p className="task-ai-note" style={{ color: u.color }}><Sparkles size={12} /> {task.aiNote}</p>
                </div>
                {task.canSplit && task.urgency !== 'danger' && (
                  <button className="btn btn-danger" style={{ fontSize: '0.78rem', flexShrink: 0 }} onClick={() => setExpandedId(open ? null : task.id)}>
                    <Zap size={13} /> {splitTaskLabel}
                    <ChevronDown size={13} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
                  </button>
                )}
              </div>

              {open && (
                <div className="split-panel">
                  <p className="split-title">📋 {tr('student.suggestedPlan')}</p>
                  {safeSplitSteps.map((step, i) => {
                    const isDone = completedSteps[`${task.id}-${i}`];
                    return (
                      <div key={i} className={`split-step ${isDone ? 'split-step-done' : ''}`} onClick={() => handleStepComplete(task.id, i)} style={{ cursor: 'pointer' }}>
                        <span className={`split-check ${isDone ? 'checked' : ''}`}>{isDone ? <Check size={12} /> : <span className="split-num-inner">{i + 1}</span>}</span>
                        <span className="split-icon">{step.icon}</span>
                        <span className="split-text" style={{ textDecoration: isDone ? 'line-through' : 'none', opacity: isDone ? 0.5 : 1 }}>{step.text}</span>
                        <span className="split-time"><Timer size={11} /> {step.time}</span>
                      </div>
                    );
                  })}
                  <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem' }} onClick={() => handleStartTask(task.id)}>
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

function StudentAIAutoMessage({ message }) {
  const { t } = useLanguage();
  if (!message) return null;

  return (
    <div className="glass panel-card animate-fade-up" style={{ borderColor: 'rgba(45,212,191,0.24)' }}>
      <div className="panel-header" style={{ marginBottom: '0.5rem' }}>
        <div className="panel-title">
          <div className="panel-title-icon" style={{ background: 'rgba(45,212,191,0.12)', color: '#2dd4bf' }}><Sparkles size={18} /></div>
          {t('student.autoMessageTitle')}
        </div>
      </div>
      <div style={{
        color: 'var(--text-primary)',
        fontSize: '0.86rem',
        lineHeight: 1.75,
        background: 'rgba(45,212,191,0.08)',
        border: '1px solid rgba(45,212,191,0.2)',
        borderRadius: '12px',
        padding: '0.85rem',
      }}>
        {message}
      </div>
    </div>
  );
}


export default function StudentDashboard({ activeTab, onToast, currentUser }) {
  const { t } = useLanguage();
  const toast = onToast || (() => {});
  const { dashboardData: data, loading, error, refreshDashboard } = useRased();
  const lastAutoMessageKeyRef = useRef('');

  useEffect(() => {
    // Refresh triggered automatically by RasedProvider 
  }, [currentUser?.id, activeTab]);

  useEffect(() => {
    const message = String(data?.aiAutoMessage || '').trim();
    if (!message) return;

    const messageKey = `${currentUser?.id || 'student'}:${message}`;
    if (messageKey === lastAutoMessageKeyRef.current) return;

    if (typeof onToast === 'function') onToast(message, 'info');
    lastAutoMessageKeyRef.current = messageKey;
  }, [currentUser?.id, data?.aiAutoMessage, onToast]);

  if (error) {
    return (
      <div className="glass panel-card" style={{ color: '#fda4af', padding: '2rem', textAlign: 'center' }}>
        <AlertTriangle size={30} style={{ margin: '0 auto 1rem' }} />
        {error}
        <button className="btn btn-ghost" style={{ marginTop: '1rem', width: 'auto' }} onClick={refreshDashboard}>{t('student.retry')}</button>
      </div>
    );
  }

  if (loading || !data?.student) {
    return <div className="glass panel-card">{t('student.studentDataSync')}</div>;
  }

  switch (activeTab) {
    case 'tasks':
      return (
        <div className="student-dash">
          <HeroSection student={data.student} />
          <StudentAIAutoMessage message={data.aiAutoMessage} />
          <div className="dashboard-grid-even">
            <AssignmentsList assignments={data.unifiedAssignments} />
            <AttendanceRadar courses={data.attendanceRadar} />
          </div>
          <TasksSection onToast={toast} initialTasks={data.tasks} splitSteps={data.splitSteps} />
        </div>
      );
    case 'skills':
      return (
        <div className="student-dash">
          <HeroSection student={data.student} />
          <SkillsSection skills={data.skills} onToast={toast} />
        </div>
      );
    case 'peers':
      return (
        <div className="student-dash">
          <HeroSection student={data.student} />
          <PeersSection peers={data.peers} onToast={toast} currentStudentId={currentUser?.id} />
        </div>
      );
    default:
      return (
        <div className="student-dash">
          <HeroSection student={data.student} />
          <StudentAIAutoMessage message={data.aiAutoMessage} />
          <div className="dashboard-grid-even">
            <AssignmentsList assignments={data.unifiedAssignments} />
            <AttendanceRadar courses={data.attendanceRadar} />
          </div>
          <div className="dashboard-grid-even">
            <AdaptiveSection items={data.adaptive} onToast={toast} studentId={currentUser?.id} />
            <TasksSection onToast={toast} initialTasks={data.tasks} splitSteps={data.splitSteps} />
          </div>
          <div className="dashboard-grid-even">
            <SkillsSection skills={data.skills} onToast={toast} />
            <PeersSection peers={data.peers} onToast={toast} currentStudentId={currentUser?.id} />
          </div>
        </div>
      );
  }
}
