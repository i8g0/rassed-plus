import { useEffect, useRef, useState } from 'react';
import {
  Users, ShieldAlert, Zap, TrendingUp, GraduationCap,
  BrainCircuit, Mail, Sparkles, ArrowUpRight,
  AlertTriangle, CheckCircle2, Clock, Search,
  Bot, Eye, FileText,
} from 'lucide-react';
import { getStudentBrief } from '../services/api';
import { useRased } from '../contexts/RasedContext';
import { useUser } from '../contexts/UserContext';

function LoadingSkeleton({ lines = 3, style }) {
  return (
    <div className="loading-skeleton" style={style}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton-line" style={{ width: `${85 - i * 15}%`, animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  );
}

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

// ─── AI Brief Modal ─────────────────────────────────────────────────────────

function BriefModal({ studentId, onClose }) {
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentBrief(studentId)
      .then((data) => setBrief(data))
      .catch(() => setBrief(null))
      .finally(() => setLoading(false));
  }, [studentId]);

  const urgencyLabels = { high: 'عاجل', medium: 'متوسط', low: 'منخفض' };

  return (
    <div className="brief-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="brief-modal">
        <h2><BrainCircuit size={20} /> ملخص الذكاء الاصطناعي {brief?.student_name ? `— ${brief.student_name}` : ''}</h2>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Sparkles size={24} style={{ animation: 'float 2s ease-in-out infinite', marginBottom: '0.5rem' }} />
            <p>جاري تحليل بيانات الطالب ومحادثاته مع المرشد الذكي...</p>
          </div>
        ) : !brief ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>تعذر تحميل الملخص.</p>
        ) : (
          <>
            {/* تحليل مخرجات التعلم */}
            <div className="brief-section">
              <div className="brief-section-title">📊 تحليل مخرجات التعلم (CLOs)</div>
              <p>{brief.clo_analysis}</p>
              <div style={{ marginTop: '0.5rem' }}>
                <span className={`brief-urgency ${brief.urgency}`}>
                  ⚡ أولوية: {urgencyLabels[brief.urgency] || brief.urgency}
                </span>
              </div>
            </div>

            {/* الفجوات المعرفية */}
            {brief.prerequisite_gaps?.length > 0 && (
              <div className="brief-section">
                <div className="brief-section-title">⚠️ الفجوات المعرفية التراكمية</div>
                <ul>
                  {brief.prerequisite_gaps.map((g, i) => <li key={i}>{g}</li>)}
                </ul>
              </div>
            )}

            {/* نمط التسليم */}
            {brief.submission_habits && (
              <div className="brief-section">
                <div className="brief-section-title">⏱️ نمط تسليم المهام</div>
                <p>{brief.submission_habits}</p>
              </div>
            )}

            {/* مقاييس التقييم */}
            {brief.assessment_metrics && (
              <div className="brief-section">
                <div className="brief-section-title">📈 مقاييس التقييم</div>
                <ul>
                  <li>الاختبار النصفي: {brief.assessment_metrics.midterm}</li>
                  <li>المشاريع والواجبات: {brief.assessment_metrics.assignments}</li>
                </ul>
              </div>
            )}

            {/* التوصيات */}
            {brief.recommended_actions?.length > 0 && (
              <div className="brief-section">
                <div className="brief-section-title">✅ التوصيات</div>
                <ul>
                  {brief.recommended_actions.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </div>
            )}
          </>
        )}

        <button className="brief-close-btn" onClick={onClose}>إغلاق</button>
      </div>
    </div>
  );
}

