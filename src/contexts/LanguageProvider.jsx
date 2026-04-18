/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useEffect, useCallback } from 'react';
import { useSettings } from './SettingsContext';
import { normalizeLanguage } from '../utils/localization';

const LanguageContext = createContext(null);

const DICTIONARY = {
  ar: {
    common: {
      na: 'غير متاح',
      loading: 'جاري التحميل...',
      retry: 'حاول مجدداً',
      student: 'الطالب',
      studentPlaceholder: 'طالب',
      courseCs: 'علوم الحاسب',
      aiSummary: 'ملخص AI',
      viewProfile: 'عرض الملف',
      interventionPlan: 'خطة تدخل',
      maleStudentWord: 'طالب',
      femaleStudentWord: 'طالبة',
    },
    advisor: {
      briefTitle: 'ملخص الذكاء الاصطناعي',
      loadingBrief: 'جاري تحليل بيانات الطالب ومحادثاته مع المرشد الذكي...',
      loadBriefFailed: 'تعذر تحميل الملخص.',
      urgency: 'أولوية',
      urgencyHigh: 'عاجل',
      urgencyMedium: 'متوسط',
      urgencyLow: 'منخفض',
      cloAnalysis: 'تحليل مخرجات التعلم (CLOs)',
      cumulativeGaps: 'الفجوات المعرفية التراكمية',
      submissionPattern: 'نمط تسليم المهام',
      assessmentMetrics: 'مقاييس التقييم',
      midterm: 'الاختبار النصفي',
      projectsAssignments: 'المشاريع والواجبات',
      recommendations: 'التوصيات',
      close: 'إغلاق',
      digitalBehaviorReport: 'تقرير تحليل السلوك الرقمي',
      noReport: 'لا يوجد تقرير متاح.',
      smartTriage: 'الفرز الذكي',
      sortedByRisk: 'مرتب حسب الخطورة',
      totalStudents: 'إجمالي الطلاب',
      liveUpdated: 'محدث مباشرة',
      interventionsToday: 'تدخلات مطلوبة اليوم',
      urgentLabel: 'عاجل',
      monitorLabel: 'مراقبة',
      successfulInterventions: 'تدخلات ناجحة',
      successRatePrefix: 'نسبة النجاح',
      gpaLabel: 'المعدل',
      riskLabel: 'الخطورة',
      peerMatch: 'توأمة',
      searching: 'جاري البحث...',
      escalateCase: 'تصعيد الحالة',
      mentorEdition: 'نسخة المرشد',
      disengagementRadar: 'رادار التفكك الدراسي',
      noActiveCases: 'لا توجد حالات تفكك دراسي نشطة حالياً.',
      passivePresence: 'تواجد رقمي سلبي',
      behavioralSeparation: 'انفصال سلوكي متزايد',
      analyzeDigitalBehavior: 'تحليل السلوك الرقمي',
      analyzing: 'جاري التحليل...',
      sendAlert: 'إرسال تنبيه',
      riskIndicator: 'مؤشر الخطر',
      fileAccess: 'فتح الملفات',
      automationBoard: 'لوحة تحكم منارة راصد',
      rescanning: 'إعادة المسح',
      thinking: 'يفكر...',
      magicCommand: 'أمر من منارة راصد: نفذ الحلول',
      executedActions: 'تم تنفيذ {{count}} قرارات إرشادية تلقائية',
      urgentAlerts: 'تنبيهات تدخل عاجل',
      urgentAlertType: 'تنبيه عاجل',
      smartPairingCards: 'بطاقات التوأمة الذكية',
      instantReports: 'مسودة تقارير أكاديمية فورية',
      allStudents: 'جميع الطلاب',
      studentsCount: '{{count}} طالب',
      searchByNameOrId: 'ابحث بالاسم أو الرقم...',
      filterAll: 'الكل',
      filterRisk: '🔴 خطر',
      filterWarning: '🟡 تحذير',
      filterSafe: '🟢 سليم',
      yearPrefix: 'السنة',
      attendance: 'الحضور',
      tasksCompletion: 'إكمال المهام',
      interventionsLog: 'سجل التدخلات',
      completedCount: '{{count}} مكتمل',
      statusSent: 'تم الإرسال',
      statusMeeting: 'لقاء',
      statusCompleted: 'مكتمل',
      statusFollowup: 'متابعة',
      highRiskCourses: 'مقررات عالية الخطورة',
      monitoredCourses: 'مقررات تحت المراقبة',
      stableCourses: 'مقررات مستقرة',
      avgFailRate: 'متوسط نسبة الرسوب',
      failRatesByCourse: 'نسب الرسوب حسب المقرر',
      aiFiltered: 'مُرشح بالذكاء الاصطناعي',
      studentsWord: 'طالب',
      riskStatus: 'خطر',
      warningStatus: 'تحذير',
      safeStatus: 'سليم',
      detailedCourseAnalysis: 'تحليل تفصيلي للمقررات',
      failRate: 'نسبة الرسوب',
      avgGrade: 'المعدل العام',
      courseNeedsFollowup: 'المقرر في مستوى إنذار «{{level}}» ويحتاج متابعة أكاديمية.',
      recommendationText: 'توصية: تعزيز المحتوى التطبيقي والتقييم التكويني التدريجي.',
      peerRequestSent: 'تم إرسال طلب توأمة أكاديمية لـ {{name}}',
      peerFailed: 'تعذرت عملية التوأمة من الخادم',
      escalated: 'تم تصعيد حالة {{name}} للتدخل المكثف',
      escalateFailed: 'تعذر تصعيد الحالة حالياً',
      alertSent: 'تم ارسال تنبيه',
      peerWorkflowFailed: 'تعذرت محاولة التوأمة حالياً.',
      behaviorReportFailed: 'تعذر إنشاء التقرير حالياً. حاول مرة أخرى.',
    },
    student: {
      welcome: 'مرحباً يا {{name}}',
      loadingStatus: 'جاري التحميل',
      streakDays: 'أيام متواصلة',
      gpa: 'المعدل',
      tasksProgress: 'إنجاز المهام',
      adaptiveGuidance: 'التوجيه التكيفي',
      suggestionsCount: '{{count}} اقتراح',
      selectedOption: 'تم اختيار: {{label}}',
      saveAdaptiveFailed: 'تعذر حفظ اختيار التوجيه في الحائط الأكاديمي',
      peerMatching: 'التوأمة الأكاديمية',
      highCompatibility: 'توافق عالي',
      needPrefix: 'يحتاج',
      compatibility: 'توافق',
      defaultWeakSkill: 'الرياضيات',
      selectedPeerFallback: 'الزميل المختار',
      requestAlreadySent: 'الطلب مُرسل مسبقاً لـ {{name}}',
      scheduledWith: 'تمت جدولة الجلسة بنجاح مع {{name}}',
      peerServerFailed: 'تعذرت عملية التوأمة الذكية من الخادم حالياً. حاول لاحقاً.',
      searchingForPeer: 'جاري البحث عن {{name}}...',
      requestedWaiting: 'تم الطلب — في انتظار الرد',
      scheduleSessionWith: 'جدولة جلسة مع {{name}}',
      skillsCompass: 'بوصلة المهارات',
      jobMarket: 'سوق العمل',
      opportunityNow: 'فرصة الآن',
      levelYour: 'مستواك',
      employmentBoost: 'فرص التوظيف',
      openCourse: 'تم فتح {{course}} على {{platform}}',
      openCourseFailed: 'تعذر فتح رابط الدورة حالياً',
      smartTasks: 'المهام الذكية',
      activeCount: '{{count}} نشط',
      splitTask: 'قسّم المهمة',
      startNowFirstStep: 'ابدأ الآن — الخطوة الأولى',
      taskStarted: 'تم بدء المهمة! الخطوة الأولى أمامك الآن 🚀',
      taskStartedNote: 'بدأت! استمر بهذا الزخم 🚀',
      stepCompleted: 'تم إكمال الخطوة {{step}} ✅',
      adaptiveGenerated: 'تم استخدام التوجيه التكيفي ذكائياً!',
      adaptiveError: 'حدث خطأ أثناء التوليد',
      contentTooComplex: 'يبدو أن هذا المحتوى النصي معقد، هل تفضل تحويله الآن؟',
      mindMap: 'خريطة ذهنية',
      mindMapLabel: 'الخريطة الذهنية',
      audioClip: 'مقطع صوتي',
      audioLabel: 'المقطع الصوتي',
      smartAnalyzing: 'يتم التحليل الذكي...',
      proactivePreparing: 'يتم التجهيز الاستباقي...',
      suggestedPlan: 'الخطة المقترحة — إجمالي: ~2.7 ساعة',
      autoMessageTitle: 'رسالة منارة راصد التلقائية',
      studentDataSync: 'جاري مزامنة بيانات الطالب...',
      retry: 'حاول مجدداً',
    },
  },
  en: {
    common: {
      na: 'N/A',
      loading: 'Loading...',
      retry: 'Try again',
      student: 'Student',
      studentPlaceholder: 'Student',
      courseCs: 'Computer Science',
      aiSummary: 'AI Summary',
      viewProfile: 'View Profile',
      interventionPlan: 'Intervention Plan',
      maleStudentWord: 'student',
      femaleStudentWord: 'student',
    },
    advisor: {
      briefTitle: 'AI Brief',
      loadingBrief: 'Analyzing student data and advisor chat history...',
      loadBriefFailed: 'Failed to load the brief.',
      urgency: 'Priority',
      urgencyHigh: 'High',
      urgencyMedium: 'Medium',
      urgencyLow: 'Low',
      cloAnalysis: 'CLO Analysis',
      cumulativeGaps: 'Cumulative Knowledge Gaps',
      submissionPattern: 'Submission Pattern',
      assessmentMetrics: 'Assessment Metrics',
      midterm: 'Midterm',
      projectsAssignments: 'Projects & Assignments',
      recommendations: 'Recommendations',
      close: 'Close',
      digitalBehaviorReport: 'Digital Behavior Analysis Report',
      noReport: 'No report available.',
      smartTriage: 'Smart Triage',
      sortedByRisk: 'Sorted by risk',
      totalStudents: 'Total Students',
      liveUpdated: 'Live updated',
      interventionsToday: 'Interventions Today',
      urgentLabel: 'Urgent',
      monitorLabel: 'Monitor',
      successfulInterventions: 'Successful Interventions',
      successRatePrefix: 'Success rate',
      gpaLabel: 'GPA',
      riskLabel: 'Risk',
      peerMatch: 'Peer Match',
      searching: 'Searching...',
      escalateCase: 'Escalate Case',
      mentorEdition: 'Advisor Edition',
      disengagementRadar: 'Disengagement Radar',
      noActiveCases: 'No active disengagement cases right now.',
      passivePresence: 'Passive Presence',
      behavioralSeparation: 'Behavioral Drift',
      analyzeDigitalBehavior: 'Analyze Digital Behavior',
      analyzing: 'Analyzing...',
      sendAlert: 'Send Alert',
      riskIndicator: 'Risk Indicator',
      fileAccess: 'File Access',
      automationBoard: 'Manarat Rased Control Board',
      rescanning: 'Rescan',
      thinking: 'Thinking...',
      magicCommand: 'Manarat Command: Execute Solutions',
      executedActions: 'Executed {{count}} autonomous advisory actions',
      urgentAlerts: 'Urgent Intervention Alerts',
      urgentAlertType: 'Urgent alert',
      smartPairingCards: 'Smart Pairing Cards',
      instantReports: 'Instant Academic Report Drafts',
      allStudents: 'All Students',
      studentsCount: '{{count}} students',
      searchByNameOrId: 'Search by name or ID...',
      filterAll: 'All',
      filterRisk: '🔴 Risk',
      filterWarning: '🟡 Warning',
      filterSafe: '🟢 Safe',
      yearPrefix: 'Year',
      attendance: 'Attendance',
      tasksCompletion: 'Task Completion',
      interventionsLog: 'Interventions Log',
      completedCount: '{{count}} completed',
      statusSent: 'Sent',
      statusMeeting: 'Meeting',
      statusCompleted: 'Completed',
      statusFollowup: 'Follow-up',
      highRiskCourses: 'High-Risk Courses',
      monitoredCourses: 'Courses Under Monitoring',
      stableCourses: 'Stable Courses',
      avgFailRate: 'Average Fail Rate',
      failRatesByCourse: 'Fail Rates by Course',
      aiFiltered: 'AI Filtered',
      studentsWord: 'students',
      riskStatus: 'Risk',
      warningStatus: 'Warning',
      safeStatus: 'Safe',
      detailedCourseAnalysis: 'Detailed Course Analysis',
      failRate: 'Fail Rate',
      avgGrade: 'Average Grade',
      courseNeedsFollowup: 'This course is at "{{level}}" alert level and requires academic follow-up.',
      recommendationText: 'Recommendation: reinforce practical content and progressive formative assessment.',
      peerRequestSent: 'Academic peer request sent to {{name}}',
      peerFailed: 'Peer matchmaking failed from server',
      escalated: 'Case for {{name}} escalated to intensive intervention',
      escalateFailed: 'Unable to escalate case right now',
      alertSent: 'Alert sent',
      peerWorkflowFailed: 'Unable to run peer workflow right now.',
      behaviorReportFailed: 'Unable to generate report now. Please try again.',
    },
    student: {
      welcome: 'Hi {{name}}',
      loadingStatus: 'Loading...',
      streakDays: 'day streak',
      gpa: 'GPA',
      tasksProgress: 'Task Progress',
      adaptiveGuidance: 'Adaptive Guidance',
      suggestionsCount: '{{count}} suggestions',
      selectedOption: 'Selected: {{label}}',
      saveAdaptiveFailed: 'Unable to save adaptive choice in academic wall',
      peerMatching: 'Academic Peer Matching',
      highCompatibility: 'High compatibility',
      needPrefix: 'Needs',
      compatibility: 'Compatibility',
      defaultWeakSkill: 'Mathematics',
      selectedPeerFallback: 'Selected peer',
      requestAlreadySent: 'Request already sent to {{name}}',
      scheduledWith: 'Session scheduled successfully with {{name}}',
      peerServerFailed: 'Smart peer matching failed from server. Please try later.',
      searchingForPeer: 'Searching for {{name}}...',
      requestedWaiting: 'Requested - waiting for response',
      scheduleSessionWith: 'Schedule session with {{name}}',
      skillsCompass: 'Skills Compass',
      jobMarket: 'Job Market',
      opportunityNow: 'Hot Opportunity',
      levelYour: 'Your level',
      employmentBoost: 'employment boost',
      openCourse: 'Opened {{course}} on {{platform}}',
      openCourseFailed: 'Unable to open course link right now',
      smartTasks: 'Smart Tasks',
      activeCount: '{{count}} active',
      splitTask: 'Split Task',
      startNowFirstStep: 'Start now - first step',
      taskStarted: 'Task started! Your first step is ready 🚀',
      taskStartedNote: 'Started! Keep this momentum 🚀',
      stepCompleted: 'Step {{step}} completed ✅',
      adaptiveGenerated: 'Adaptive route generated successfully!',
      adaptiveError: 'Error occurred during generation',
      contentTooComplex: 'This text appears complex. Do you want to convert it now?',
      mindMap: 'Mind Map',
      mindMapLabel: 'Mind Map',
      audioClip: 'Audio Clip',
      audioLabel: 'Audio Clip',
      smartAnalyzing: 'Smart analysis in progress...',
      proactivePreparing: 'Proactive preparation in progress...',
      suggestedPlan: 'Suggested plan - total: ~2.7 hours',
      autoMessageTitle: 'Automatic Message from Manarat Rased',
      studentDataSync: 'Syncing student data...',
      retry: 'Try again',
    },
  },
};

