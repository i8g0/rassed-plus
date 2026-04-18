import { CalendarClock, Clock3 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageProvider';function formatRemaining(hoursRemaining) {
  if (!Number.isFinite(hoursRemaining)) return 'بيانات غير كافية';
  if (hoursRemaining <= 0) return 'انتهى الموعد';
  if (hoursRemaining < 24) return `متبقي ${Math.ceil(hoursRemaining)} ساعة`;

  const days = Math.floor(hoursRemaining / 24);
  const hours = Math.ceil(hoursRemaining % 24);
  if (hours === 24) return `متبقي ${days + 1} يوم`;
  if (hours === 0) return `متبقي ${days} يوم`;
  return `متبقي ${days} يوم و${hours} ساعة`;
}

function getUrgencyStyle(hoursRemaining) {
  if (!Number.isFinite(hoursRemaining)) {
    return {
      label: 'غير مكتمل',
      color: '#94a3b8',
      border: 'rgba(148,163,184,0.25)',
      bg: 'rgba(148,163,184,0.08)',
    };
  }

  if (hoursRemaining <= 24) {
    return {
      label: 'عالي',
      color: '#fda4af',
      border: 'rgba(253,164,175,0.35)',
      bg: 'rgba(253,164,175,0.10)',
    };
  }

  if (hoursRemaining <= 48) {
    return {
      label: 'متوسط',
      color: '#fbbf24',
      border: 'rgba(251,191,36,0.35)',
      bg: 'rgba(251,191,36,0.10)',
    };
  }

  return {
    label: 'مريح',
    color: '#6ee7b7',
    border: 'rgba(110,231,183,0.35)',
    bg: 'rgba(110,231,183,0.10)',
  };
}

export default function AssignmentsList({ assignments = [] }) {
  const { t } = useLanguage();
  const safeAssignments = Array.isArray(assignments) ? assignments : [];

  return (
    <div className="glass panel-card animate-fade-up">
      <div className="panel-header">
        <div className="panel-title">
          <div className="panel-title-icon" style={{ background: 'rgba(45,212,191,0.12)', color: '#2dd4bf' }}>
            <CalendarClock size={18} />
          </div>
          {t('student.unifiedAssignments', { defaultValue: 'نظام تتبع الواجبات الموحد' })}
        </div>
        <span className="badge" style={{ background: 'rgba(45,212,191,0.12)', color: '#2dd4bf' }}>
          {safeAssignments.length} {t('student.assignmentsBadge', { defaultValue: 'واجب' })}
        </span>
      </div>

      {safeAssignments.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0.6rem 0.2rem' }}>
          {t('student.noAssignments', { defaultValue: 'لا توجد واجبات مجمعة حالياً.' })}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {safeAssignments.map((item) => {
            const urgency = getUrgencyStyle(item?.hoursRemaining);
            return (
              <div
                key={item?.id || `${item?.courseName}-${item?.assignmentName}-${item?.dueAt}`}
                style={{
                  border: `1px solid ${urgency.border}`,
                  background: urgency.bg,
                  borderRadius: '12px',
                  padding: '0.75rem 0.85rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.7rem' }}>
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item?.assignmentName ?? 'واجب غير معرف'}</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{item?.courseName ?? 'مقرر غير معروف'}</div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '999px',
                      border: `1px solid ${urgency.border}`,
                      color: urgency.color,
                      fontWeight: 700,
                    }}
                  >
                    {urgency.label}
                  </span>
                </div>

                <div style={{ marginTop: '0.55rem', display: 'flex', gap: '0.8rem', flexWrap: 'wrap', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <CalendarClock size={13} />
                    {item?.dueLabel ?? 'تاريخ غير متوفر'}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: urgency.color }}>
                    <Clock3 size={13} />
                    {formatRemaining(item?.hoursRemaining)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
