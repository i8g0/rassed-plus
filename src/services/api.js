/**
 * services/api.js
 * طبقة الاتصال — تحاول الـ API أولاً، وإذا فشل تستخدم mockEngine مباشرة.
 * هذا يضمن إن التطبيق يشتغل حتى بدون Backend.
 */

import {
  getLoginDemoAccounts,
  authenticateUser,
  generateNotifications,
  analyzeAllStudents,
  getStudentsForAdvisor,
  analyzeStudentRisk,
  getAdvisorStats,
  STUDENTS_DB,
} from './mockEngine';

import {
  generateInterventionPlan,
  generateSmartReply,
  generateSilentAnalysis,
  generateAdaptiveContent
} from './aiService';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

// ─── Helper: try API first, fallback to mock ─────────────────────────────────

async function request(path, options = {}) {
  // إذا ما في سيرفر (API_BASE فاضي) نرجع null عشان يستخدم الـ fallback
  if (!API_BASE) return null;

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });

    if (!response.ok) {
      let message = 'حدث خطأ في الاتصال بالخادم';
      try {
        const data = await response.json();
        message = data.detail || message;
      } catch {
        // noop
      }
      throw new Error(message);
    }

    if (response.status === 204) return null;
    return response.json();
  } catch {
    // السيرفر مو شغال — نرجع null عشان الـ fallback يشتغل
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Auth & Demo Accounts
// ═══════════════════════════════════════════════════════════════════════════════

export async function getDemoAccounts() {
  const apiResult = await request('/api/demo-accounts');
  if (apiResult) return apiResult;

  // fallback → mockEngine
  return getLoginDemoAccounts();
}

export async function login(role, identifier, password) {
  const apiResult = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ role, identifier, password }),
  });
  if (apiResult) return apiResult;

  // fallback → mockEngine
  const result = authenticateUser(role, identifier, password);
  if (!result.ok) {
    throw new Error(result.message);
  }
  return { user: result.user };
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Notifications
// ═══════════════════════════════════════════════════════════════════════════════