function deepGet(obj, path) {
  return String(path || '')
    .split('.')
    .reduce((acc, key) => (acc && Object.prototype.hasOwnProperty.call(acc, key) ? acc[key] : undefined), obj);
}

function interpolate(template, vars = {}) {
  return String(template).replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => (vars[key] ?? ''));
}

export function LanguageProvider({ children }) {
  const { settings } = useSettings();
  const language = normalizeLanguage(settings?.language || 'ar');

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.lang = language;
    root.dir = language === 'ar' ? 'rtl' : 'ltr';
    root.style.setProperty('--font-family-primary', language === 'ar' ? 'Tajawal, Cairo, IBM Plex Sans Arabic, sans-serif' : 'Inter, Roboto, sans-serif');
    root.style.fontFamily = 'var(--font-family-primary)';
  }, [language]);

  const t = useCallback((key, vars = {}) => {
    const langPack = DICTIONARY[language] || DICTIONARY.ar;
    const fallbackPack = DICTIONARY.ar;
    const raw = deepGet(langPack, key) ?? deepGet(fallbackPack, key) ?? key;
    return typeof raw === 'string' ? interpolate(raw, vars) : raw;
  }, [language]);

  const formatDate = useCallback((value, options = {}) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return t('common.na');
    const locale = language === 'ar' ? 'ar-SA' : 'en-US';
    const fmt = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options,
    });
    return fmt.format(date);
  }, [language, t]);

  const formatNumber = useCallback((value, options = {}) => {
    const locale = language === 'ar' ? 'ar-SA' : 'en-US';
    return new Intl.NumberFormat(locale, options).format(Number(value ?? 0));
  }, [language]);

  const formatPercent = useCallback((value, digits = 0) => {
    return `${formatNumber(value, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })}%`;
  }, [formatNumber]);

  const value = useMemo(() => ({
    language,
    isArabic: language === 'ar',
    t,
    formatDate,
    formatNumber,
    formatPercent,
  }), [language, t, formatDate, formatNumber, formatPercent]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

export default LanguageContext;