function DashboardTab({ students, stats, onIntervention, onToast, onPeerMatch, matchingById, isSupervisor }) {
  const handlePeerMatch = async (student) => {
    const weakSkill = student?.weakSkills?.[0] || student?.major || 'علوم الحاسب';
    try {
      const result = await onPeerMatch(student?.id, weakSkill);
      onToast(result?.message || `تم إرسال طلب توأمة أكاديمية لـ ${student?.name}`, 'info');
    } catch (err) {
      console.error(err);
      onToast('تعذرت عملية التوأمة من الخادم', 'warning');
    }
  };

  const handleEscalation = (student) => {
    try {
      onIntervention?.(student);
      onToast?.(`تم تصعيد حالة ${student?.name} للتدخل المكثف`, 'warning');
    } catch (err) {
      console.error(err);
      onToast?.('تعذر تصعيد الحالة حالياً', 'warning');
    }
  };

  const safeStudents = Array.isArray(students) ? students : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="stats-row animate-fade-up">
        <StatCard icon={<Users size={24} />} label="إجمالي الطلاب" value={stats?.totalStudents?.toLocaleString() ?? "N/A"}
          trend="محدث مباشرة" trendColor="var(--brand-emerald)"
          iconBg="rgba(110,231,183,0.12)" iconColor="var(--brand-emerald)" />
        <StatCard icon={<ShieldAlert size={24} />} label="تدخلات مطلوبة اليوم"
          value={stats?.interventionsToday?.toString() ?? "N/A"}
          trend={`${stats?.redCount ?? 0} عاجل • ${stats?.yellowCount ?? 0} مراقبة`}
          trendColor="var(--brand-rose)"
          iconBg="rgba(253,164,175,0.12)" iconColor="var(--brand-rose)" valueColor="var(--brand-rose)" />
        <StatCard icon={<GraduationCap size={24} />} label="تدخلات ناجحة"
          value={stats?.successfulInterventions?.toString() ?? "N/A"}
          trend={`نسبة النجاح ${stats?.successRate ?? 0}%`} trendColor="var(--brand-emerald)"
          iconBg="rgba(45,212,191,0.12)" iconColor="var(--brand-cyan)" />
      </div>

      <div className="dashboard-grid animate-fade-up delay-2">
        <div className="glass panel-card">
          <div className="panel-header">
            <div className="panel-title">
              <div className="panel-title-icon" style={{ background: 'rgba(45,212,191,0.12)', color: 'var(--brand-indigo)' }}>
                <ShieldAlert size={18} />
              </div>
              الفرز الذكي (Smart Triage)
            </div>
            <span className="badge" style={{ background: 'rgba(45,212,191,0.12)', color: 'var(--brand-indigo)' }}>
              مرتب حسب الخطورة
            </span>
          </div>

          <div className="student-list">
            {safeStudents.map((s) => (
              <div key={s.id} className="student-item">
                <div className={`risk-dot ${s.riskLevel}`} />
                <div style={{ minWidth: '100px' }}>
                  <div className="student-name">{s.name}</div>
                  <div className="student-meta">{s.id} | المعدل: {s.gpa} | الخطورة: {s.riskScore}%</div>
                </div>
                <div className="student-issue">{s.primaryReason}</div>
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  {s.riskLevel === 'red' && (
                    <button className="btn btn-danger" style={{ fontSize: '0.78rem' }} onClick={() => onIntervention(s)}>
                      <Mail size={14} /> خطة تدخل
                    </button>
                  )}
                  {s.riskLevel === 'yellow' && !isSupervisor && (
                    <button className="btn btn-ghost" style={{ fontSize: '0.78rem' }} onClick={() => handlePeerMatch(s)} disabled={Boolean(matchingById?.[s?.id])}>
                      <Users size={14} /> {matchingById?.[s?.id] ? 'جاري البحث...' : 'توأمة'}
                    </button>
                  )}
                  {(s.riskLevel === 'yellow' || s.riskLevel === 'red') && isSupervisor && (
                    <button className="btn btn-danger" style={{ fontSize: '0.78rem' }} onClick={() => handleEscalation(s)}>
                      <ShieldAlert size={14} /> تصعيد الحالة
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass panel-card">
          <div className="panel-header">
            <div className="panel-title">
              <div className="panel-title-icon" style={{ background: 'rgba(45,212,191,0.12)', color: 'var(--brand-cyan)' }}>
                <Sparkles size={18} />
              </div>
              توصيات Copilot
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <AiInsightCard color="var(--brand-indigo)" icon={<BrainCircuit size={16} />}
              title="توجيه تكيفي"
              body={`تم رصد ${safeStudents.filter(s => s.taskTimeRatio > 2).length} طلاب يستغرقون وقتاً مضاعفاً في المهام.`} />
            <AiInsightCard color="var(--brand-amber)" icon={<TrendingUp size={16} />}
              title="رادار المناهج"
              body={`المواد عالية الخطورة مرتبطة بضعف الإكمال وارتفاع نسب الغياب.`} />
            <AiInsightCard color="var(--brand-emerald)" icon={<Zap size={16} />}
              title="بوصلة سوق العمل"
              body={`${safeStudents.filter(s => s.gpa >= 3.5).length} طلاب جاهزون لمسارات مهنية متقدمة.`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentsTab({ students, onIntervention, onBrief, searchSignal }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (!searchSignal) return;
    searchInputRef.current?.focus?.();
  }, [searchSignal]);

  const safeStudents = Array.isArray(students) ? students : [];

  const filtered = safeStudents.filter((s) => {
    if (filter !== 'all' && s.riskLevel !== filter) return false;
    if (search && !s.name?.includes(search) && !s.id?.includes(search)) return false;
    return true;
  });

  const counts = {
    all: safeStudents.length,
    red: safeStudents.filter((s) => s.riskLevel === 'red').length,
    yellow: safeStudents.filter((s) => s.riskLevel === 'yellow').length,
    green: safeStudents.filter((s) => s.riskLevel === 'green').length,
  };

  return (
    <div className="animate-fade-up">
      <div className="glass panel-card">
        <div className="panel-header">
          <div className="panel-title">
            <div className="panel-title-icon" style={{ background: 'rgba(45,212,191,0.12)', color: 'var(--brand-indigo)' }}>
              <Users size={18} />
            </div>
            جميع الطلاب
          </div>
          <span className="badge" style={{ background: 'rgba(45,212,191,0.12)', color: 'var(--brand-indigo)' }}>{filtered.length} طالب</span>
        </div>

        <div className="filter-bar">
          <div className="search-input-wrap">
            <Search size={14} />
            <input ref={searchInputRef} type="text" placeholder="ابحث بالاسم أو الرقم..." value={search} onChange={(e) => setSearch(e.target.value)} className="search-input" />
          </div>
          <div className="filter-chips">
            {[
              { key: 'all', label: 'الكل', count: counts.all },
              { key: 'red', label: '🔴 خطر', count: counts.red },
              { key: 'yellow', label: '🟡 تحذير', count: counts.yellow },
              { key: 'green', label: '🟢 سليم', count: counts.green },
            ].map((f) => (
              <button key={f.key} className={`filter-chip ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>
                {f.label} ({f.count})
              </button>
            ))}
          </div>
        </div>

        <div className="students-detail-list">
          {filtered.map((s) => (
            <div key={s.id} className="student-detail-card">
              <div className="student-detail-header">
                <div className={`risk-dot ${s.riskLevel}`} />
                <div className="student-detail-info">
                  <span className="student-name">{s.name}</span>
                  <span className="student-meta">{s.id} | {s.major} | السنة {s.year}</span>
                </div>
                <div className="student-detail-score" style={{ color: s.riskLevel === 'red' ? '#fda4af' : s.riskLevel === 'yellow' ? '#fbbf24' : '#6ee7b7' }}>
                  {s.riskScore}%
                </div>
              </div>
              <div className="student-detail-body">
                <div className="detail-stat-row">
                  <span>المعدل: <strong>{s.gpa}</strong></span>
                  <span>الحضور: <strong>{s.attendance}%</strong></span>
                  <span>إكمال المهام: <strong>{s.taskCompletion}%</strong></span>
                </div>
                <p className="student-detail-reason"><Sparkles size={12} /> {s.primaryReason}</p>
                {s?.factors?.length > 0 && (
                  <div className="detail-factors">
                    {s?.factors?.map((f, i) => (
                      <span key={i} className="detail-factor-tag">• {f}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="student-detail-actions">
                {s.riskLevel !== 'green' && (
                  <button className="btn btn-danger" style={{ fontSize: '0.78rem' }} onClick={() => onIntervention(s)}>
                    <Mail size={14} /> خطة تدخل
                  </button>
                )}
                <button className="btn btn-ghost" style={{ fontSize: '0.78rem', color: '#2dd4bf', borderColor: 'rgba(45,212,191,0.3)' }} onClick={() => onBrief(s.id)}>
                  <Bot size={14} /> ملخص AI
                </button>
                <button className="btn btn-ghost" style={{ fontSize: '0.78rem' }} onClick={() => onBrief(s.id)}>
                  <Eye size={14} /> عرض الملف
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InterventionsTab({ interventionLog }) {
  const safeLog = Array.isArray(interventionLog) ? interventionLog : [];
  const statusMap = {
    sent: { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', label: 'تم الإرسال', Icon: Mail },
    meeting: { color: '#2dd4bf', bg: 'rgba(45,212,191,0.1)', label: 'لقاء', Icon: Users },
    completed: { color: '#6ee7b7', bg: 'rgba(110,231,183,0.1)', label: 'مكتمل', Icon: CheckCircle2 },
    followup: { color: '#22D3EE', bg: 'rgba(45,212,191,0.1)', label: 'متابعة', Icon: Clock },
  };

  return (
    <div className="animate-fade-up">
      <div className="glass panel-card">
        <div className="panel-header">
          <div className="panel-title">
            <div className="panel-title-icon" style={{ background: 'rgba(253,164,175,0.12)', color: '#fda4af' }}>
              <FileText size={18} />
            </div>
            سجل التدخلات
          </div>
          <span className="badge" style={{ background: 'rgba(110,231,183,0.12)', color: '#6ee7b7' }}>
            {safeLog.filter((i) => i.status === 'completed').length} مكتمل
          </span>
        </div>

        <div className="interventions-list">
          {safeLog.map((item) => {
            const st = statusMap[item.status] || statusMap.sent;
            const SIcon = st.Icon;
            return (
              <div key={item.id} className="intervention-log-item">
                <div className="intervention-log-icon" style={{ background: st.bg, color: st.color }}>
                  <SIcon size={16} />
                </div>
                <div className="intervention-log-info">
                  <span className="intervention-log-student">{item.student}</span>
                  <span className="intervention-log-meta">{item.type} — {item.date}</span>
                </div>
                <div className="intervention-log-status" style={{ color: st.color, background: st.bg }}>
                  {st.label}
                </div>
                <span className="intervention-log-result">{item.result}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RadarTab({ courses }) {
  const severityColor = {
    red: '#fda4af',
    yellow: '#fbbf24',
    green: '#6ee7b7'
  };
  const severityLabel = {
    red: 'خطر',
    yellow: 'تحذير',
    green: 'سليم'
  };

  const safeCourses = Array.isArray(courses) ? courses : [];
  const maxRate = Math.max(...safeCourses.map(c => c.fail_rate), 1);

  // ملخص إحصائي
  const redCount = safeCourses.filter(c => c.severity === 'red').length;
  const yellowCount = safeCourses.filter(c => c.severity === 'yellow').length;
  const greenCount = safeCourses.filter(c => c.severity === 'green').length;
  const avgFailRate = safeCourses.length > 0 ? Math.round(safeCourses.reduce((sum, c) => sum + c.fail_rate, 0) / safeCourses.length) : 0;

  return (
    <div className="animate-fade-up delay-2" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ═══ ملخص سريع ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
        <div className="glass" style={{ padding: '1rem 1.2rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fda4af' }}>{redCount}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>مقررات عالية الخطورة</div>
        </div>
        <div className="glass" style={{ padding: '1rem 1.2rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24' }}>{yellowCount}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>مقررات تحت المراقبة</div>
        </div>
        <div className="glass" style={{ padding: '1rem 1.2rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#6ee7b7' }}>{greenCount}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>مقررات مستقرة</div>
        </div>
        <div className="glass" style={{ padding: '1rem 1.2rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--brand-cyan)' }}>{avgFailRate}%</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>متوسط نسبة الرسوب</div>
        </div>
      </div>

      {/* ═══ الرسم البياني المرتب ═══ */}
      <div className="glass panel-card">
        <div className="panel-header" style={{ marginBottom: '1.2rem' }}>
          <div className="panel-title">
            <div className="panel-title-icon" style={{ background: 'rgba(251,191,36,0.12)', color: 'var(--brand-amber)' }}>
              <TrendingUp size={18} />
            </div>
            نسب الرسوب حسب المقرر
          </div>
          <span className="badge" style={{ background: 'rgba(251,191,36,0.12)', color: 'var(--brand-amber)' }}>مُرشح بالذكاء الاصطناعي</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {safeCourses
            .slice()
            .sort((a, b) => b.fail_rate - a.fail_rate)
            .map((c) => {
              const barWidth = (c.fail_rate / maxRate) * 100;
              return (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  {/* اسم المقرر */}
                  <div style={{ minWidth: '110px', textAlign: 'start', flexShrink: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: severityColor[c.severity] }}>{c.code}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{c.name}</div>
                  </div>
                  {/* شريط النسبة */}
                  <div style={{ flex: 1, position: 'relative' }}>
                    <div style={{
                      width: '100%',
                      height: '28px',
                      background: 'rgba(255,255,255,0.04)',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      position: 'relative',
                    }}>
                      <div style={{
                        width: `${barWidth}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, ${severityColor[c.severity]}22, ${severityColor[c.severity]}88)`,
                        borderRadius: '6px',
                        transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                        position: 'relative',
                      }}>
                        <div style={{
                          position: 'absolute',
                          left: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontSize: '0.72rem',
                          color: 'var(--text-muted)',
                          whiteSpace: 'nowrap',
                        }}>
                          {c.instructor} • {c.enroll_count} طالب
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* النسبة */}
                  <div style={{
                    minWidth: '52px',
                    textAlign: 'center',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    color: severityColor[c.severity],
                  }}>
                    {c.fail_rate}%
                  </div>
                  {/* حالة */}
                  <div style={{
                    minWidth: '60px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '0.25rem 0.5rem',
                    borderRadius: '20px',
                    textAlign: 'center',
                    background: `${severityColor[c.severity]}15`,
                    color: severityColor[c.severity],
                    border: `1px solid ${severityColor[c.severity]}30`,
                  }}>
                    {severityLabel[c.severity]}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* ═══ تفاصيل المقررات ═══ */}
      <div className="glass panel-card">
        <div className="panel-header" style={{ marginBottom: '0.75rem' }}>
          <div className="panel-title">
            <div className="panel-title-icon" style={{ background: 'rgba(253,164,175,0.12)', color: '#fda4af' }}>
              <AlertTriangle size={18} />
            </div>
            تحليل تفصيلي للمقررات
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {safeCourses.map((c) => (
            <div key={c.id} style={{
              padding: '1rem 1.2rem',
              borderRadius: 'var(--radius-md)',
              background: `${severityColor[c.severity]}06`,
              border: `1px solid ${severityColor[c.severity]}18`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div className={`risk-dot ${c.severity}`} />
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: severityColor[c.severity] }}>{c.code}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{c.name}</span>
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>👨‍🏫 {c.instructor} — {c.enroll_count} طالب</span>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.82rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                <span>نسبة الرسوب: <strong style={{ color: severityColor[c.severity] }}>{c.fail_rate}%</strong></span>
                <span>المعدل العام: <strong style={{ color: c.avg_grade >= 3.5 ? '#6ee7b7' : c.avg_grade >= 2.5 ? '#fbbf24' : '#fda4af' }}>{c.avg_grade}</strong></span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <AlertTriangle size={12} style={{ color: severityColor[c.severity], flexShrink: 0 }} />
                  <span>المقرر في مستوى إنذار «{severityLabel[c.severity]}» ويحتاج متابعة أكاديمية.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <Sparkles size={12} style={{ color: '#2dd4bf', flexShrink: 0 }} />
                  <span>توصية: تعزيز المحتوى التطبيقي والتقييم التكويني التدريجي.</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdvisorDashboard({ activeTab, onIntervention, onToast, searchSignal = 0 }) {
  const { user } = useUser();
  const { dashboardData: data, loading, error, refreshDashboard, triggerPeerMatch, matchLoading } = useRased();
  const [briefStudentId, setBriefStudentId] = useState(null);
  const isSupervisor = user?.title?.includes('مشرفة') || user?.department?.includes('الطالبات');

  if (error) {
    return (
      <div className="glass panel-card" style={{ color: '#fda4af', padding: '2rem', textAlign: 'center' }}>
        <AlertTriangle size={30} style={{ margin: '0 auto 1rem' }} />
        {error}
        <button className="btn btn-ghost" style={{ marginTop: '1rem', width: 'auto' }} onClick={refreshDashboard}>حاول مجدداً</button>
      </div>
    );
  }

  if (loading || !data?.overview) {
    return (
      <div className="glass panel-card" style={{ padding: '2rem' }}>
        <LoadingSkeleton lines={4} style={{ marginBottom: '2rem' }} />
        <LoadingSkeleton lines={3} />
      </div>
    );
  }

  const { overview, interventions } = data;
  const { students, stats, courses } = overview;

  const handlePeerMatch = async (requesterId, weakSkill) => {
    try {
      return await triggerPeerMatch(requesterId, weakSkill);
    } catch (err) {
      console.error('Peer match workflow failed:', err);
      return { ok: false, message: 'تعذرت محاولة التوأمة حالياً.' };
    }
  };

  if (loading || !stats) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="stats-row animate-fade-up">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass stat-card" style={{ minHeight: '100px' }}>
              <LoadingSkeleton lines={2} />
            </div>
          ))}
        </div>
        <div className="glass panel-card animate-fade-up delay-2" style={{ minHeight: '300px' }}>
          <LoadingSkeleton lines={5} />
        </div>
      </div>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'students':
        return <StudentsTab students={students} onIntervention={onIntervention} onBrief={(id) => setBriefStudentId(id)} searchSignal={searchSignal} />;
      case 'interventions':
        return <InterventionsTab interventionLog={interventions || []} />;
      case 'radar':
        return <RadarTab courses={courses || []} />;
      default:
        return (
          <DashboardTab
            students={students}
            stats={stats}
            onIntervention={onIntervention}
            onToast={onToast}
            onPeerMatch={handlePeerMatch}
            matchingById={matchLoading}
            isSupervisor={isSupervisor}
          />
        );
    }
  };

  return (
    <>
      {renderTab()}
      {briefStudentId && (
        <BriefModal
          key={briefStudentId}
          studentId={briefStudentId}
          onClose={() => setBriefStudentId(null)}
        />
      )}
    </>
  );
}
