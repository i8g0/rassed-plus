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
  getBeaconProactiveOpening,
} from '../services/api';
import { useSettings } from '../contexts/SettingsContext';
import { byLanguage, normalizeLanguage } from '../utils/localization';
import './AIChatbot.css';

const STUDENT_QUICK_ACTIONS_AR = ['كيف أرفع معدلي؟', 'أنا ضعيف في التفاضل', 'نصائح للمذاكرة', 'كيف أحسن حضوري؟', 'ساعدني أنظم وقتي'];
const STUDENT_QUICK_ACTIONS_EN = ['How can I raise my GPA?', 'I am weak in calculus', 'Study tips', 'How can I improve attendance?', 'Help me organize my time'];

const ADVISOR_QUICK_ACTIONS_AR = ['من أكثر الطلاب خطراً؟', 'لخص حالة الطلاب', 'اقترح خطة تدخل', 'ما أهم الإنذارات؟', 'تحليل أداء المجموعة'];
const ADVISOR_QUICK_ACTIONS_EN = ['Who are the highest-risk students?', 'Summarize student status', 'Suggest intervention plan', 'Top urgent alerts?', 'Analyze cohort performance'];

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
  const lang = normalizeLanguage(typeof document === 'undefined' ? 'ar' : document.documentElement?.lang || 'ar');
  return (
    <div className="typing-indicator">
      <div className="typing-dots">
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
      <span className="typing-text">{byLanguage(lang, 'يكتب...', 'Typing...')}</span>
    </div>
  );
}

function WelcomeMessage({ role, name, language }) {
  const lang = normalizeLanguage(language || 'ar');
  return (
    <div className="chat-welcome">
      <div className="chat-welcome-icon">
        <BrainCircuit size={28} />
      </div>
      <h4>{byLanguage(lang, `مرحباً ${name}! 👋`, `Welcome ${name}! 👋`)}</h4>
      <p>
        {role === 'student'
          ? byLanguage(lang, 'أنا منارة راصد. أحول أداءك الأكاديمي إلى خطة جدارة وفرص مهنية واضحة.', 'I am Manarat Rased. I turn your academic performance into a clear competency and career-action plan.')
          : byLanguage(lang, 'أنا منارة راصد. أحلل حالات الطلاب وأحوّلها لإجراءات عملية تقرّبهم من سوق العمل.', 'I am Manarat Rased. I analyze student cases and convert them into practical advisor actions.')}
      </p>
    </div>
  );
}

export default function AIChatbot({ user, role }) {
  const { settings } = useSettings();
  const language = normalizeLanguage(settings?.language || 'ar');
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

  const name = user?.name?.split(' ')[0] || byLanguage(language, 'مستخدم', 'User');
  const quickActions = role === 'advisor'
    ? byLanguage(language, ADVISOR_QUICK_ACTIONS_AR, ADVISOR_QUICK_ACTIONS_EN)
    : byLanguage(language, STUDENT_QUICK_ACTIONS_AR, STUDENT_QUICK_ACTIONS_EN);

  const timeLocale = language === 'en' ? 'en-US' : 'ar-SA';

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
    getSilentAnalysis(user.id, language)
      .then((data) => {
        if (data?.alerts?.length > 0) {
          setAlerts(data.alerts);
        }
      })
      .catch(() => {
        // Silent fail — alerts are optional
      });
  }, [isOpen, alertsLoaded, role, user?.id, language]);

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

  useEffect(() => {
    if (!isOpen || messages.length > 0) return;

    const studentOpening = byLanguage(
      language,
      'أهلاً بك، اكتب لي المادة أو المهمة التي تحتاج دعماً فيها وسأعطيك خطة قصيرة تناسب وضعك الأكاديمي.',
      'Welcome. Tell me the course or task you need support with, and I will give you a short plan that fits your academic status.',
    );

    if (role === 'student') {
      const now = new Date().toLocaleTimeString(timeLocale, { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => {
        if (prev.length > 0) return prev;
        return [...prev, { role: 'assistant', content: studentOpening, time: now }];
      });
      return;
    }

    getBeaconProactiveOpening(language)
      .then((brief) => {
        const msg = String(brief?.message || byLanguage(language, 'مرحباً بك، هذه لمحة سريعة عن مؤشرات الطلاب الأكثر أولوية حالياً.', 'Welcome. Here is a quick snapshot of highest-priority student indicators.')).trim();
        const now = new Date().toLocaleTimeString(timeLocale, { hour: '2-digit', minute: '2-digit' });
        setMessages((prev) => {
          if (prev.length > 0) return prev;
          return [...prev, { role: 'assistant', content: msg, time: now }];
        });
      })
      .catch(() => {});
  }, [isOpen, messages.length, role, language, timeLocale]);

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
    const now = new Date().toLocaleTimeString(timeLocale, { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { role: 'user', content: msg, time: now }]);
    setInput('');
    setIsLoading(true);

    try {
      let response;
      if (role === 'student') {
        const result = await sendStudentChat(user.id, msg, sessionId, language);
        response = result?.response;
        if (result?.session_id) setSessionId(result.session_id);
      } else {
        const result = await sendAdvisorChat(user.id, msg, null, language);
        response = result?.response;
      }

      const replyTime = new Date().toLocaleTimeString(timeLocale, { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: response || byLanguage(language, 'تعذر استلام رد من الذكاء الاصطناعي.', 'Failed to receive an AI response.'),
        time: replyTime,
      }]);
    } catch {
      const errTime = new Date().toLocaleTimeString(timeLocale, { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: byLanguage(language, 'عذراً، حدث خطأ في الاتصال بالذكاء الاصطناعي. يرجى المحاولة مرة أخرى. 🔄', 'Sorry, there was a connection error with AI. Please try again. 🔄'),
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
        title={byLanguage(language, 'المرشد الذكي', 'Smart Advisor')}
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
                <h3>{byLanguage(language, 'منارة راصد', 'Manarat Rased')}</h3>
                <span>
                  <span className="chatbot-online-dot" />
                  {byLanguage(language, 'متصل الآن', 'Online now')}
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
              <WelcomeMessage role={role} name={name} language={language} />
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
                  <div className="chat-bubble" dir="auto">{msg.content}</div>
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
              placeholder={role === 'student'
                ? byLanguage(language, 'اسأل مرشدك الذكي...', 'Ask your smart advisor...')
                : byLanguage(language, 'اسأل عن طلابك...', 'Ask about your students...')}
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
