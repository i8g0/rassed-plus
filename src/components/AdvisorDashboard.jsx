import { useEffect, useRef, useState } from 'react';
import {
  Users, ShieldAlert, Zap, TrendingUp, GraduationCap,
  BrainCircuit, Mail, Sparkles, ArrowUpRight,
  AlertTriangle, CheckCircle2, Clock, Search,
  Bot, Eye, FileText, Radar, Compass, Network,
} from 'lucide-react';
import { getStudentBrief } from '../services/api';
import {
  buildCollectiveDisengagementCommand,
  generateDisengagementReport,
  buildMotivationPulseMessage,
  detectDisengagementRadar,
} from '../services/aiService';
import { useRased } from '../contexts/RasedContext';
import { useUser } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageProvider';

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
      <div className="ai-card-body">{body}</div>
    </div>
  );
}

// ─── AI Brief Modal ─────────────────────────────────────────────────────────

function BriefModal({ studentId, onClose }) {
  const { t } = useLanguage();
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentBrief(studentId)
      .then((data) => setBrief(data))
      .catch(() => setBrief(null))
      .finally(() => setLoading(false));
  }, [studentId]);

  const urgencyLabels = { high: t('advisor.urgencyHigh'), medium: t('advisor.urgencyMedium'), low: t('advisor.urgencyLow') };

  return (
    <div className="brief-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="brief-modal">
        <h2><BrainCircuit size={20} /> {t('advisor.briefTitle')} {brief?.student_name ? `— ${brief.student_name}` : ''}</h2>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Sparkles size={24} style={{ animation: 'float 2s ease-in-out infinite', marginBottom: '0.5rem' }} />
            <p>{t('advisor.loadingBrief')}</p>
          </div>
        ) : !brief ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>{t('advisor.loadBriefFailed')}</p>
        ) : (
          <>
            {/* تحليل مخرجات التعلم */}
            <div className="brief-section">
              <div className="brief-section-title">📊 {t('advisor.cloAnalysis')}</div>
              <p>{brief.clo_analysis}</p>
              <div style={{ marginTop: '0.5rem' }}>
                <span className={`brief-urgency ${brief.urgency}`}>
                  ⚡ {t('advisor.urgency')}: {urgencyLabels[brief.urgency] || brief.urgency}
                </span>
              </div>
            </div>

            {/* الفجوات المعرفية */}
            {brief.prerequisite_gaps?.length > 0 && (
              <div className="brief-section">
                <div className="brief-section-title">⚠️ {t('advisor.cumulativeGaps')}</div>
                <ul>
                  {brief.prerequisite_gaps.map((g, i) => <li key={i}>{g}</li>)}
                </ul>
              </div>
            )}

            {/* نمط التسليم */}
            {brief.submission_habits && (
              <div className="brief-section">
                <div className="brief-section-title">⏱️ {t('advisor.submissionPattern')}</div>
                <p>{brief.submission_habits}</p>
              </div>
            )}

            {/* مقاييس التقييم */}
            {brief.assessment_metrics && (
              <div className="brief-section">
                <div className="brief-section-title">📈 {t('advisor.assessmentMetrics')}</div>
                <ul>
                  <li>{t('advisor.midterm')}: {brief.assessment_metrics.midterm}</li>
                  <li>{t('advisor.projectsAssignments')}: {brief.assessment_metrics.assignments}</li>
                </ul>
              </div>
            )}

            {/* التوصيات */}
            {brief.recommended_actions?.length > 0 && (
              <div className="brief-section">
                <div className="brief-section-title">✅ {t('advisor.recommendations')}</div>
                <ul>
                  {brief.recommended_actions.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </div>
            )}
          </>
        )}

        <button className="brief-close-btn" onClick={onClose}>{t('advisor.close')}</button>
      </div>
    </div>
  );
}

