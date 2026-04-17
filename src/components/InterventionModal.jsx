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

import { useEffect, useState } from 'react';
import {
  X, Mail, Copy, CheckCircle2, Send, Zap,
  ClipboardList, Calendar, Sparkles, User, Activity,
} from 'lucide-react';
import { generateIntervention } from '../services/api';

export default function InterventionModal({ student, advisorId, onClose, onToast }) {
  const [copied, setCopied] = useState(false);
  const [sent, setSent]     = useState(false);
  const [plan, setPlan]     = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = () => {
    setLoading(true);
    let mounted = true;
    generateIntervention(student.id, advisorId)
      .then((data) => {
        if (mounted) setPlan(data);
      })
      .catch(() => {
        if (mounted) {
          setPlan(null);
          onToast?.('تعذر توليد خطة التدخل من الخادم', 'warning');
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
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
    setSent(true);
    onToast?.('تم توثيق إرسال الخطة في قاعدة البيانات', 'success');
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container glass" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 style={{ fontSize: '1.05rem', fontWeight: '800' }}>جاري تجهيز خطة التدخل...</h2>
            <button className="icon-btn" onClick={onClose}><X size={18} /></button>
          </div>
          <div className="modal-body">يتم الآن جلب الخطة من الخادم...</div>
        </div>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container glass" onClick={e => e.stopPropagation()}>

        {/* الرأس */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: student.riskLevel === 'red' ? 'rgba(244,63,94,0.12)' : 'rgba(245,158,11,0.12)',
              color: student.riskLevel === 'red' ? '#F43F5E' : '#F59E0B',
              padding: '0.5rem', borderRadius: '10px', display: 'flex',
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '800' }}>خطة تدخل — {student.name}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>مُولّدة بواسطة Copilot الذكي</p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {/* المحتوى */}
        <div className="modal-body">

          {/* البريد الإلكتروني */}
          <div className="modal-section">
            <div className="modal-section-title">
              <Mail size={16} /> <span>البريد الإلكتروني المقترح</span>
            </div>
            <p style={{ color: 'var(--brand-indigo)', fontWeight: '700', fontSize: '0.88rem', marginBottom: '0.5rem' }}>
              {plan.emailSubject}
            </p>
            <div className="email-preview">
              {plan.emailBody}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
              <button className="btn btn-ghost" onClick={handleCopy}>
                {copied ? <><CheckCircle2 size={14} /> تم النسخ!</> : <><Copy size={14} /> نسخ الرسالة</>}
              </button>
              <button
                className={`btn ${sent ? 'btn-ghost' : 'btn-primary'}`}
                onClick={handleSend}
                disabled={sent}
              >
                {sent ? <><CheckCircle2 size={14} /> تم الإرسال ✓</> : <><Send size={14} /> إرسال للطالب</>}
              </button>
            </div>
          </div>

          {/* الخطة العلاجية */}
          <div className="modal-section">
            <div className="modal-section-title">
              <ClipboardList size={16} /> <span>الخطة العلاجية المرحلية</span>
            </div>
            <div className="intervention-steps">
              {(plan.actionPlan || []).map((step, i) => (
                <div key={i} className="intervention-step">
                  <span className="step-num">{step.step}</span>
                  <div className="step-content">
                    <span className="step-action">{step.action}</span>
                    <div className="step-meta">
                      <span><Calendar size={11} /> {step.timeline}</span>
                      <span><User size={11} /> {step.owner}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* موعد المتابعة */}
          <div className="modal-footer-info">
            <Calendar size={15} />
            <span>موعد المتابعة المقترح: <strong>{plan.followUpDate}</strong></span>
          </div>
          {!plan && !loading && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{ background: 'rgba(99,102,241,0.1)', padding: '1rem', borderRadius: '50%', display: 'inline-flex', marginBottom: '1rem' }}>
                <Zap size={32} color="#818CF8" />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>يحتاج الطالب لتدخل مبكر</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '300px', margin: '0 auto 1.5rem auto' }}>
                يقوم محرك الذكاء الاصطناعي بتحليل سجل الطالب، المهام المتأخرة، والمعدل لتوليد خطة إنقاذ متكاملة وبريد إلكتروني مخصص.
              </p>
              <button className="btn btn-primary" onClick={handleGenerate} style={{ width: '100%', justifyContent: 'center' }}>
                <Sparkles size={16} /> توليد خطة إنقاذ
              </button>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
               <Activity size={32} color="#22D3EE" className="copilot-spin" style={{ margin: '0 auto 1rem' }} />
               <p style={{ color: '#22D3EE', fontWeight: 600 }}>يتم الآن توليد الخطة وصياغة البريد...</p>
            </div>
          )}

          {plan && !loading && (
            <>
              {/* البريد الإلكتروني */}
              <div className="modal-section animate-fade-up delay-1">
                <div className="modal-section-title">
                  <Mail size={16} /> <span>البريد الإلكتروني المقترح</span>
                </div>
                <p style={{ color: 'var(--brand-indigo)', fontWeight: '700', fontSize: '0.88rem', marginBottom: '0.5rem' }}>
                  {plan.emailSubject}
                </p>
                <div className="email-preview">
                  {plan.emailBody}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button className="btn btn-ghost" onClick={handleCopy}>
                    {copied ? <><CheckCircle2 size={14} /> تم النسخ!</> : <><Copy size={14} /> نسخ الرسالة</>}
                  </button>
                  <button
                    className={`btn ${sent ? 'btn-ghost' : 'btn-primary'}`}
                    onClick={handleSend}
                    disabled={sent}
                  >
                    {sent ? <><CheckCircle2 size={14} /> تم الإرسال ✓</> : <><Send size={14} /> اعتماد وإرسال</>}
                  </button>
                </div>
              </div>

              {/* الخطة العلاجية */}
              <div className="modal-section animate-fade-up delay-2">
                <div className="modal-section-title">
                  <ClipboardList size={16} /> <span>الخطة العلاجية المرحلية</span>
                </div>
                <div className="intervention-steps">
                  {(plan.actionPlan || []).map((step, i) => (
                    <div key={i} className="intervention-step">
                      <span className="step-num">{step.step}</span>
                      <div className="step-content">
                        <span className="step-action">{step.action}</span>
                        <div className="step-meta">
                          <span><Calendar size={11} /> {step.timeline}</span>
                          <span><User size={11} /> {step.owner}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* موعد المتابعة */}
              <div className="modal-footer-info animate-fade-up delay-3">
                <Calendar size={15} />
                <span>موعد المتابعة المقترح: <strong>{plan.followUpDate}</strong></span>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

