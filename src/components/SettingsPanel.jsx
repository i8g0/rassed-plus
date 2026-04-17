/**
 * SettingsPanel.jsx — لوحة الإعدادات والتخصيص (Slide-out)
 *
 * 🔧 مطوّر: محمد
 * 📌 المهمة: نقل Features Hub من السايدبار إلى لوحة إعدادات في الهيدر
 *
 * ✅ معزول تماماً — لا يعدّل أي ملف مركزي
 * ✅ CSS محلي داخل الملف لتجنب تعارض الستايلات
 * 🔧 مطوّر: محمد عمار
 * 📌 كل الإعدادات تحفظ في LocalStorage وتنعكس فوراً على كامل التطبيق
 *
 * ✅ المظهر (داكن/فاتح/تلقائي) — يغير CSS Variables فوراً
 * ✅ اللغة (عربي/إنجليزي) — يغير اتجاه النص
 * ✅ اللون الأساسي — 6 ألوان مع تأثير حي
 * ✅ الحركات — تعطيل/تفعيل كل الأنيميشنات
 * ✅ الأصوات — تفعيل أصوات الإشعارات
 * ✅ الميزات — تفعيل/تعطيل 100 ميزة
 */

import { useEffect, useMemo, useState } from 'react';
import {
  X, Settings, Power, Sparkles,
  ShieldCheck, Rocket, Bot,
  Palette, Globe, Volume2, Eye,
  Moon, Sun, Monitor,
} from 'lucide-react';
import { getFeatures, toggleFeature } from '../services/api';

import { useSettings } from '../contexts/SettingsContext';

/* ─── بيانات إعدادات محلية ────────────────────────────────────────────────── */

const LOCAL_PREFERENCES = [
  {
    id: 'theme',
    label: 'المظهر',
    icon: Moon,
    type: 'select',
    options: [
      { value: 'dark', label: 'داكن', icon: Moon },
      { value: 'light', label: 'فاتح', icon: Sun },
      { value: 'auto', label: 'تلقائي', icon: Monitor },
    ],
    defaultValue: 'dark',
  },
  {
    id: 'language',
    label: 'اللغة',
    icon: Globe,
    type: 'select',
    options: [
      { value: 'ar', label: 'العربية 🇸🇦' },
      { value: 'en', label: 'English 🇺🇸' },
    ],
    defaultValue: 'ar',
  },
  {
    id: 'animations',
    label: 'الحركات والتأثيرات',
    icon: Eye,
    type: 'toggle',
    defaultValue: true,
  },
  {
    id: 'sounds',
    label: 'أصوات الإشعارات',
    icon: Volume2,
    type: 'toggle',
    defaultValue: true,
  },
  {
    id: 'color_accent',
    label: 'اللون الأساسي',
    icon: Palette,
    type: 'color',
    options: [
      { value: '#6366F1', label: 'بنفسجي' },
      { value: '#10B981', label: 'أخضر' },
      { value: '#F59E0B', label: 'ذهبي' },
      { value: '#F43F5E', label: 'وردي' },
      { value: '#22D3EE', label: 'سماوي' },
      { value: '#8B5CF6', label: 'أرجواني' },
    ],
    defaultValue: '#6366F1',
  },
];

const FEATURE_CATEGORY_META = {
  student: { title: 'ميزات الطلاب', subtitle: '40 ميزة', icon: Rocket, color: '#10B981' },
  advisor: { title: 'ميزات المرشد والجامعة', subtitle: '30 ميزة', icon: ShieldCheck, color: '#F59E0B' },
  ai:      { title: 'ميزات الذكاء الاصطناعي', subtitle: '30 ميزة', icon: Bot, color: '#818CF8' },
};

/* ─── Sub-components ───────────────────────────────────────────────────────── */