function BehaviorReportModal({ reportState, onClose }) {
  const { t } = useLanguage();
  const { loading, report, studentName, error } = reportState || {};

  return (
    <div className="brief-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="brief-modal" style={{ maxWidth: '760px' }}>
        <h2><Radar size={20} /> {t('advisor.digitalBehaviorReport')} {studentName ? `— ${studentName}` : ''}</h2>

        {loading ? (
          <div style={{ padding: '1.4rem 0.5rem' }}>
            <LoadingSkeleton lines={4} />
          </div>
        ) : error ? (
          <div style={{ color: '#fda4af', padding: '1rem 0.3rem', fontSize: '0.85rem' }}>{error}</div>
        ) : (
          <div style={{
            marginTop: '0.6rem',
            padding: '0.9rem',
            borderRadius: '12px',
            border: '1px solid rgba(45,212,191,0.2)',
            background: 'rgba(45,212,191,0.06)',
            color: 'var(--text-primary)',
            lineHeight: 1.9,
            fontSize: '0.84rem',
            whiteSpace: 'pre-wrap',
          }}>
            {report || t('advisor.noReport')}
          </div>
        )}

        <button className="brief-close-btn" onClick={onClose}>{t('advisor.close')}</button>
      </div>
    </div>
  );
}

function DashboardTab({ students, stats, onIntervention, onToast, onPeerMatch, matchingById, isSupervisor, onAnalyzeBehavior, behaviorAnalyzingId = null }) {
  const { t, formatNumber, formatPercent } = useLanguage();

  const calculateAcademicIsolationRisk = (profile = {}) => {
    const forumParticipation = Math.max(0, Math.min(100, Number(profile?.forumParticipation ?? 0)));
    const peerAssessment = Math.max(0, Math.min(100, Number(profile?.peerAssessment ?? 0)));
    const twinningResponsiveness = Math.max(0, Math.min(100, Number(profile?.twinningResponsiveness ?? 0)));

    return Number((((100 - forumParticipation) * 0.4)
      + ((100 - twinningResponsiveness) * 0.4)
      + ((100 - peerAssessment) * 0.2)).toFixed(1));
  };

  const handlePeerMatch = async (student) => {
    const weakSkill = student?.weakSkills?.[0] || student?.major || t('common.courseCs');
    try {
      const result = await onPeerMatch(student?.id, weakSkill);
      onToast(result?.message || t('advisor.peerRequestSent', { name: student?.name }), 'info');
    } catch (err) {
      console.error(err);
      onToast(t('advisor.peerFailed'), 'warning');
    }
  };

  const handleEscalation = (student) => {
    try {
      onIntervention?.(student);
      onToast?.(t('advisor.escalated', { name: student?.name }), 'warning');
    } catch (err) {
      console.error(err);
      onToast?.(t('advisor.escalateFailed'), 'warning');
    }
  };

  const safeStudents = Array.isArray(students) ? students : [];
  const disengagementCases = detectDisengagementRadar(safeStudents).slice(0, 8);

  const sendMotivationPulse = (studentName = t('common.student')) => {
    const matched = disengagementCases.find((item) => item.studentName === studentName) || null;
    buildMotivationPulseMessage(studentName, matched);
    onToast?.(t('advisor.alertSent'), 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="stats-row animate-fade-up">
        <StatCard icon={<Users size={24} />} label={t('advisor.totalStudents')} value={Number.isFinite(stats?.totalStudents) ? formatNumber(stats.totalStudents) : t('common.na')}
          trend={t('advisor.liveUpdated')} trendColor="var(--brand-emerald)"
          iconBg="rgba(110,231,183,0.12)" iconColor="var(--brand-emerald)" />
        <StatCard icon={<ShieldAlert size={24} />} label={t('advisor.interventionsToday')}
          value={Number.isFinite(stats?.interventionsToday) ? formatNumber(stats.interventionsToday) : t('common.na')}
          trend={`${formatNumber(stats?.redCount ?? 0)} ${t('advisor.urgentLabel')} • ${formatNumber(stats?.yellowCount ?? 0)} ${t('advisor.monitorLabel')}`}
          trendColor="var(--brand-rose)"
          iconBg="rgba(253,164,175,0.12)" iconColor="var(--brand-rose)" valueColor="var(--brand-rose)" />
        <StatCard icon={<GraduationCap size={24} />} label={t('advisor.successfulInterventions')}
          value={Number.isFinite(stats?.successfulInterventions) ? formatNumber(stats.successfulInterventions) : t('common.na')}
          trend={`${t('advisor.successRatePrefix')} ${formatPercent(stats?.successRate ?? 0, 0)}`} trendColor="var(--brand-emerald)"
          iconBg="rgba(45,212,191,0.12)" iconColor="var(--brand-cyan)" />
      </div>

      <div className="dashboard-grid animate-fade-up delay-2">
        <div className="glass panel-card">
          <div className="panel-header">
            <div className="panel-title">
              <div className="panel-title-icon" style={{ background: 'rgba(45,212,191,0.12)', color: 'var(--brand-indigo)' }}>
                <ShieldAlert size={18} />
              </div>
              {t('advisor.smartTriage')}
            </div>
            <span className="badge" style={{ background: 'rgba(45,212,191,0.12)', color: 'var(--brand-indigo)' }}>
              {t('advisor.sortedByRisk')}
            </span>
          </div>

          <div className="student-list">
            {safeStudents.map((s) => (
              <div key={s.id} className="student-item">
                <div className={`risk-dot ${s.riskLevel}`} />
                <div style={{ minWidth: '100px' }}>
                  <div className="student-name">{s.name}</div>
                  <div className="student-meta">{s.id} | {t('advisor.gpaLabel')}: {s.gpa} | {t('advisor.riskLabel')}: {formatPercent(s.riskScore, 1)}</div>
                </div>
                <div className="student-issue">{s.primaryReason}</div>
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  {s.riskLevel === 'red' && (
                    <button className="btn btn-danger" style={{ fontSize: '0.78rem' }} onClick={() => onIntervention(s)}>
                      <Mail size={14} /> {t('common.interventionPlan')}
                    </button>
                  )}
                  {s.riskLevel === 'yellow' && !isSupervisor && (
                    <button className="btn btn-ghost" style={{ fontSize: '0.78rem' }} onClick={() => handlePeerMatch(s)} disabled={Boolean(matchingById?.[s?.id])}>
                      <Users size={14} /> {matchingById?.[s?.id] ? t('advisor.searching') : t('advisor.peerMatch')}
                    </button>
                  )}
                  {(s.riskLevel === 'yellow' || s.riskLevel === 'red') && isSupervisor && (
                    <button className="btn btn-danger" style={{ fontSize: '0.78rem' }} onClick={() => handleEscalation(s)}>
                      <ShieldAlert size={14} /> {t('advisor.escalateCase')}
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
                <Compass size={18} />
              </div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.38rem' }}>
                {t('advisor.automationBoard')}
                <span style={{ color: '#2dd4bf', fontWeight: 800 }}>🧭</span>
              </span>
            </div>
            <span className="badge" style={{ background: 'rgba(45,212,191,0.12)', color: '#2dd4bf' }}>{t('advisor.mentorEdition')}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <AiInsightCard
              color="var(--brand-cyan)"
              icon={<Network size={16} className="animate-pulse" />}
              title={t('advisor.disengagementRadar')}
              body={''}
            />

            {disengagementCases.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.4rem 0.1rem' }}>
                {t('advisor.noActiveCases')}
              </div>
            ) : (
              disengagementCases.map((item) => {
                const isolationScore = calculateAcademicIsolationRisk(item?.profile || {});
                const isolationLabel = isolationScore > 75
                  ? t('advisor.behavioralSeparation')
                  : isolationScore >= 50
                    ? t('advisor.isolationModerate')
                    : t('advisor.passivePresence');

                return (
                <div key={item.studentId} style={{ border: '1px solid rgba(253,164,175,0.25)', borderRadius: '12px', padding: '0.72rem 0.78rem', background: 'rgba(253,164,175,0.07)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.7rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.82rem' }}>{item.studentName}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.74rem', marginTop: '0.12rem' }}>
                        {isolationLabel}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-ghost"
                        style={{ width: 'auto', fontSize: '0.73rem', borderColor: 'rgba(251,191,36,0.35)', color: '#fbbf24' }}
                        onClick={() => onAnalyzeBehavior?.(item)}
                        disabled={behaviorAnalyzingId === item.studentId}
                      >
                        {behaviorAnalyzingId === item.studentId ? t('advisor.analyzing') : t('advisor.analyzeDigitalBehavior')}
                      </button>
                      <button
                        className="btn btn-ghost"
                        style={{ width: 'auto', fontSize: '0.73rem', borderColor: 'rgba(45,212,191,0.35)', color: '#2dd4bf' }}
                        onClick={() => sendMotivationPulse(item.studentName)}
                      >
                        {t('advisor.sendAlert')}
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ height: '7px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, isolationScore)}%`, height: '100%', background: 'linear-gradient(90deg, #fbbf24, #fda4af)' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem', fontSize: '0.72rem', color: 'var(--text-secondary)', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span>{t('advisor.riskIndicator')}: {formatPercent(isolationScore, 1)}</span>
                      <span>{t('advisor.fileAccess')}: {formatPercent(item?.profile?.forumParticipation ?? 0, 1)}</span>
                      <span>{t('advisor.twinningResponsiveness')}: {formatPercent(item?.profile?.twinningResponsiveness ?? 0, 1)}</span>
                    </div>
                  </div>
                </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AutomationPanel({ automation, onScan, onMagic, onToast, identity, disengagementAlerts = [] }) {
  const { t } = useLanguage();
  const loading = Boolean(automation?.loading);
  const proactiveAlerts = Array.isArray(automation?.proactiveAlerts) ? automation.proactiveAlerts : [];
  const twinning = Array.isArray(automation?.twinningSuggestions) ? automation.twinningSuggestions : [];
  const reports = Array.isArray(automation?.criticalReports) ? automation.criticalReports : [];
  const urgentAlerts = [...(Array.isArray(disengagementAlerts) ? disengagementAlerts : []), ...proactiveAlerts];

  return (
    <div className="glass panel-card animate-fade-up" style={{ marginBottom: '1rem' }}>
      <div className="panel-header" style={{ marginBottom: '0.8rem' }}>
        <div className="panel-title">
          <div className="panel-title-icon" style={{ background: 'rgba(45,212,191,0.12)', color: 'var(--brand-cyan)' }}>
            <BrainCircuit size={18} />
          </div>
          {identity?.automationTitle || t('advisor.automationBoard')}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-ghost" style={{ width: 'auto', fontSize: '0.78rem' }} onClick={() => onScan?.()} disabled={loading}>
            {loading ? t('advisor.thinking') : t('advisor.rescanning')}
          </button>
          <button
            className="btn"
            style={{
              width: 'auto',
              fontSize: '0.8rem',
              fontWeight: 800,
              color: '#ecfeff',
              background: 'linear-gradient(135deg, #10b981, #14b8a6)',
              border: '1px solid rgba(16,185,129,0.45)',
              borderRadius: '12px',
              paddingInline: '1rem',
              boxShadow: '0 6px 18px rgba(16,185,129,0.26)',
              whiteSpace: 'nowrap',
            }}
            onClick={() => {
              const actions = onMagic?.() || [];
              const bulkCommand = buildCollectiveDisengagementCommand(disengagementAlerts);
              onToast?.(t('advisor.executedActions', { count: actions.length }), 'info');
              if (bulkCommand.count > 0) {
                onToast?.(bulkCommand.message, 'warning');
              }
            }}
            disabled={loading}
          >
            <Sparkles size={14} /> {identity?.commandLabel || t('advisor.magicCommand')}
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton lines={3} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
          {urgentAlerts.length > 0 && (
            <div style={{ padding: '0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(253,164,175,0.28)', background: 'rgba(253,164,175,0.08)' }}>
              <div style={{ fontWeight: 700, color: '#fda4af', marginBottom: '0.3rem', fontSize: '0.85rem' }}>{t('advisor.urgentAlerts')}</div>
              {urgentAlerts.slice(0, 4).map((a, idx) => (
                <div key={`${a.studentId || 'x'}-${idx}`} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                  {a.message || `${a.studentName}: ${a.type || t('advisor.urgentAlertType')}`}
                </div>
              ))}
            </div>
          )}

          {twinning.length > 0 && (
            <div style={{ padding: '0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(45,212,191,0.28)', background: 'rgba(45,212,191,0.08)' }}>
              <div style={{ fontWeight: 700, color: 'var(--brand-cyan)', marginBottom: '0.3rem', fontSize: '0.85rem' }}>{t('advisor.smartPairingCards')}</div>
              {twinning.slice(0, 2).map((pair) => (
                <div key={pair.studentId} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                  {pair.studentName} ⇄ {pair?.tutor?.tutorName} | {pair.gapClo} ({pair.gapValue}%)
                </div>
              ))}
            </div>
          )}

          {reports.length > 0 && (
            <div style={{ padding: '0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(251,191,36,0.28)', background: 'rgba(251,191,36,0.08)' }}>
              <div style={{ fontWeight: 700, color: '#fbbf24', marginBottom: '0.3rem', fontSize: '0.85rem' }}>{t('advisor.instantReports')}</div>
              {reports.slice(0, 2).map((report) => (
                <div key={report.studentId} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                  {report.studentName}: {report.issue}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StudentsTab({ students, onIntervention, onBrief, searchSignal }) {
  const { t, formatPercent } = useLanguage();
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
            {t('advisor.allStudents')}
          </div>
          <span className="badge" style={{ background: 'rgba(45,212,191,0.12)', color: 'var(--brand-indigo)' }}>{t('advisor.studentsCount', { count: filtered.length })}</span>
        </div>

        <div className="filter-bar">
          <div className="search-input-wrap">
            <Search size={14} />
            <input ref={searchInputRef} type="text" placeholder={t('advisor.searchByNameOrId')} value={search} onChange={(e) => setSearch(e.target.value)} className="search-input" />
          </div>
          <div className="filter-chips">
            {[
              { key: 'all', label: t('advisor.filterAll'), count: counts.all },
              { key: 'red', label: t('advisor.filterRisk'), count: counts.red },
              { key: 'yellow', label: t('advisor.filterWarning'), count: counts.yellow },
              { key: 'green', label: t('advisor.filterSafe'), count: counts.green },
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
                  <span className="student-meta">{s.id} | {s.major} | {t('advisor.yearPrefix')} {s.year}</span>
                </div>
                <div className="student-detail-score" style={{ color: s.riskLevel === 'red' ? '#fda4af' : s.riskLevel === 'yellow' ? '#fbbf24' : '#6ee7b7' }}>
                  {formatPercent(s.riskScore, 1)}
                </div>
              </div>
              <div className="student-detail-body">
                <div className="detail-stat-row">
                  <span>{t('advisor.gpaLabel')}: <strong>{s.gpa}</strong></span>
                  <span>{t('advisor.attendance')}: <strong>{formatPercent(s.attendance, 0)}</strong></span>
                  <span>{t('advisor.tasksCompletion')}: <strong>{formatPercent(s.taskCompletion, 0)}</strong></span>
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
                    <Mail size={14} /> {t('common.interventionPlan')}
                  </button>
                )}
                <button className="btn btn-ghost" style={{ fontSize: '0.78rem', color: '#2dd4bf', borderColor: 'rgba(45,212,191,0.3)' }} onClick={() => onBrief(s.id)}>
                  <Bot size={14} /> {t('common.aiSummary')}
                </button>
                <button className="btn btn-ghost" style={{ fontSize: '0.78rem' }} onClick={() => onBrief(s.id)}>
                  <Eye size={14} /> {t('common.viewProfile')}
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
  const { t } = useLanguage();
  const safeLog = Array.isArray(interventionLog) ? interventionLog : [];
  const statusMap = {
    sent: { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', label: t('advisor.statusSent'), Icon: Mail },
    meeting: { color: '#2dd4bf', bg: 'rgba(45,212,191,0.1)', label: t('advisor.statusMeeting'), Icon: Users },
    completed: { color: '#6ee7b7', bg: 'rgba(110,231,183,0.1)', label: t('advisor.statusCompleted'), Icon: CheckCircle2 },
    followup: { color: '#22D3EE', bg: 'rgba(45,212,191,0.1)', label: t('advisor.statusFollowup'), Icon: Clock },
  };

  return (
    <div className="animate-fade-up">
      <div className="glass panel-card">
        <div className="panel-header">
          <div className="panel-title">
            <div className="panel-title-icon" style={{ background: 'rgba(253,164,175,0.12)', color: '#fda4af' }}>
              <FileText size={18} />
            </div>
            {t('advisor.interventionsLog')}
          </div>
          <span className="badge" style={{ background: 'rgba(110,231,183,0.12)', color: '#6ee7b7' }}>
            {t('advisor.completedCount', { count: safeLog.filter((i) => i.status === 'completed').length })}
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
  const { t, formatPercent } = useLanguage();
  const severityColor = {
    red: '#fda4af',
    yellow: '#fbbf24',
    green: '#6ee7b7'
  };
  const severityLabel = {
    red: t('advisor.riskStatus'),
    yellow: t('advisor.warningStatus'),
    green: t('advisor.safeStatus')
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
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{t('advisor.highRiskCourses')}</div>
        </div>
        <div className="glass" style={{ padding: '1rem 1.2rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24' }}>{yellowCount}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{t('advisor.monitoredCourses')}</div>
        </div>
        <div className="glass" style={{ padding: '1rem 1.2rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#6ee7b7' }}>{greenCount}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{t('advisor.stableCourses')}</div>
        </div>
        <div className="glass" style={{ padding: '1rem 1.2rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--brand-cyan)' }}>{formatPercent(avgFailRate, 0)}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{t('advisor.avgFailRate')}</div>
        </div>
      </div>

      {/* ═══ الرسم البياني المرتب ═══ */}
      <div className="glass panel-card">
        <div className="panel-header" style={{ marginBottom: '1.2rem' }}>
          <div className="panel-title">
            <div className="panel-title-icon" style={{ background: 'rgba(251,191,36,0.12)', color: 'var(--brand-amber)' }}>
              <TrendingUp size={18} />
            </div>
            {t('advisor.failRatesByCourse')}
          </div>
          <span className="badge" style={{ background: 'rgba(251,191,36,0.12)', color: 'var(--brand-amber)' }}>{t('advisor.aiFiltered')}</span>
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
                          insetInlineStart: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontSize: '0.72rem',
                          color: 'var(--text-muted)',
                          whiteSpace: 'nowrap',
                        }}>
                          {c.instructor} • {c.enroll_count} {t('advisor.studentsWord')}
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
                    {formatPercent(c.fail_rate, 0)}
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
            {t('advisor.detailedCourseAnalysis')}
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
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>👨‍🏫 {c.instructor} — {c.enroll_count} {t('advisor.studentsWord')}</span>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.82rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                <span>{t('advisor.failRate')}: <strong style={{ color: severityColor[c.severity] }}>{formatPercent(c.fail_rate, 0)}</strong></span>
                <span>{t('advisor.avgGrade')}: <strong style={{ color: c.avg_grade >= 3.5 ? '#6ee7b7' : c.avg_grade >= 2.5 ? '#fbbf24' : '#fda4af' }}>{c.avg_grade}</strong></span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <AlertTriangle size={12} style={{ color: severityColor[c.severity], flexShrink: 0 }} />
                  <span>{t('advisor.courseNeedsFollowup', { level: severityLabel[c.severity] })}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <Sparkles size={12} style={{ color: '#2dd4bf', flexShrink: 0 }} />
                  <span>{t('advisor.recommendationText')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdvisorDashboard({ activeTab, onIntervention, onToast, searchSignal = 0, identity = null }) {
  const { t } = useLanguage();
  const { user } = useUser();
  const {
    dashboardData: data,
    loading,
    error,
    refreshDashboard,
    triggerPeerMatch,
    matchLoading,
    automation,
    runAutonomousScan,
    runMagicAutomation,
  } = useRased();
  const [briefStudentId, setBriefStudentId] = useState(null);
  const [behaviorAnalyzingId, setBehaviorAnalyzingId] = useState(null);
  const [behaviorReportState, setBehaviorReportState] = useState({
    open: false,
    loading: false,
    studentName: '',
    report: '',
    error: '',
  });
  const normalizedRole = String(user?.role || '').toLowerCase();
  const isMentorRole = normalizedRole === 'advisor' || normalizedRole === 'mentor' || normalizedRole === 'adviser';
  const isSupervisor = user?.id === 'AD-2001';

  useEffect(() => {
    runAutonomousScan?.({ activeTab: activeTab || 'dashboard' });
  }, [activeTab, runAutonomousScan]);

  if (!isMentorRole && user?.role) {
    return null;
  }

  if (error) {
    return (
      <div className="glass panel-card" style={{ color: '#fda4af', padding: '2rem', textAlign: 'center' }}>
        <AlertTriangle size={30} style={{ margin: '0 auto 1rem' }} />
        {error}
        <button className="btn btn-ghost" style={{ marginTop: '1rem', width: 'auto' }} onClick={refreshDashboard}>{t('common.retry')}</button>
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
  const disengagementAlerts = detectDisengagementRadar(students || []);
  const showAutomationPanel = !activeTab || activeTab === 'dashboard';

  const handlePeerMatch = async (requesterId, weakSkill) => {
    try {
      return await triggerPeerMatch(requesterId, weakSkill);
    } catch (err) {
      console.error('Peer match workflow failed:', err);
      return { ok: false, message: t('advisor.peerWorkflowFailed') };
    }
  };

  const handleAnalyzeBehavior = async (item) => {
    if (!item?.studentId) return;

    setBehaviorAnalyzingId(item.studentId);
    setBehaviorReportState({
      open: true,
      loading: true,
      studentName: item.studentName,
      report: '',
      error: '',
    });

    try {
      const report = await generateDisengagementReport(item.studentName, item);
      setBehaviorReportState({
        open: true,
        loading: false,
        studentName: item.studentName,
        report,
        error: '',
      });
    } catch {
      setBehaviorReportState({
        open: true,
        loading: false,
        studentName: item.studentName,
        report: '',
        error: t('advisor.behaviorReportFailed'),
      });
    } finally {
      setBehaviorAnalyzingId(null);
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
            onAnalyzeBehavior={handleAnalyzeBehavior}
            behaviorAnalyzingId={behaviorAnalyzingId}
          />
        );
    }
  };

  return (
    <>
      {showAutomationPanel && (
        <AutomationPanel
          automation={automation}
          onScan={() => runAutonomousScan?.({ activeTab: activeTab || 'dashboard' })}
          onMagic={runMagicAutomation}
          onToast={onToast}
          identity={identity}
          disengagementAlerts={disengagementAlerts}
        />
      )}
      {renderTab()}
      {briefStudentId && (
        <BriefModal
          key={briefStudentId}
          studentId={briefStudentId}
          onClose={() => setBriefStudentId(null)}
        />
      )}
      {behaviorReportState.open && (
        <BehaviorReportModal
          reportState={behaviorReportState}
          onClose={() => setBehaviorReportState((prev) => ({ ...prev, open: false }))}
        />
      )}
    </>
  );
}
