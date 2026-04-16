/**
 * AdvisorDashboard.jsx — لوحة المرشد الأكاديمي الكاملة
 * 
 * تدعم 4 تبويبات:
 *   1. dashboard  — لوحة القيادة الرئيسية (Smart Triage + Copilot)
 *   2. students   — قائمة الطلاب الكاملة مع فلاتر
 *   3. interventions — سجل التدخلات
 *   4. radar      — رادار المناهج
 */

import { useState, useEffect } from 'react';
import {
  Users, ShieldAlert, Zap, TrendingUp, GraduationCap,
  BrainCircuit, Mail, Sparkles, ArrowUpRight, BookOpen,
  AlertTriangle, CheckCircle2, Clock, Search, Filter,
  FileText, BarChart3, Target, Eye,
} from 'lucide-react';
import { analyzeAllStudents, getAdvisorStats } from '../services/mockEngine';

// ─── Loading Skeleton ──────────────────────────────────────────────────────────

function LoadingSkeleton({ lines = 3, style }) {
  return (
    <div className="loading-skeleton" style={style}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton-line" style={{ width: `${85 - i * 15}%`, animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────

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

// ─── AI Insight Card ───────────────────────────────────────────────────────────

function AiInsightCard({ color, icon, title, body }) {
  return (
    <div className="ai-card" style={{ background: `${color}08`, borderColor: `${color}22` }}>
      <div className="ai-card-title" style={{ color }}>{icon}<span>{title}</span></div>
      <p className="ai-card-body">{body}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TAB 1: لوحة القيادة (Dashboard)
// ═══════════════════════════════════════════════════════════════════════════════

function DashboardTab({ students, stats, onIntervention, onToast }) {
  const handlePeerMatch = (student) => {
    onToast(`تم إرسال طلب توأمة أكاديمية لـ ${student.name}`, 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* الإحصاءات */}
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
        {/* قائمة الطلاب */}
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

// ═══════════════════════════════════════════════════════════════════════════════
//  TAB 2: الطلاب (Students List)
// ═══════════════════════════════════════════════════════════════════════════════

function StudentsTab({ students, onIntervention }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = students.filter(s => {
    if (filter !== 'all' && s.riskLevel !== filter) return false;
    if (search && !s.name.includes(search) && !s.id.includes(search)) return false;
    return true;
  });

  const counts = {
    all: students.length,
    red: students.filter(s => s.riskLevel === 'red').length,
    yellow: students.filter(s => s.riskLevel === 'yellow').length,
    green: students.filter(s => s.riskLevel === 'green').length,
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
          <span className="badge" style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--brand-indigo)' }}>
            {filtered.length} طالب
          </span>
        </div>

        {/* فلاتر + بحث */}
        <div className="filter-bar">
          <div className="search-input-wrap">
            <Search size={14} />
            <input
              type="text"
              placeholder="ابحث بالاسم أو الرقم..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-chips">
            {[
              { key: 'all', label: 'الكل', count: counts.all },
              { key: 'red', label: '🔴 خطر', count: counts.red },
              { key: 'yellow', label: '🟡 تحذير', count: counts.yellow },
              { key: 'green', label: '🟢 سليم', count: counts.green },
            ].map(f => (
              <button
                key={f.key}
                className={`filter-chip ${filter === f.key ? 'active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label} ({f.count})
              </button>
            ))}
          </div>
        </div>

        {/* قائمة الطلاب التفصيلية */}
        <div className="students-detail-list">
          {filtered.map(s => (
            <div key={s.id} className="student-detail-card">
              <div className="student-detail-header">
                <div className={`risk-dot ${s.riskLevel}`} />
                <div className="student-detail-info">
                  <span className="student-name">{s.name}</span>
                  <span className="student-meta">{s.id} | {s.major} | السنة {s.year}</span>
                </div>
                <div className="student-detail-score" style={{
                  color: s.riskLevel === 'red' ? '#F43F5E' : s.riskLevel === 'yellow' ? '#F59E0B' : '#10B981'
                }}>
                  {s.riskScore}%
                </div>
              </div>
              <div className="student-detail-body">
                <div className="detail-stat-row">
                  <span>المعدل: <strong>{s.gpa}</strong></span>
                  <span>الحضور: <strong>{s.attendance}%</strong></span>
                  <span>إكمال المهام: <strong>{s.taskCompletion}%</strong></span>
                </div>
                <p className="student-detail-reason">
                  <Sparkles size={12} /> {s.primaryReason}
                </p>
                {s.factors.length > 0 && (
                  <div className="detail-factors">
                    {s.factors.map((f, i) => (
                      <span key={i} className="detail-factor-tag">• {f}</span>
                    ))}
                  </div>
                )}
              </div>
              {s.riskLevel !== 'green' && (
                <div className="student-detail-actions">
                  <button className="btn btn-danger" style={{ fontSize: '0.78rem' }}
                    onClick={() => onIntervention(s)}>
                    <Mail size={14} /> خطة تدخل
                  </button>
                  <button className="btn btn-ghost" style={{ fontSize: '0.78rem' }}>
                    <Eye size={14} /> عرض الملف
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TAB 3: التدخلات (Interventions Log)
// ═══════════════════════════════════════════════════════════════════════════════

function InterventionsTab() {
  const interventionLog = [
    { id: 1, student: 'أحمد محمود', date: '14 أبريل 2026', status: 'sent', type: 'بريد + لقاء', result: 'في انتظار الرد' },
    { id: 2, student: 'نورة سعد', date: '12 أبريل 2026', status: 'meeting', type: 'لقاء شخصي', result: 'تم (تحسن 15%)' },
    { id: 3, student: 'منى صالح', date: '10 أبريل 2026', status: 'completed', type: 'خطة أسبوعية', result: 'مكتمل — رُفع المعدل' },
    { id: 4, student: 'خالد ناصر', date: '8 أبريل 2026', status: 'completed', type: 'توأمة أكاديمية', result: 'مكتمل — تحسن ملحوظ' },
    { id: 5, student: 'ريم عبدالعزيز', date: '5 أبريل 2026', status: 'followup', type: 'إحالة نفسية', result: 'متابعة مستمرة' },
  ];

  const statusMap = {
    sent:      { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', label: 'تم الإرسال', Icon: Mail },
    meeting:   { color: '#818CF8', bg: 'rgba(129,140,248,0.1)', label: 'لقاء', Icon: Users },
    completed: { color: '#10B981', bg: 'rgba(16,185,129,0.1)', label: 'مكتمل', Icon: CheckCircle2 },
    followup:  { color: '#22D3EE', bg: 'rgba(34,211,238,0.1)', label: 'متابعة', Icon: Clock },
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
            {interventionLog.filter(i => i.status === 'completed').length} مكتمل
          </span>
        </div>

        <div className="interventions-list">
          {interventionLog.map(item => {
            const st = statusMap[item.status];
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

// ═══════════════════════════════════════════════════════════════════════════════
//  TAB 4: رادار المناهج (Curriculum Radar)
// ═══════════════════════════════════════════════════════════════════════════════

function RadarTab({ students }) {
  const courses = [
    {
      id: 1, code: 'CS301', name: 'هياكل البيانات', instructor: 'د. أحمد العمري',
      failRate: 62, avgGrade: 'C', enrollCount: 45,
      issue: 'نسبة رسوب عالية جداً — 62% من الطلاب فشلوا في الاختبار النصفي',
      suggestion: 'مراجعة أسلوب التدريس وإضافة محتوى بصري تفاعلي',
      severity: 'red',
    },
    {
      id: 2, code: 'PHYS201', name: 'الفيزياء العامة 2', instructor: 'د. سارة المطيري',
      failRate: 38, avgGrade: 'C+', enrollCount: 60,
      issue: 'الطلاب يقضون 3x الوقت المتوقع في الفصل الثالث',
      suggestion: 'تقسيم الفصل الثالث إلى وحدات أصغر مع اختبارات تكوينية',
      severity: 'yellow',
    },
    {
      id: 3, code: 'STAT101', name: 'الإحصاء التطبيقي', instructor: 'د. خالد الشهري',
      failRate: 15, avgGrade: 'B+', enrollCount: 80,
      issue: 'لا توجد مشاكل جوهرية',
      suggestion: 'استمرار النمط الحالي مع إضافة مشاريع تطبيقية',
      severity: 'green',
    },
  ];

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
            {courses.filter(c => c.severity === 'red').length} مقرر يحتاج تدخل
          </span>
        </div>

        <div className="radar-courses">
          {courses.map(c => (
            <div key={c.id} className="radar-course-card" style={{ borderColor: `${severityColor[c.severity]}22` }}>
              <div className="radar-course-header">
                <div>
                  <span className="radar-course-code" style={{ color: severityColor[c.severity] }}>{c.code}</span>
                  <span className="radar-course-name">{c.name}</span>
                </div>
                <div className={`risk-dot ${c.severity}`} />
              </div>
              <p className="radar-course-instructor">👨‍🏫 {c.instructor} — {c.enrollCount} طالب مسجل</p>

              <div className="radar-metrics">
                <div className="radar-metric">
                  <span className="radar-metric-label">نسبة الرسوب</span>
                  <div className="progress-track">
                    <div className="progress-fill" style={{
                      width: `${c.failRate}%`,
                      background: `linear-gradient(90deg, ${severityColor[c.severity]}, ${severityColor[c.severity]}88)`
                    }} />
                  </div>
                  <span style={{ color: severityColor[c.severity], fontWeight: 700, fontSize: '0.82rem' }}>{c.failRate}%</span>
                </div>
                <span className="radar-metric-grade">المعدل: <strong>{c.avgGrade}</strong></span>
              </div>

              <div className="radar-issue">
                <AlertTriangle size={13} style={{ color: severityColor[c.severity], flexShrink: 0 }} />
                <span>{c.issue}</span>
              </div>
              <div className="radar-suggestion">
                <Sparkles size={13} style={{ color: '#818CF8', flexShrink: 0 }} />
                <span>{c.suggestion}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export default function AdvisorDashboard({ activeTab, onIntervention, onToast }) {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);

  // محاكاة تحميل البيانات من API
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setStudents(analyzeAllStudents());
      setStats(getAdvisorStats());
      setLoading(false);
    }, 600); // 600ms يكفي لإعطاء إحساس بالتحميل
    return () => clearTimeout(timer);
  }, [activeTab]);

  if (loading || !stats) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="stats-row animate-fade-up">
          {[1, 2, 3].map(i => (
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

  switch (activeTab) {
    case 'students':
      return <StudentsTab students={students} onIntervention={onIntervention} />;
    case 'interventions':
      return <InterventionsTab />;
    case 'radar':
      return <RadarTab students={students} />;
    default:
      return <DashboardTab students={students} stats={stats} onIntervention={onIntervention} onToast={onToast} />;
  }
}
