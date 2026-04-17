/**
 * AIChatbot.jsx — المرشد الذكي (AI Chat Assistant)
 * 
 * ✅ Chatbot عائم يظهر لكل المستخدمين (طالب/مشرف)
 * ✅ تحليل صامت مع إنذارات استباقية عند الفتح
 * ✅ محادثة ذكية مع DeepSeek AI
 * ✅ أسئلة سريعة مقترحة
 * ✅ تصميم premium مع أنيميشن
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageCircle, X, Send, Sparkles, Bot,
  AlertTriangle, AlertCircle, Info, Lightbulb,
  BrainCircuit, User,
} from 'lucide-react';
import {
  sendStudentChat,
  sendAdvisorChat,
  getSilentAnalysis,
  getChatHistory,
} from '../services/api';
import './AIChatbot.css';

const STUDENT_QUICK_ACTIONS = [
  'كيف أرفع معدلي؟',
  'أنا ضعيف في التفاضل',
  'نصائح للمذاكرة',
  'كيف أحسن حضوري؟',
  'ساعدني أنظم وقتي',
];

const ADVISOR_QUICK_ACTIONS = [
  'من أكثر الطلاب خطراً؟',
  'لخص حالة الطلاب',
  'اقترح خطة تدخل',
  'ما أهم الإنذارات؟',
  'تحليل أداء المجموعة',
];

const ALERT_ICONS = {
  danger: AlertTriangle,
  warning: AlertCircle,
  info: Info,
};

function AlertCard({ alert }) {
  const Icon = ALERT_ICONS[alert.type] || Info;
  return (
    <div className={`chat-alert ${alert.type}`}>
      <div className="chat-alert-header">
        <Icon size={15} />
        <span>{alert.title}</span>
      </div>
      <div className="chat-alert-body">{alert.message}</div>
      {alert.suggestion && (
        <div className="chat-alert-suggestion">
          <Lightbulb size={12} />
          {alert.suggestion}
        </div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="typing-indicator">
      <div className="typing-dots">
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
      <span className="typing-text">يكتب...</span>
    </div>
  );
}

function WelcomeMessage({ role, name }) {
  return (
    <div className="chat-welcome">
      <div className="chat-welcome-icon">
        <BrainCircuit size={28} />
      </div>
      <h4>مرحباً {name}! 👋</h4>
      <p>
        {role === 'student'
          ? 'أنا مرشدك الأكاديمي الذكي. اسألني أي سؤال عن دراستك، معدلك، أو أي تحدي تواجهه — وسأساعدك بخطة واضحة!'
          : 'أنا مساعدك الذكي. يمكنني تحليل حالات الطلاب، تلخيص الإنذارات، واقتراح خطط تدخل فورية.'}
      </p>
    </div>
  );
}

export default function AIChatbot({ user, role }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [alertsLoaded, setAlertsLoaded] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const name = user?.name?.split(' ')[0] || 'مستخدم';
  const quickActions = role === 'advisor' ? ADVISOR_QUICK_ACTIONS : STUDENT_QUICK_ACTIONS;

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  // Load silent analysis when chatbot opens (student only)
  useEffect(() => {
    if (!isOpen || alertsLoaded || role !== 'student' || !user?.id) return;

    setAlertsLoaded(true);
    getSilentAnalysis(user.id)
      .then((data) => {
        if (data?.alerts?.length > 0) {
          setAlerts(data.alerts);
        }
      })
      .catch(() => {
        // Silent fail — alerts are optional
      });
  }, [isOpen, alertsLoaded, role, user?.id]);

  // Load chat history on first open
  useEffect(() => {
    if (!isOpen || messages.length > 0 || role !== 'student' || !user?.id) return;

    getChatHistory(user.id)
      .then((history) => {
        if (history?.length > 0) {
          const mapped = history.map((m) => ({
            role: m.role,
            content: m.content,
            time: m.created_at?.slice(11, 16) || '',
          }));
          setMessages(mapped);
          scrollToBottom();
        }
      })
      .catch(() => {});
  }, [isOpen, messages.length, role, user?.id, scrollToBottom]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsClosing(false);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300);
  };

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg || isLoading) return;

    // Add user message
    const now = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { role: 'user', content: msg, time: now }]);
    setInput('');
    setIsLoading(true);

    try {
      let response;
      if (role === 'student') {
        const result = await sendStudentChat(user.id, msg, sessionId);
        response = result.response;
        if (result.session_id) setSessionId(result.session_id);
      } else {
        const result = await sendAdvisorChat(user.id, msg);
        response = result.response;
      }

      const replyTime = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [...prev, { role: 'assistant', content: response, time: replyTime }]);
    } catch {
      const errTime = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'عذراً، حدث خطأ في الاتصال بالذكاء الاصطناعي. يرجى المحاولة مرة أخرى. 🔄',
          time: errTime,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasAlerts = alerts.length > 0;

  return (
    <>
      {/* Floating Action Button */}
      <button
        className={`chatbot-fab ${hasAlerts && !isOpen ? 'has-alerts' : ''}`}
        onClick={isOpen ? handleClose : handleOpen}
        title="المرشد الذكي"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        {hasAlerts && !isOpen && (
          <span className="chatbot-fab-badge">{alerts.length}</span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={`chatbot-overlay ${isClosing ? 'closing' : ''}`}>
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">
                <Bot size={22} />
              </div>
              <div className="chatbot-header-text">
                <h3>مُرشد راصد</h3>
                <span>
                  <span className="chatbot-online-dot" />
                  متصل الآن
                </span>
              </div>
            </div>
            <button className="chatbot-close-btn" onClick={handleClose}>
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.length === 0 && alerts.length === 0 && (
              <WelcomeMessage role={role} name={name} />
            )}

            {/* Proactive Alerts */}
            {alerts.map((alert, i) => (
              <AlertCard key={`alert-${i}`} alert={alert} />
            ))}

            {/* Chat Messages */}
            {messages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.role}`}>
                <div className="chat-msg-avatar">
                  {msg.role === 'user' ? <User size={14} /> : <Sparkles size={14} />}
                </div>
                <div>
                  <div className="chat-bubble">{msg.content}</div>
                  {msg.time && <span className="chat-msg-time">{msg.time}</span>}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length === 0 && (
            <div className="chat-quick-actions">
              {quickActions.map((q, i) => (
                <button
                  key={i}
                  className="chat-quick-btn"
                  onClick={() => handleSend(q)}
                  disabled={isLoading}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="chatbot-input-area">
            <button
              className="chatbot-send-btn"
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
            >
              <Send size={18} />
            </button>
            <input
              ref={inputRef}
              className="chatbot-input"
              type="text"
              placeholder={role === 'student' ? 'اسأل مرشدك الذكي...' : 'اسأل عن طلابك...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
          </div>
        </div>
      )}
    </>
  );
}