function PreferenceItem({ pref, value, onChange }) {
  if (pref.type === 'toggle') {
    return (
      <div className="sp-pref-item">
        <div className="sp-pref-label">
          <pref.icon size={16} />
          <span>{pref.label}</span>
        </div>
        <button
          className={`sp-toggle ${value ? 'sp-toggle-on' : 'sp-toggle-off'}`}
          onClick={() => onChange(!value)}
        >
          <div className="sp-toggle-thumb" />
        </button>
      </div>
    );
  }

  if (pref.type === 'select') {
    return (
      <div className="sp-pref-item">
        <div className="sp-pref-label">
          <pref.icon size={16} />
          <span>{pref.label}</span>
        </div>
        <div className="sp-select-group">
          {pref.options.map((opt) => (
            <button
              key={opt.value}
              className={`sp-select-btn ${value === opt.value ? 'sp-select-active' : ''}`}
              onClick={() => onChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (pref.type === 'color') {
    return (
      <div className="sp-pref-item">
        <div className="sp-pref-label">
          <pref.icon size={16} />
          <span>{pref.label}</span>
        </div>
        <div className="sp-color-group">
          {pref.options.map((opt) => (
            <button
              key={opt.value}
              className={`sp-color-dot ${value === opt.value ? 'sp-color-active' : ''}`}
              style={{ '--dot-color': opt.value }}
              onClick={() => onChange(opt.value)}
              title={opt.label}
            />
          ))}
        </div>
      </div>
    );
  }

  return null;
}

function FeatureCard({ feature, onToggle, busy }) {
  return (
    <div className={`sp-feature-card ${feature.enabled ? 'sp-feature-enabled' : ''}`}>
      <div className="sp-feature-info">
        <h4>{feature.name}</h4>
        {feature.description && <p>{feature.description}</p>}
      </div>
      <button
        className={`sp-feature-switch ${feature.enabled ? 'on' : 'off'}`}
        onClick={() => onToggle(feature)}
        disabled={busy}
      >
        <Power size={12} /> {feature.enabled ? 'مفعلة' : 'موقفة'}
      </button>
    </div>
  );
}

/* ─── المكوّن الرئيسي ─────────────────────────────────────────────────────── */

export default function SettingsPanel({ open, onClose, onToast }) {
  const { settings, updateSetting, resetSettings } = useSettings();
  const [activeSection, setActiveSection] = useState('prefs'); // 'prefs' | 'features'
  const [features, setFeatures] = useState([]);
  const [featuresLoaded, setFeaturesLoaded] = useState(false);
  const [busyCode, setBusyCode] = useState(null);

  // التفضيلات — محلية (Local State) لتجنب تعارض البيانات
  const [preferences, setPreferences] = useState(() => {
    const saved = {};
    LOCAL_PREFERENCES.forEach((p) => {
      saved[p.id] = p.defaultValue;
    });
    return saved;
  });

  // تحميل الميزات مباشرة لما البانل ينفتح
  useEffect(() => {
    if (!open || featuresLoaded) return;
    let cancelled = false;
    getFeatures()
      .then((data) => {
        if (!cancelled) {
          setFeatures(data || []);
          setFeaturesLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFeaturesLoaded(true);
          onToast?.('تعذر تحميل الميزات', 'warning');
        }
      });
    return () => { cancelled = true; };
  }, [open, featuresLoaded, onToast]);

  const grouped = useMemo(() => ({
    student: features.filter((f) => f.category === 'student'),
    advisor: features.filter((f) => f.category === 'advisor'),
    ai: features.filter((f) => f.category === 'ai'),
  }), [features]);

  const enabledCount = features.filter((f) => f.enabled).length;

  const handleToggle = async (feature) => {
    setBusyCode(feature.code);
    const nextEnabled = !feature.enabled;
    try {
      await toggleFeature(feature.code, nextEnabled);
      setFeatures((prev) =>
        prev.map((item) =>
          item.code === feature.code ? { ...item, enabled: nextEnabled } : item,
        ),
      );
      onToast?.(`تم ${nextEnabled ? 'تفعيل' : 'إيقاف'} ${feature.name}`, nextEnabled ? 'success' : 'info');
    } catch {
      onToast?.('فشل تحديث حالة الميزة', 'warning');
    } finally {
      setBusyCode(null);
    }
  };

  const handlePrefChange = (id, value) => {
    setPreferences((prev) => ({ ...prev, [id]: value }));
    updateSetting(id, value);
    const pref = LOCAL_PREFERENCES.find((p) => p.id === id);
    onToast?.(`تم تحديث ${pref?.label || id}`, 'info');
  };

  const handleReset = () => {
    resetSettings();
    onToast?.('تم إعادة جميع الإعدادات للقيم الافتراضية', 'info');
  };

  // ⛔ ما نرندر شيء إذا مو مفتوح
  if (!open) return null;

  return (
    <>
      {/* ── Scoped CSS ── */}
      <style>{SETTINGS_PANEL_CSS}</style>

      {/* ── Overlay ── */}
      <div className="sp-overlay" onClick={onClose}>
        <div className="sp-panel" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="sp-header">
            <div className="sp-header-title">
              <Settings size={20} className="sp-header-icon" />
              <span>الإعدادات والتخصيص</span>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button className="sp-reset-btn" onClick={handleReset} title="إعادة تعيين">
                <RotateCcw size={15} />
              </button>
              <button className="sp-close-btn" onClick={onClose}>
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="sp-tabs">
            <button
              className={`sp-tab ${activeSection === 'prefs' ? 'sp-tab-active' : ''}`}
              onClick={() => setActiveSection('prefs')}
            >
              <Palette size={15} /> التخصيص
            </button>
            <button
              className={`sp-tab ${activeSection === 'features' ? 'sp-tab-active' : ''}`}
              onClick={() => setActiveSection('features')}
            >
              <Rocket size={15} /> الميزات
              {enabledCount > 0 && <span className="sp-tab-badge">{enabledCount}</span>}
            </button>
          </div>

          {/* Content */}
          <div className="sp-body">

            {/* ── قسم التفضيلات ── */}
            {activeSection === 'prefs' && (
              <div className="sp-prefs-section">
                <p className="sp-section-desc">خصّص تجربتك في راصد بلس حسب تفضيلاتك — كل التغييرات تُحفظ تلقائياً</p>
                {LOCAL_PREFERENCES.map((pref) => (
                  <PreferenceItem
                    key={pref.id}
                    pref={pref}
                    value={settings[pref.id]}
                    onChange={(val) => handlePrefChange(pref.id, val)}
                  />
                ))}
              </div>
            )}

            {/* ── قسم الميزات ── */}
            {activeSection === 'features' && (
              <div className="sp-features-section">
                {/* Hero */}
                <div className="sp-features-hero">
                  <div>
                    <p className="sp-features-overline"><Rocket size={13} /> Feature Customization</p>
                    <h3>تخصيص الميزات</h3>
                    <p className="sp-features-desc">فعّل أو عطّل الميزات حسب احتياجك</p>
                  </div>
                  <div className="sp-features-kpi">
                    <span>{enabledCount}</span>
                    <small>مفعلة</small>
                  </div>
                </div>

                {!featuresLoaded ? (
                  <div className="sp-loading">جاري تحميل الميزات...</div>
                ) : (
                  Object.entries(FEATURE_CATEGORY_META).map(([key, meta]) => {
                    const Icon = meta.icon;
                    const list = grouped[key] || [];
                    if (list.length === 0) return null;
                    return (
                      <div key={key} className="sp-feature-group">
                        <div className="sp-feature-group-head">
                          <div className="sp-feature-group-title" style={{ color: meta.color }}>
                            <Icon size={16} /> {meta.title}
                          </div>
                          <span className="sp-feature-group-badge" style={{ background: `${meta.color}22`, color: meta.color }}>
                            {meta.subtitle} • {list.filter((f) => f.enabled).length} مفعلة
                          </span>
                        </div>
                        <div className="sp-feature-grid">
                          {list.map((feature) => (
                            <FeatureCard
                              key={feature.code}
                              feature={feature}
                              onToggle={handleToggle}
                              busy={busyCode === feature.code}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Scoped CSS — محصور داخل الـ SettingsPanel فقط لتجنب تعارض الستايلات
   ═══════════════════════════════════════════════════════════════════════════════ */

const SETTINGS_PANEL_CSS = `
/* ── Overlay ── */
.sp-overlay {
  position: fixed;
  inset: 0;
  background: rgba(6,8,15,0.65);
  backdrop-filter: blur(6px);
  z-index: 95;
  display: flex;
  justify-content: flex-start;
  animation: spFadeIn 0.2s ease;
}

@keyframes spFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes spSlideIn {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}

/* ── Panel ── */
.sp-panel {
  width: 480px;
  max-width: 92vw;
  height: 100vh;
  background: rgba(15,18,30,0.96);
  backdrop-filter: blur(40px);
  border-right: 1px solid rgba(99,102,241,0.15);
  box-shadow: -12px 0 50px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  animation: spSlideIn 0.35s cubic-bezier(0.22,1,0.36,1);
  margin-right: auto;
  direction: rtl;
}

/* ── Header ── */
.sp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 1.4rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.sp-header-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 800;
  font-size: 1.05rem;
  color: #fff;
}

.sp-header-icon {
  color: #818CF8;
}

.sp-close-btn, .sp-reset-btn {
  width: 36px;
  height: 36px;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}
.sp-close-btn:hover {
  background: rgba(244,63,94,0.12);
  border-color: rgba(244,63,94,0.3);
  color: #F43F5E;
}
.sp-reset-btn:hover {
  background: rgba(245,158,11,0.12);
  border-color: rgba(245,158,11,0.3);
  color: #F59E0B;
}

/* ── Tabs ── */
.sp-tabs {
  display: flex;
  gap: 4px;
  padding: 0.6rem 1.4rem;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}

.sp-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.65rem 0.75rem;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: rgba(255,255,255,0.4);
  cursor: pointer;
  font-family: inherit;
  font-weight: 600;
  font-size: 0.84rem;
  transition: all 0.25s ease;
}
.sp-tab:hover {
  color: rgba(255,255,255,0.65);
  background: rgba(255,255,255,0.03);
}

.sp-tab-active {
  background: rgba(99,102,241,0.1) !important;
  color: #A5B4FC !important;
  border-color: rgba(99,102,241,0.2) !important;
}

.sp-tab-badge {
  background: rgba(99,102,241,0.2);
  color: #A5B4FC;
  padding: 0.1rem 0.45rem;
  border-radius: 99px;
  font-size: 0.7rem;
  font-weight: 800;
}

/* ── Body ── */
.sp-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.2rem 1.4rem;
}

/* ── Preferences ── */
.sp-section-desc {
  color: rgba(255,255,255,0.4);
  font-size: 0.82rem;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.sp-pref-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.sp-pref-item:last-child {
  border-bottom: none;
}

.sp-pref-label {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 600;
  font-size: 0.88rem;
  color: rgba(255,255,255,0.85);
}
.sp-pref-label svg {
  color: #818CF8;
}

/* Toggle Switch */
.sp-toggle {
  width: 46px;
  height: 26px;
  border-radius: 99px;
  border: none;
  cursor: pointer;
  position: relative;
  transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
  flex-shrink: 0;
}

.sp-toggle-on {
  background: linear-gradient(135deg, #6366F1, #22D3EE);
  box-shadow: 0 0 10px rgba(99,102,241,0.4);
}

.sp-toggle-off {
  background: rgba(255,255,255,0.08);
}

.sp-toggle-thumb {
  position: absolute;
  top: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
}

.sp-toggle-on .sp-toggle-thumb {
  left: 3px;
}

.sp-toggle-off .sp-toggle-thumb {
  left: 23px;
  color: var(--accent, #818CF8);
}

/* Select Buttons */
.sp-select-group {
  display: flex;
  gap: 4px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
  padding: 3px;
}

.sp-select-btn {
  padding: 0.4rem 0.7rem;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: rgba(255,255,255,0.4);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 600;
  transition: all 0.2s ease;
}
.sp-select-btn:hover {
  color: rgba(255,255,255,0.7);
}

.sp-select-active {
  background: rgba(99,102,241,0.15) !important;
  color: #A5B4FC !important;
  border-color: rgba(99,102,241,0.25) !important;
}

/* Color Dots */
.sp-color-group {
  display: flex;
  gap: 6px;
}

.sp-color-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  background: var(--dot-color);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}
.sp-color-dot:hover {
  transform: scale(1.15);
}

.sp-color-active {
  border-color: white !important;
  box-shadow: 0 0 12px var(--dot-color), 0 0 0 2px rgba(255,255,255,0.1);
  transform: scale(1.15);
}

/* ── Features Section ── */
.sp-features-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.1rem;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(34,211,238,0.08));
  border: 1px solid rgba(129,140,248,0.18);
  margin-bottom: 1rem;
}

.sp-features-overline {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: #A5B4FC;
  font-size: 0.72rem;
  font-weight: 700;
}

.sp-features-hero h3 {
  font-size: 1.05rem;
  margin: 0.15rem 0;
  color: #fff;
}

.sp-features-desc {
  color: rgba(255,255,255,0.45);
  font-size: 0.78rem;
}

.sp-features-kpi {
  text-align: center;
  padding: 0.6rem 0.8rem;
  border-radius: 10px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  min-width: 70px;
}

.sp-features-kpi span {
  display: block;
  font-size: 1.5rem;
  font-weight: 900;
  color: #22D3EE;
  line-height: 1;
}

.sp-features-kpi small {
  font-size: 0.68rem;
  color: rgba(255,255,255,0.5);
}

.sp-loading {
  text-align: center;
  padding: 2rem;
  color: rgba(255,255,255,0.4);
  font-size: 0.86rem;
}

.sp-feature-group {
  margin-bottom: 1rem;
}

.sp-feature-group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.sp-feature-group-title {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 800;
  font-size: 0.88rem;
}

.sp-feature-group-badge {
  padding: 0.2rem 0.55rem;
  border-radius: 99px;
  font-size: 0.7rem;
  font-weight: 700;
}

.sp-feature-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sp-feature-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 0.85rem;
  border-radius: 10px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  transition: all 0.22s ease;
}
.sp-feature-card:hover {
  background: rgba(255,255,255,0.04);
  border-color: rgba(255,255,255,0.1);
}

.sp-feature-enabled {
  border-color: rgba(16,185,129,0.3) !important;
}

.sp-feature-info h4 {
  font-size: 0.84rem;
  font-weight: 700;
  color: rgba(255,255,255,0.9);
}

.sp-feature-info p {
  font-size: 0.72rem;
  color: rgba(255,255,255,0.35);
  margin-top: 0.1rem;
}

.sp-feature-switch {
  border: none;
  font-family: inherit;
  font-size: 0.7rem;
  font-weight: 700;
  border-radius: 99px;
  padding: 0.3rem 0.55rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.sp-feature-switch.on {
  background: rgba(16,185,129,0.16);
  color: #34D399;
}

.sp-feature-switch.off {
  background: rgba(148,163,184,0.12);
  color: #94A3B8;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .sp-panel {
    width: 100vw;
    max-width: 100vw;
  }
}
`;
