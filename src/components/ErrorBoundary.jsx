import React from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * ErrorBoundary — يلتقط أي خطأ في شجرة الرندر ويعرض رسالة بديلة
 * بدلاً من إسقاط التطبيق بالكامل (White Screen of Death).
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught render crash:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass panel-card" style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#fda4af',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <AlertTriangle size={40} />
          <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>
            عذراً، حدث خطأ غير متوقع
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '400px' }}>
            تعذر عرض هذا القسم. يرجى تحديث الصفحة أو المحاولة لاحقاً.
          </p>
          <button
            className="btn btn-ghost"
            style={{ width: 'auto' }}
            onClick={() => {
              this.setState({ hasError: false, error: null });
            }}
          >
            إعادة المحاولة
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
