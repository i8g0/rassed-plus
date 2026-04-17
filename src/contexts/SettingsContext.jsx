/* eslint-disable react-refresh/only-export-components */
/**
 * contexts/SettingsContext.jsx — نظام الإعدادات العالمي
 *
 * 🎨 يدير إعدادات التطبيق مركزياً: المظهر (داكن/فاتح/تلقائي) واللغة
 * 💾 يحفظ في LocalStorage تلقائياً
 * 🎯 يحقن CSS Variables و data-theme على :root فوراً
 */

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const SettingsContext = createContext(null);

const STORAGE_KEY = 'rased-plus-settings';

const DEFAULT_SETTINGS = {
  theme: 'dark',
  language: 'ar',
  animations: true,
  sounds: true,
  color_accent: '#2dd4bf',
};

function applyMotionPreference(enabled) {
  const root = document.documentElement;
  const styleId = 'rased-motion-control';
  const existing = document.getElementById(styleId);

  if (enabled) {
    root.removeAttribute('data-motion');
    if (existing) existing.remove();
    return;
  }

  root.setAttribute('data-motion', 'off');
  if (!existing) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = '*{animation:none !important;transition:none !important;scroll-behavior:auto !important;}';
    document.head.appendChild(style);
  }
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch {
    // تالف — نستخدم الافتراضي
  }
  return { ...DEFAULT_SETTINGS };
}

function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // quota exceeded
  }
}

function resolveTheme(theme) {
  if (theme === 'auto') {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  return theme;
}

/**
 * حقن CSS Variables + data-theme + dir على document مباشرة
 * كل تغيير ينعكس فوراً على كامل التطبيق بدون reload
 */
function applyToDOM(settings) {
  const root = document.documentElement;
  const resolved = resolveTheme(settings.theme);

  // ═══ المظهر — يغير data-theme attribute على <html> ═══
  root.setAttribute('data-theme', resolved);

  // حقن متغيرات CSS حسب الثيم
  if (resolved === 'light') {
    root.style.setProperty('--bg-primary', '#F0F4F8');
    root.style.setProperty('--bg-secondary', '#FFFFFF');
    root.style.setProperty('--bg-card', 'rgba(255,255,255,0.85)');
    root.style.setProperty('--text-primary', '#1E293B');
    root.style.setProperty('--text-secondary', '#475569');
    root.style.setProperty('--text-muted', '#94A3B8');
    root.style.setProperty('--glass-bg', 'rgba(255,255,255,0.72)');
    root.style.setProperty('--glass-border', 'rgba(0,0,0,0.06)');
  } else {
    root.style.setProperty('--bg-primary', '#06080F');
    root.style.setProperty('--bg-secondary', '#0D1117');
    root.style.setProperty('--bg-card', 'rgba(15,18,30,0.7)');
    root.style.setProperty('--text-primary', '#EAECF5');
    root.style.setProperty('--text-secondary', 'rgba(255,255,255,0.7)');
    root.style.setProperty('--text-muted', 'rgba(255,255,255,0.35)');
    root.style.setProperty('--glass-bg', 'rgba(15,18,30,0.55)');
    root.style.setProperty('--glass-border', 'rgba(255,255,255,0.06)');
  }

  // ═══ اللون الأساسي — ينعكس فوراً على متغيرات التصميم ═══
  const accent = settings.color_accent || '#2dd4bf';
  root.style.setProperty('--brand-primary', accent);
  root.style.setProperty('--brand-cyan', accent);

  // ═══ الحركة والصوت — تفعيل/تعطيل على DOM ═══
  applyMotionPreference(Boolean(settings.animations));
  root.setAttribute('data-sounds', settings.sounds ? 'on' : 'off');

  // ═══ اللغة — يغير dir و lang على <html> ═══
  root.dir = settings.language === 'en' ? 'ltr' : 'rtl';
  root.lang = settings.language || 'ar';
}

// ─── Provider ──────────────────────────────────────────────────────────────
export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings);

  // حقن على DOM + حفظ في localStorage عند كل تغيير
  useEffect(() => {
    applyToDOM(settings);
    saveSettings(settings);
  }, [settings]);

  // مراقبة system theme إذا كان auto
  useEffect(() => {
    if (settings.theme !== 'auto') return;
    const mql = window.matchMedia('(prefers-color-scheme: light)');
    const handler = () => applyToDOM(settings);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [settings]);

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings({ ...DEFAULT_SETTINGS });
  }, []);

  const ctx = useMemo(() => ({
    settings,
    updateSetting,
    resetSettings,
    resolvedTheme: resolveTheme(settings.theme),
  }), [settings, updateSetting, resetSettings]);

  return (
    <SettingsContext.Provider value={ctx}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

export default SettingsContext;
