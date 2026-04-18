/**
 * InterventionModal.jsx
 * نافذة "خطة التدخل بنقرة واحدة" — يستخدمها المرشد الأكاديمي
 * 
 * تعرض:
 *   - البريد الإلكتروني المُولّد تلقائياً
 *   - الخطة العلاجية المرحلية
 *   - موعد المتابعة
 *   - زر "نسخ الرسالة" وزر "إرسال" (محاكاة)
 */

import React, { useEffect, useState } from 'react';
import {
  X, Mail, Copy, CheckCircle2, Send, Zap,
  ClipboardList, Calendar, Sparkles, User, Activity,
} from 'lucide-react';
import { useRased } from '../contexts/RasedContext';
import { useLanguage } from '../contexts/LanguageProvider';

export default function InterventionModal({ student, onClose, onToast }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [sent, setSent]     = useState(false);
  const [plan, setPlan]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState({});
  const { triggerGenerateIntervention } = useRased();

  useEffect(() => {
    if (!student?.id) return;
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student?.id]);

  const handleGenerate = async () => {
    setLoading(true);
    setSent(false);
    setCompletedSteps({});
    try {
      const data = await triggerGenerateIntervention(student?.id);
      setPlan(data);
    } catch {
      setPlan(null);
      onToast?.(t('intervention.generateFailed'), 'warning');
    } finally {
      setLoading(false);
    }
  };
  const handleCopy = async () => {
    if (!plan) return;
    try {
      await navigator.clipboard.writeText(plan.emailBody || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select all text
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSend = () => {
    try {
      setSent(true);
      onToast?.(t('intervention.planSentSuccess'), 'success');
    } catch (err) {
      console.error('Send intervention action failed:', err);
      onToast?.(t('intervention.planSendFailed'), 'warning');
    }
  };

  const handleToggleStep = (index) => {
    try {
      setCompletedSteps((prev) => ({ ...prev, [index]: !prev[index] }));
    } catch (err) {
      console.error('Toggle intervention step failed:', err);
      onToast?.(t('intervention.toggleStepFailed'), 'warning');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container glass" onClick={e => e.stopPropagation()}>

        {/* الرأس */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: student?.riskLevel === 'red' ? 'rgba(244,63,94,0.12)' : 'rgba(245,158,11,0.12)',
              color: student?.riskLevel === 'red' ? '#fda4af' : '#fbbf24',
              padding: '0.5rem', borderRadius: '10px', display: 'flex',
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '800' }}>{t('intervention.planTitle', { name: student?.name })}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{t('intervention.generatedBy')}</p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {/* المحتوى */}
        <div className="modal-body">
          {!plan && !loading && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{ background: 'rgba(45,212,191,0.1)', padding: '1rem', borderRadius: '50%', display: 'inline-flex', marginBottom: '1rem' }}>
                <Zap size={32} color="#2dd4bf" />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{t('intervention.needsIntervention')}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '300px', margin: '0 auto 1.5rem auto' }}>
                {t('intervention.aiAnalyzing')}
              </p>
              <button className="btn btn-primary" onClick={handleGenerate} style={{ width: '100%', justifyContent: 'center' }}>
                <Sparkles size={16} /> {t('intervention.generatePlan')}
              </button>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
               <Activity size={32} color="#2dd4bf" className="copilot-spin" style={{ margin: '0 auto 1rem' }} />
               <p style={{ color: '#2dd4bf', fontWeight: 600 }}>{t('intervention.generating')}</p>
            </div>
          )}

          {plan && !loading && (
            <>
              {/* البريد الإلكتروني */}
              <div className="modal-section animate-fade-up delay-1">
                <div className="modal-section-title">
                  <Mail size={16} /> <span>{t('intervention.suggestedEmail')}</span>
                </div>
                <p style={{ color: 'var(--brand-indigo)', fontWeight: '700', fontSize: '0.88rem', marginBottom: '0.5rem' }}>
                  {plan.emailSubject}
                </p>
                <div className="email-preview" dir="auto">
                  {plan.emailBody}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button className="btn btn-ghost" onClick={handleCopy}>
                    {copied ? <><CheckCircle2 size={14} /> {t('intervention.copied')}</> : <><Copy size={14} /> {t('intervention.copyMessage')}</>}
                  </button>
                  <button
                    className={`btn ${sent ? 'btn-ghost' : 'btn-primary'}`}
                    onClick={handleSend}
                    disabled={sent}
                  >
                    {sent ? <><CheckCircle2 size={14} /> {t('intervention.sent')}</> : <><Send size={14} /> {t('intervention.approveAndSend')}</>}
                  </button>
                </div>
              </div>

              {/* الخطة العلاجية */}
              <div className="modal-section animate-fade-up delay-2">
                <div className="modal-section-title">
                  <ClipboardList size={16} /> <span>{t('intervention.remedialPlan')}</span>
                </div>
                <div className="intervention-steps">
                  {(Array.isArray(plan?.actionPlan) ? plan.actionPlan : []).map((step, i) => (
                    <div key={i} className="intervention-step" style={{ opacity: completedSteps?.[i] ? 0.55 : 1, transition: 'opacity 0.25s ease' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleStep(i)}
                        className="step-num"
                        style={{
                          border: completedSteps?.[i] ? '1px solid rgba(110,231,183,0.5)' : undefined,
                          background: completedSteps?.[i] ? 'rgba(110,231,183,0.15)' : undefined,
                          color: completedSteps?.[i] ? '#6ee7b7' : undefined,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        aria-label={t('intervention.toggleStepAriaLabel', { step: step?.action || i + 1 })}
                      >
                        {completedSteps?.[i] ? '✓' : step?.step}
                      </button>
                      <div className="step-content">
                        <span className="step-action" dir="auto" style={{ textDecoration: completedSteps?.[i] ? 'line-through' : 'none' }}>{step?.action}</span>
                        <div className="step-meta">
                          <span><Calendar size={11} /> {step?.timeline}</span>
                          <span><User size={11} /> {step?.owner}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-footer-info animate-fade-up delay-3">
                <Calendar size={15} />
                <span>{t('intervention.followUpDate')} <strong>{plan?.followUpDate || t('intervention.undetermined')}</strong></span>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

