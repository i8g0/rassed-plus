import { useEffect, useState } from 'react';
import {
  Users, ShieldAlert, Zap, TrendingUp, GraduationCap,
  BrainCircuit, Mail, Sparkles, ArrowUpRight,
  AlertTriangle, CheckCircle2, Clock, Search,
  FileText, BarChart3, Eye, Bot, X,
} from 'lucide-react';
import { getAdvisorOverview, getInterventions, requestPeerMatch, getStudentBrief } from '../services/api';

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
    setLoading(true);
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
            {/* الحالة النفسية */}
            <div className="brief-section">
              <div className="brief-section-title">🧠 الحالة النفسية</div>
              <p>{brief.emotional_state}</p>
              <div style={{ marginTop: '0.5rem' }}>
                <span className={`brief-urgency ${brief.urgency}`}>
                  ⚡ أولوية: {urgencyLabels[brief.urgency] || brief.urgency}
                </span>
              </div>
            </div>

            {/* ملخص المحادثات */}
            <div className="brief-section">
              <div className="brief-section-title">💬 ملخص المحادثات ({brief.total_messages} رسالة)</div>
              <p>{brief.conversation_summary}</p>
            </div>

            {/* المخاوف الرئيسية */}
            {brief.main_concerns?.length > 0 && (
              <div className="brief-section">
                <div className="brief-section-title">⚠️ المخاوف الرئيسية</div>
                <ul>
                  {brief.main_concerns.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}

            {/* المواضيع */}
            {brief.topics_discussed?.length > 0 && (
              <div className="brief-section">
                <div className="brief-section-title">📋 المواضيع المطروحة</div>
                <ul>
                  {brief.topics_discussed.map((t, i) => (
                    <li key={i}>{t.topic || t} {t.frequency ? `(${t.frequency} مرات)` : ''}</li>
                  ))}
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

function DashboardTab({ students, stats, onIntervention, onToast, onPeerMatch }) {
  const handlePeerMatch = async (student) => {
    const weakSkill = student.weakSkills?.[0] || 'هياكل بيانات';
    try {
      const result = await onPeerMatch(student.id, weakSkill);
      onToast(result.message || `تم إرسال طلب توأمة أكاديمية لـ ${student.name}`, 'info');
    } catch {
      onToast('تعذرت عملية التوأمة من الخادم', 'warning');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="stats-row animate-fade-up">
        <StatCard icon={<Users size={24} />} label="إجمالي الطلاب" value={stats.totalStudents.toLocaleString()}
          trend="محدث مباشرة" trendColor="var(--brand-emerald)"
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

      <div className="dashboard-grid animate-fade-up delay-2">
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
                <div className="student-issue">{s.primaryReason}</div>
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  {s.riskLevel === 'red' && (
                    <button className="btn btn-danger" style={{ fontSize: '0.78rem' }} onClick={() => onIntervention(s)}>
                      <Mail size={14} /> خطة تدخل
                    </button>
                  )}
                  {s.riskLevel === 'yellow' && (
                    <button className="btn btn-ghost" style={{ fontSize: '0.78rem' }} onClick={() => handlePeerMatch(s)}>
                      <Users size={14} /> توأمة
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
              <div className="panel-title-icon" style={{ background: 'rgba(34,211,238,0.12)', color: 'var(--brand-cyan)' }}>
                <Sparkles size={18} />
              </div>
              توصيات Copilot
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <AiInsightCard color="var(--brand-indigo)" icon={<BrainCircuit size={16} />}
              title="توجيه تكيفي"
              body={`تم رصد ${students.filter(s => s.taskTimeRatio > 2).length} طلاب يستغرقون وقتاً مضاعفاً في المهام.`} />
            <AiInsightCard color="var(--brand-amber)" icon={<TrendingUp size={16} />}
              title="رادار المناهج"
              body={`المواد عالية الخطورة مرتبطة بضعف الإكمال وارتفاع نسب الغياب.`} />
            <AiInsightCard color="var(--brand-emerald)" icon={<Zap size={16} />}
              title="بوصلة سوق العمل"
              body={`${students.filter(s => s.gpa >= 3.5).length} طلاب جاهزون لمسارات مهنية متقدمة.`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentsTab({ students, onIntervention, onBrief }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = students.filter((s) => {
    if (filter !== 'all' && s.riskLevel !== filter) return false;
    if (search && !s.name.includes(search) && !s.id.includes(search)) return false;
    return true;
  });

  const counts = {
    all: students.length,
    red: students.filter((s) => s.riskLevel === 'red').length,
    yellow: students.filter((s) => s.riskLevel === 'yellow').length,
    green: students.filter((s) => s.riskLevel === 'green').length,
  };

  return (
    <div className="animate-fade-up">
      <div className="glass panel-card">
        <div className="panel-header">
          <div className="panel-title">
            <div className="panel-title-icon" style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--brand-indigo)' }}>
              <Users size={18} />
            </div>
            جميع الطلاب
          </div>
          <span className="badge" style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--brand-indigo)' }}>{filtered.length} طالب</span>
        </div>

        <div className="filter-bar">
          <div className="search-input-wrap">
            <Search size={14} />
            <input type="text" placeholder="ابحث بالاسم أو الرقم..." value={search} onChange={(e) => setSearch(e.target.value)} className="search-input" />
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
                <div className="student-detail-score" style={{ color: s.riskLevel === 'red' ? '#F43F5E' : s.riskLevel === 'yellow' ? '#F59E0B' : '#10B981' }}>
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
                {s.factors.length > 0 && (
                  <div className="detail-factors">
                    {s.factors.map((f, i) => (
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
                <button className="btn btn-ghost" style={{ fontSize: '0.78rem', color: '#818CF8', borderColor: 'rgba(99,102,241,0.3)' }} onClick={() => onBrief(s.id)}>
                  <Bot size={14} /> ملخص AI
                </button>
                <button className="btn btn-ghost" style={{ fontSize: '0.78rem' }}>
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
  const statusMap = {
    sent: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', label: 'تم الإرسال', Icon: Mail },
    meeting: { color: '#818CF8', bg: 'rgba(129,140,248,0.1)', label: 'لقاء', Icon: Users },
    completed: { color: '#10B981', bg: 'rgba(16,185,129,0.1)', label: 'مكتمل', Icon: CheckCircle2 },
    followup: { color: '#22D3EE', bg: 'rgba(34,211,238,0.1)', label: 'متابعة', Icon: Clock },
  };

  return (
    <div className="animate-fade-up">
      <div className="glass panel-card">
        <div className="panel-header">
          <div className="panel-title">
            <div className="panel-title-icon" style={{ background: 'rgba(244,63,94,0.12)', color: '#F43F5E' }}>
              <FileText size={18} />
            </div>
            سجل التدخلات
          </div>
          <span className="badge" style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981' }}>
            {interventionLog.filter((i) => i.status === 'completed').length} مكتمل
          </span>
        </div>

        <div className="interventions-list">
          {interventionLog.map((item) => {
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
  const severityColor = { red: '#F43F5E', yellow: '#F59E0B', green: '#10B981' };

  return (
    <div className="animate-fade-up">
      <div className="glass panel-card">
        <div className="panel-header">
          <div className="panel-title">
            <div className="panel-title-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}>
              <BarChart3 size={18} />
            </div>
            رادار المناهج
          </div>
          <span className="badge" style={{ background: 'rgba(244,63,94,0.12)', color: '#F43F5E' }}>
            {courses.filter((c) => c.severity === 'red').length} مقرر يحتاج تدخل
          </span>
        </div>

        <div className="radar-courses">
          {courses.map((c) => (
            <div key={c.id} className="radar-course-card" style={{ borderColor: `${severityColor[c.severity]}22` }}>
              <div className="radar-course-header">
                <div>
                  <span className="radar-course-code" style={{ color: severityColor[c.severity] }}>{c.code}</span>
                  <span className="radar-course-name">{c.name}</span>
                </div>
                <div className={`risk-dot ${c.severity}`} />
              </div>
              <p className="radar-course-instructor">👨‍🏫 {c.instructor} — {c.enroll_count} طالب مسجل</p>

              <div className="radar-metrics">
                <div className="radar-metric">
                  <span className="radar-metric-label">نسبة الرسوب</span>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${c.fail_rate}%`, background: `linear-gradient(90deg, ${severityColor[c.severity]}, ${severityColor[c.severity]}88)` }} />
                  </div>
                  <span style={{ color: severityColor[c.severity], fontWeight: 700, fontSize: '0.82rem' }}>{c.fail_rate}%</span>
                </div>
                <span className="radar-metric-grade">المعدل: <strong>{c.avg_grade}</strong></span>
              </div>

              <div className="radar-issue">
                <AlertTriangle size={13} style={{ color: severityColor[c.severity], flexShrink: 0 }} />
                <span>المقرر {c.code} في مستوى إنذار {c.severity} ويحتاج متابعة أكاديمية.</span>
              </div>
              <div className="radar-suggestion">
                <Sparkles size={13} style={{ color: '#818CF8', flexShrink: 0 }} />
                <span>توصية: تعزيز المحتوى التطبيقي والتقييم التكويني التدريجي.</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdvisorDashboard({ activeTab, onIntervention, onToast }) {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [interventionLog, setInterventionLog] = useState([]);
  const [briefStudentId, setBriefStudentId] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([getAdvisorOverview(), getInterventions()])
      .then(([overview, interventions]) => {
        if (!mounted) return;
        setStudents(overview.students || []);
        setStats(overview.stats || null);
        setCourses(overview.courses || []);
        setInterventionLog(interventions || []);
      })
      .catch(() => {
        if (mounted) onToast?.('تعذر تحميل بيانات لوحة المرشد', 'warning');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [activeTab, onToast]);

  const handlePeerMatch = (requesterId, weakSkill) => requestPeerMatch(requesterId, weakSkill);

  if (loading || !stats) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
        return <StudentsTab students={students} onIntervention={onIntervention} onBrief={(id) => setBriefStudentId(id)} />;
      case 'interventions':
        return <InterventionsTab interventionLog={interventionLog} />;
      case 'radar':
        return <RadarTab courses={courses} />;
      default:
        return (
          <DashboardTab
            students={students}
            stats={stats}
            onIntervention={onIntervention}
            onToast={onToast}
            onPeerMatch={handlePeerMatch}
          />
        );
    }
  };

  return (
    <>
      {renderTab()}
      {briefStudentId && (
        <BriefModal
          studentId={briefStudentId}
          onClose={() => setBriefStudentId(null)}
        />
      )}
    </>
  );
}