export async function getNotifications(role) {
  const apiResult = await request(`/api/notifications?role=${encodeURIComponent(role)}`);
  if (apiResult) return apiResult;

  return generateNotifications(role);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Advisor
// ═══════════════════════════════════════════════════════════════════════════════

export async function getAdvisorOverview(advisorId = null) {
  const apiResult = await request('/api/advisor/overview');
  if (apiResult) return apiResult;

  const analyzedStudents = analyzeAllStudents();
  const students = getStudentsForAdvisor(advisorId, analyzedStudents);
  const stats = getAdvisorStats(students);
  
  const courses = [
    { id: '1', code: 'CS 321', name: 'الخوارزميات', instructor: 'د. عبدالله', enroll_count: 120, fail_rate: 60, avg_grade: 2.1, severity: 'red' },
    { id: '2', code: 'MATH 201', name: 'التفاضل والتكامل ٢', instructor: 'د. خالد', enroll_count: 150, fail_rate: 45, avg_grade: 2.5, severity: 'yellow' },
    { id: '3', code: 'IS 101', name: 'نظم المعلومات', instructor: 'د. سارة', enroll_count: 200, fail_rate: 10, avg_grade: 4.2, severity: 'green' }
  ];

  return { students, stats, courses };
}

export async function getInterventions() {
  const apiResult = await request('/api/interventions');
  if (apiResult) return apiResult;

  // بيانات تدخلات تجريبية — تتوافق مع InterventionsTab
  return [
    { id: 1, student: 'أحمد محمود', type: 'رسالة دعم أكاديمي', date: '2026-04-10', status: 'sent', result: 'بانتظار رد الطالب' },
    { id: 2, student: 'نورة سعد', type: 'خطة تدخل عاجلة', date: '2026-04-12', status: 'meeting', result: 'تم جدولة لقاء مع المرشد' },
    { id: 3, student: 'محمد عمار', type: 'جلسة متابعة أكاديمية', date: '2026-03-28', status: 'completed', result: 'تحسن المعدل من 2.1 إلى 3.4' },
    { id: 4, student: 'لين الحربي', type: 'توجيه مهني', date: '2026-04-05', status: 'followup', result: 'متابعة التقدم بعد أسبوعين' },
    { id: 5, student: 'عمر الشمري', type: 'رسالة تحفيزية', date: '2026-04-01', status: 'completed', result: 'استجابة إيجابية — رفع المعدل' },
  ];
}

export async function generateIntervention(studentId, advisorId) {
  const apiResult = await request('/api/interventions/generate', {
    method: 'POST',
    body: JSON.stringify({ student_id: studentId, advisor_id: advisorId }),
  });
  if (apiResult) return apiResult;

  const student = STUDENTS_DB.find((s) => s.id === studentId);
  if (!student) {
    return {
      id: `INV-${Date.now().toString().slice(-4)}`,
      emailSubject: 'خطة دعم أكاديمي',
      emailBody: 'لم يُعثر على بيانات الطالب في القاعدة. يرجى المحاولة لاحقاً.',
      actionPlan: [{ step: '01', action: 'التحقق من بيانات الطالب', timeline: 'فوراً', owner: 'المرشد' }],
      followUpDate: 'غير محدد',
      status: 'draft'
    };
  }
  return generateInterventionPlan(student);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Student
// ═══════════════════════════════════════════════════════════════════════════════

export async function getStudentDashboard(studentId) {
  const apiResult = await request(`/api/student/dashboard/${encodeURIComponent(studentId)}`);
  if (apiResult) return apiResult;

  const student = STUDENTS_DB.find((s) => s.id === studentId);
  if (!student) {
    console.error('Student not found:', studentId);
    return {
      student: { name: 'طالب', gpa: 0, maxGpa: 5, completionRate: 0, status: 'warning', statusMessage: 'لم يتم العثور على بيانات الطالب', major: '', year: '', streak: 0 },
      adaptive: [], tasks: [], skills: [], peers: [], splitSteps: []
    };
  }
  const analyzed = analyzeStudentRisk(student);

  // تحديد حالة الطالب للـ HeroSection
  let status, statusMessage;
  if (analyzed.riskLevel === 'red') {
    status = 'danger';
    statusMessage = 'يحتاج تدخل أكاديمي عاجل';
  } else if (analyzed.riskLevel === 'yellow') {
    status = 'warning';
    statusMessage = 'أداء يحتاج متابعة ومراقبة';
  } else {
    status = 'success';
    statusMessage = 'مسار سليم — استمر بالتميز!';
  }

  const yearLabel = `السنة ${analyzed.year || 2}`;

  return {
    student: {
      ...analyzed,
      status,
      statusMessage,
      maxGpa: 5.0,
      completionRate: analyzed.taskCompletion || 72,
      streak: 5,
      year: yearLabel,
    },
    adaptive: [
      {
        id: 1,
        courseIcon: '📐',
        course: 'هياكل البيانات',
        issue: 'تم رصد صعوبة في فهم الأشجار الثنائية — إليك مسارات بديلة:',
        alternatives: [
          { key: 'video', label: 'فيديو مرئي تفاعلي', color: '#818CF8', bg: 'rgba(129,140,248,0.1)' },
          { key: 'podcast', label: 'بودكاست صوتي مبسط', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
          { key: 'map', label: 'خريطة ذهنية تفاعلية', color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
        ],
      },
      {
        id: 2,
        courseIcon: '💻',
        course: 'الخوارزميات',
        issue: 'صعوبة في البرمجة الديناميكية — جرب هذه الطرق:',
        alternatives: [
          { key: 'video', label: 'شرح مرئي خطوة بخطوة', color: '#818CF8', bg: 'rgba(129,140,248,0.1)' },
          { key: 'map', label: 'أمثلة تفاعلية محلولة', color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
        ],
      },
    ],
    peers: [
      {
        id: 'peer-1',
        name: 'فهد عبدالله',
        initials: 'فع',
        strong: 'هياكل بيانات',
        weak: 'الرياضيات',
        compatibility: 92,
        color: '#818CF8',
        reason: 'فهد متفوق في هياكل البيانات ويحتاج مساعدة في الرياضيات — توأمة مثالية!',
      },
      {
        id: 'peer-2',
        name: 'عمر الشمري',
        initials: 'عش',
        strong: 'قواعد بيانات',
        weak: 'الرياضيات',
        compatibility: 85,
        color: '#10B981',
        reason: 'عمر خبير في قواعد البيانات ويمكنه مساعدتك في المشروع.',
      },
    ],
    skills: [
      {
        id: 1,
        skill: 'تحليل البيانات',
        level: 35,
        color: '#F59E0B',
        hot: true,
        reason: 'مطلوب بشدة في سوق العمل السعودي — الفرص زادت 40% هذا الفصل.',
        boost: 40,
        course: 'Data Analysis with Python',
        platform: 'Coursera',
        link: 'https://www.coursera.org/learn/data-analysis-with-python',
      },
      {
        id: 2,
        skill: 'الذكاء الاصطناعي',
        level: 25,
        color: '#818CF8',
        hot: true,
        reason: 'تخصصك يفتح لك الباب — ابدأ بالأساسيات الآن.',
        boost: 55,
        course: 'AI For Everyone',
        platform: 'Coursera',
        link: 'https://www.coursera.org/learn/ai-for-everyone',
      },
      {
        id: 3,
        skill: 'تطوير الويب',
        level: 50,
        color: '#10B981',
        hot: false,
        reason: 'مهارة أساسية لأي مبرمج — طوّر مستواك.',
        boost: 30,
        course: 'The Web Developer Bootcamp',
        platform: 'Udemy',
        link: 'https://www.udemy.com/course/the-web-developer-bootcamp/',
      },
    ],
    tasks: [
      {
        id: 1,
        title: 'تقرير هياكل البيانات',
        deadline: 'غداً — 11:59 م',
        progress: 0,
        urgency: 'danger',
        canSplit: true,
        aiNote: 'لم تبدأ بعد! قسّم المهمة لخطوات صغيرة وابدأ الآن.',
      },
      {
        id: 2,
        title: 'واجب الخوارزميات #5',
        deadline: 'بعد 3 أيام',
        progress: 60,
        urgency: 'warning',
        canSplit: false,
        aiNote: 'أحسنت! تبقى 40% فقط — خصص ساعة اليوم.',
      },
      {
        id: 3,
        title: 'مشروع قواعد البيانات النهائي',
        deadline: 'بعد أسبوع',
        progress: 10,
        urgency: 'warning',
        canSplit: true,
        aiNote: 'ابدأ بتصميم قاعدة البيانات (ERD) أولاً.',
      },
    ],
    splitSteps: [
      { icon: '📖', text: 'قراءة متطلبات التقرير وفهم الأسئلة', time: '20 دقيقة' },
      { icon: '🔍', text: 'بحث وجمع المراجع والأمثلة', time: '30 دقيقة' },
      { icon: '✍️', text: 'كتابة المقدمة والإطار النظري', time: '40 دقيقة' },
      { icon: '💻', text: 'كتابة الكود والتحليل التطبيقي', time: '50 دقيقة' },
      { icon: '📊', text: 'إضافة الرسوم البيانية والنتائج', time: '25 دقيقة' },
      { icon: '✅', text: 'المراجعة النهائية والتنسيق', time: '15 دقيقة' },
    ],
  };
}

export async function updateStudentTaskProgress(studentId, progress) {
  const apiResult = await request(
    `/api/student/tasks/${encodeURIComponent(studentId)}/progress?progress=${progress}`,
    { method: 'POST' }
  );
  if (apiResult) return apiResult;

  return { ok: true, progress };
}

export async function requestPeerMatch(requesterId, weakSkill, preferredPeerId = null) {
  const apiResult = await request('/api/matchmaking/request', {
    method: 'POST',
    body: JSON.stringify({ requester_id: requesterId, weak_skill: weakSkill, preferred_peer_id: preferredPeerId }),
  });
  if (apiResult) return apiResult;

  // mock matchmaking based on real academic data in STUDENTS_DB
  const requester = STUDENTS_DB.find((s) => s.id === requesterId);
  const normalizedWeakSkill = String(weakSkill || '').toLowerCase();
  const preferredPeer = preferredPeerId ? STUDENTS_DB.find((s) => s.id === preferredPeerId) : null;

  const candidates = STUDENTS_DB.filter((s) => s.id !== requesterId);
  const byCourseAffinity = candidates.find((candidate) =>
    Array.isArray(candidate.current_courses)
    && candidate.current_courses.some((course) => {
      const courseName = String(course.course_name || '').toLowerCase();
      const cloValues = Object.values(course.clo_analytics || {});
      const cloAverage = cloValues.length > 0
        ? cloValues.reduce((sum, val) => sum + Number(val || 0), 0) / cloValues.length
        : 0;
      return courseName.includes(normalizedWeakSkill) || cloAverage >= 85;
    })
  );

  const match = preferredPeer
    || byCourseAffinity
    || candidates
      .slice()
      .sort((a, b) => (b.gpa || 0) - (a.gpa || 0))[0]
    || null;

  return {
    ok: true,
    match: match
      ? { id: match.id, name: match.name, skill: weakSkill, gpa: match.gpa }
      : null,
    message: match
      ? `تم العثور على ${match.name} كتوأم أكاديمي${weakSkill ? ` في ${weakSkill}` : ''}`
      : 'لم يتم العثور على توأم مناسب حالياً',
    requester: requester ? { id: requester.id, name: requester.name } : null,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
//  AI Logs & Features
// ═══════════════════════════════════════════════════════════════════════════════

export async function createAiLog(payload) {
  const apiResult = await request('/api/ai-logs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (apiResult) return apiResult;

  return { ok: true, id: Date.now(), ...payload };
}

export async function getFeatures() {
  const apiResult = await request('/api/features');
  if (apiResult) return apiResult;

  return [
    // ميزات الطلاب
    { code: 'task_splitter', name: 'تقسيم المهام الذكي', description: 'يقسّم المهمة الكبيرة لخطوات صغيرة مع تقدير الوقت', enabled: true, category: 'student' },
    { code: 'peer_matching', name: 'التوأمة الأكاديمية', description: 'يوصل الطالب بزميل متفوق في مهارة يحتاجها', enabled: true, category: 'student' },
    { code: 'adaptive_routes', name: 'التوجيه التكيّفي', description: 'مسارات تعلم بديلة حسب أسلوب الطالب', enabled: true, category: 'student' },
    { code: 'skill_compass', name: 'بوصلة المهارات', description: 'ربط المهارات بفرص سوق العمل مع كورسات مقترحة', enabled: true, category: 'student' },
    { code: 'streak_tracking', name: 'تتبع الانضباط اليومي', description: 'عدّاد الأيام المتواصلة والمكافآت', enabled: true, category: 'student' },
    // ميزات المرشد والجامعة
    { code: 'risk_engine', name: 'محرك تحليل الخطورة', description: 'تحليل 6 عوامل بأوزان لتحديد مؤشر الخطورة', enabled: true, category: 'advisor' },
    { code: 'intervention_gen', name: 'مولّد خطط التدخل', description: 'توليد رسائل دعم وخطط علاجية ذكية بالـ AI', enabled: true, category: 'advisor' },
    { code: 'curriculum_radar', name: 'رادار المناهج', description: 'رصد المقررات ذات نسب الرسوب العالية', enabled: true, category: 'advisor' },
    { code: 'notifications', name: 'الإشعارات الذكية', description: 'تنبيهات فورية لحالات الخطر والتغييرات', enabled: true, category: 'advisor' },
    // ميزات الذكاء الاصطناعي
    { code: 'copilot_tips', name: 'توصيات Copilot', description: 'نصائح ذكية سياقية حسب الدور والصفحة', enabled: true, category: 'ai' },
    { code: 'ai_email_gen', name: 'مولّد الرسائل بالـ AI', description: 'كتابة رسائل دعم شخصية بنبرة إنسانية', enabled: true, category: 'ai' },
    { code: 'root_cause_ai', name: 'تحليل السبب الجذري', description: 'استنتاج السبب الحقيقي وراء التعثر الأكاديمي', enabled: true, category: 'ai' },
    { code: 'dark_mode', name: 'الوضع الداكن', description: 'واجهة داكنة مريحة للعين', enabled: true, category: 'ai' },
  ];
}

export async function toggleFeature(code, enabled) {
  const apiResult = await request(`/api/features/${encodeURIComponent(code)}/toggle`, {
    method: 'POST',
    body: JSON.stringify({ enabled }),
  });
  if (apiResult) return apiResult;

  return { ok: true, code, enabled };
}

// ═══════════════════════════════════════════════════════════════════════════════
//  🤖 AI Chatbot APIs
// ═══════════════════════════════════════════════════════════════════════════════

export async function sendStudentChat(studentId, message, sessionId = null) {
  const apiResult = await request('/api/chat/student', {
    method: 'POST',
    body: JSON.stringify({
      student_id: studentId,
      message,
      session_id: sessionId,
    }),
  });
  if (apiResult) return apiResult;

  // Fallback to real Gemini AI - LOAD EVERYTHING FOR THE AI
  let fullStudentData = { id: studentId };
  try {
    fullStudentData = await getStudentDashboard(studentId);
  } catch {
    fullStudentData = STUDENTS_DB.find((s) => s.id === studentId) || { id: studentId };
  }
  
  const reply = await generateSmartReply(message, false, fullStudentData);
  return {
    response: reply,
    session_id: sessionId || 'ai-session',
    timestamp: new Date().toISOString(),
  };
}

export async function sendAdvisorChat(advisorId, message, studentId = null) {
  const apiResult = await request('/api/chat/advisor', {
    method: 'POST',
    body: JSON.stringify({
      advisor_id: advisorId,
      message,
      student_id: studentId,
    }),
  });
  if (apiResult) return apiResult;

  const studentContext = studentId ? STUDENTS_DB.find(s => s.id === studentId) : {};
  const reply = await generateSmartReply(message, true, { advisorId, studentContext });
  return {
    response: reply,
    timestamp: new Date().toISOString(),
  };
}

export async function getChatHistory(studentId) {
  const apiResult = await request(`/api/chat/history/${encodeURIComponent(studentId)}`);
  if (apiResult) return apiResult;
  return [];
}

export async function getSilentAnalysis(studentId) {
  const apiResult = await request(`/api/student/silent-analysis/${encodeURIComponent(studentId)}`);
  if (apiResult) return apiResult;
  const student = STUDENTS_DB.find((s) => s.id === studentId);
  if (!student) return { alerts: [], overall_mood: 'neutral', priority_action: '' };
  
  return generateSilentAnalysis(student);
}

export async function getStudentBrief(studentId) {
  const apiResult = await request(`/api/advisor/student-brief/${encodeURIComponent(studentId)}`);
  if (apiResult) return apiResult;
  
  const briefStudent = STUDENTS_DB.find((s) => s.id === studentId);

  // Real mocked academic data if no server
  return {
    clo_analysis: 'ضعف في تحليل الخوارزميات (65%) ومتوسط في الشجرية (70%)',
    prerequisite_gaps: ['CS 111 (أساسيات البرمجة) - ضعف في المؤشرات (Pointers)'],
    submission_habits: 'تأخر متكرر (يسلم المهام في آخر 3 ساعات قبل الموعد النهائي)',
    assessment_metrics: { midterm: '14/20', assignments: 'جودة متذبذبة' },
    recommended_actions: ['توجيه لورش عمل التطبيق العملي', 'مراجعة الأساسيات مع معيد المادة'],
    conversation_summary: 'الطالب يواجه فجوة في المفاهيم الأساسية تعيق تقدمه في البرمجة المتقدمة.',
    urgency: 'high',
    student_name: briefStudent?.name || 'الطالب',
    student_id: studentId,
    total_messages: 0,
  };
}

export async function getAdaptiveTaskContent(taskName, type) {
  const apiResult = await request('/api/student/adaptive-content', {
    method: 'POST',
    body: JSON.stringify({ taskName, type })
  });
  if (apiResult) return apiResult;
  
  // Real AI Fallback
  return await generateAdaptiveContent(taskName, type);
}
