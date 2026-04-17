/**
 * NotificationsPanel.jsx
 * لوحة الإشعارات المنسدلة — تظهر عند الضغط على أيقونة الجرس
 */

import { X, AlertTriangle, CheckCircle2, Info, Bell } from 'lucide-react';

const typeConfig = {
  danger:  { color: '#F43F5E', Icon: AlertTriangle, bg: 'rgba(244,63,94,0.08)' },
  warning: { color: '#F59E0B', Icon: AlertTriangle, bg: 'rgba(245,158,11,0.08)' },
  success: { color: '#10B981', Icon: CheckCircle2,  bg: 'rgba(16,185,129,0.08)' },
  info:    { color: '#818CF8', Icon: Info,           bg: 'rgba(129,140,248,0.08)' },
};

export default function NotificationsPanel({ notifications = [], onClose }) {
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="notif-overlay" onClick={onClose}>
      <div className="notif-panel glass" onClick={e => e.stopPropagation()}>

        <div className="notif-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={18} />
            <span style={{ fontWeight: '700' }}>الإشعارات</span>
            {unread > 0 && (
              <span className="badge" style={{ background: 'rgba(244,63,94,0.12)', color: '#F43F5E' }}>
                {unread} جديد
              </span>
            )}
          </div>
          <button className="icon-btn" onClick={onClose} style={{ width: '32px', height: '32px' }}>
            <X size={16} />
          </button>
        </div>

        <div className="notif-list">
          {notifications.map(n => {
            const cfg = typeConfig[n.type];
            const NIcon = cfg.Icon;
            return (
              <div
                key={n.id}
                className="notif-item"
                style={{
                  background: n.read ? 'transparent' : cfg.bg,
                  borderRight: n.read ? 'none' : `3px solid ${cfg.color}`,
                }}
              >
                <div style={{ color: cfg.color, flexShrink: 0 }}><NIcon size={16} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="notif-text">{n.text}</p>
                  <span className="notif-time">{n.time}</span>
                </div>
                {!n.read && <div className="notif-unread-dot" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
