import { useEffect, useMemo, useState } from 'react';
import { Sparkles, Power, ShieldCheck, Rocket, Bot } from 'lucide-react';
import { getFeatures, toggleFeature } from '../services/api';

const CATEGORY_META = {
  student: {
    title: 'ميزات الطلاب',
    subtitle: '40 ميزة',
    icon: Rocket,
    color: '#10B981',
  },
  advisor: {
    title: 'ميزات المرشد والجامعة',
    subtitle: '30 ميزة',
    icon: ShieldCheck,
    color: '#F59E0B',
  },
  ai: {
    title: 'ميزات الذكاء الاصطناعي',
    subtitle: '30 ميزة',
    icon: Bot,
    color: '#818CF8',
  },
};

function FeatureCard({ feature, onToggle, busy }) {
  return (
    <div className={`feature-card glass ${feature.enabled ? 'is-enabled' : ''}`}>
      <div className="feature-top">
        <div>
          <h4>{feature.name}</h4>
          <p>{feature.description}</p>
        </div>
        <button
          className={`feature-switch ${feature.enabled ? 'on' : 'off'}`}
          onClick={() => onToggle(feature)}
          disabled={busy}
        >
          <Power size={14} /> {feature.enabled ? 'مفعلة' : 'موقفة'}
        </button>
      </div>
      <span className="feature-code">{feature.code}</span>
    </div>
  );
}

export default function FeaturesHub({ onToast }) {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyCode, setBusyCode] = useState(null);

  useEffect(() => {
    let mounted = true;
    getFeatures()
      .then((data) => {
        if (mounted) setFeatures(data);
      })
      .catch(() => {
        if (mounted) onToast?.('تعذر تحميل الميزات من الخادم', 'warning');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [onToast]);

  const grouped = useMemo(() => {
    return {
      student: features.filter((f) => f.category === 'student'),
      advisor: features.filter((f) => f.category === 'advisor'),
      ai: features.filter((f) => f.category === 'ai'),
    };
  }, [features]);

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

  if (loading) {
    return (
      <div className="features-hub animate-fade-up">
        <div className="glass panel-card">جاري تحميل مركز الميزات الأسطورية...</div>
      </div>
    );
  }

  return (
    <div className="features-hub animate-fade-up">
      <section className="glass features-hero">
        <div>
          <p className="features-overline"><Sparkles size={15} /> Product Visionary Mode</p>
          <h2>مركز الميزات الأسطورية</h2>
          <p>100 ميزة قابلة للتفعيل لحظياً، مع مزامنة مباشرة في قاعدة البيانات.</p>
        </div>
        <div className="features-kpi">
          <span>{enabledCount}</span>
          <small>ميزة مفعلة الآن</small>
        </div>
      </section>

      {Object.entries(CATEGORY_META).map(([key, meta]) => {
        const Icon = meta.icon;
        const list = grouped[key] || [];
        return (
          <section key={key} className="features-group">
            <div className="features-group-head">
              <div className="features-title" style={{ color: meta.color }}>
                <Icon size={18} /> {meta.title}
              </div>
              <span className="badge" style={{ background: `${meta.color}22`, color: meta.color }}>
                {meta.subtitle} • {list.filter((f) => f.enabled).length} مفعلة
              </span>
            </div>
            <div className="features-grid">
              {list.map((feature) => (
                <FeatureCard
                  key={feature.code}
                  feature={feature}
                  onToggle={handleToggle}
                  busy={busyCode === feature.code}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
