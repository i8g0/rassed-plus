import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageProvider';

function asPercent(absenceCount, totalSessions) {
  if (!Number.isFinite(absenceCount) || !Number.isFinite(totalSessions) || totalSessions <= 0) return 0;
  return (absenceCount / totalSessions) * 100;
}

function getStatus(percent, t) {
  if (percent >= 25) {
    return {
      status: t('student.statusDebarred'),
      color: '#fda4af',
      border: 'rgba(253,164,175,0.35)',
      bg: 'rgba(253,164,175,0.10)',
      note: t('student.noteDebarred'),
    };
  }

  if (percent >= 20) {
    return {
      status: t('student.statusFirstWarning'),
      color: '#fbbf24',
      border: 'rgba(251,191,36,0.35)',
      bg: 'rgba(251,191,36,0.10)',
      note: t('student.noteFirstWarning'),
    };
  }

  return {
    status: t('student.statusSafe'),
    color: '#6ee7b7',
    border: 'rgba(110,231,183,0.35)',
    bg: 'rgba(110,231,183,0.10)',
    note: t('student.noteSafe'),
  };
}

export default function AttendanceRadar({ courses = [] }) {
  const { t } = useLanguage();
  const safeCourses = Array.isArray(courses) ? courses : [];

  return (
    <div className="glass panel-card animate-fade-up" style={{ animationDelay: '0.04s' }}>
      <div className="panel-header">
        <div className="panel-title">
          <div className="panel-title-icon" style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}>
            <ShieldAlert size={18} />
          </div>
          {t('student.attendanceRadar')}
        </div>
        <span className="badge" style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}>{t('student.debarLimit')}</span>
      </div>

      {safeCourses.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0.6rem 0.2rem' }}>
          {t('student.noAttendanceData')}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {safeCourses.map((course) => {
            const absenceCount = Number(course?.absenceCount ?? 0);
            const totalSessions = Number(course?.totalSessions ?? 0);
            const percent = asPercent(absenceCount, totalSessions);
            const status = getStatus(percent, t);
            return (
              <div
                key={course?.courseCode || course?.courseName}
                style={{
                  border: `1px solid ${status.border}`,
                  background: status.bg,
                  borderRadius: '12px',
                  padding: '0.75rem 0.85rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.7rem', alignItems: 'center' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>{course?.courseName ?? t('student.unknownCourse')}</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {t('student.absenceOf', { count: absenceCount, total: totalSessions })}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '999px',
                      border: `1px solid ${status.border}`,
                      color: status.color,
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {status.status}
                  </span>
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ height: '8px', width: '100%', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(percent, 100)}%`,
                        height: '100%',
                        borderRadius: '999px',
                        background: status.color,
                        transition: 'width 0.25s ease',
                      }}
                    />
                  </div>
                  <div style={{ marginTop: '0.35rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.73rem', color: 'var(--text-secondary)' }}>
                    <span>{t('student.absencePercent', { percent: percent.toFixed(1) })}</span>
                    <span style={{ color: status.color, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <AlertTriangle size={12} />
                      {status.note}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
