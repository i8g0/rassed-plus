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
  buildBeaconOpeningMessage,
  generateInterventionPlan,
  generateSmartReply,
  generateSilentAnalysis,
  generateAdaptiveContent,
  checkNemotronFreeModel,
  hasAnyRemoteAIProvider,
  getAISetupHint,
} from './aiService';
import { byLanguage, getCurrentLanguage, normalizeLanguage } from '../utils/localization';
import { translateNode } from '../utils/translator';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const REQUEST_TIMEOUT_MS = 8000;

// ─── Helper: try API first, fallback to mock ─────────────────────────────────

async function request(path, options = {}) {
  // إذا ما في سيرفر (API_BASE فاضي) نرجع null عشان يستخدم الـ fallback
  if (!API_BASE) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      signal: controller.signal,
      ...options,
    });

    clearTimeout(timeout);

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
    clearTimeout(timeout);
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
  const lang = normalizeLanguage(getCurrentLanguage());
  return translateNode(getLoginDemoAccounts(), lang);
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
  const lang = normalizeLanguage(getCurrentLanguage());
  return translateNode({ user: result.user }, lang);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Notifications
// ═══════════════════════════════════════════════════════════════════════════════

export async function getNotifications(role) {
  const apiResult = await request(`/api/notifications?role=${encodeURIComponent(role)}`);
  if (apiResult) return apiResult;

  const lang = normalizeLanguage(getCurrentLanguage());
  return translateNode(generateNotifications(role), lang);
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
  const lang = normalizeLanguage(getCurrentLanguage());

  const courses = [
    { id: '1', code: 'CS 321', name: byLanguage(lang, 'الخوارزميات', 'Algorithms'), instructor: byLanguage(lang, 'د. عبدالله', 'Dr. Abdullah'), enroll_count: 120, fail_rate: 60, avg_grade: 2.1, severity: 'red' },
    { id: '2', code: 'MATH 201', name: byLanguage(lang, 'التفاضل والتكامل ٢', 'Calculus II'), instructor: byLanguage(lang, 'د. خالد', 'Dr. Khalid'), enroll_count: 150, fail_rate: 45, avg_grade: 2.5, severity: 'yellow' },
    { id: '3', code: 'IS 101', name: byLanguage(lang, 'نظم المعلومات', 'Information Systems'), instructor: byLanguage(lang, 'د. سارة', 'Dr. Sarah'), enroll_count: 200, fail_rate: 10, avg_grade: 4.2, severity: 'green' }
  ];

  return translateNode({ students, stats, courses }, lang);
}

export async function getInterventions(advisorId = null) {
  const query = advisorId ? `?advisor_id=${encodeURIComponent(advisorId)}` : '';
  const apiResult = await request(`/api/interventions${query}`);
  if (apiResult) return apiResult;

  if (advisorId === 'AD-2001') {
    return [
      { id: 21, student: 'ريم ناصر الشهري', type: 'رسالة دعم أكاديمي', date: '2026-04-11', status: 'sent', result: 'بانتظار رد الطالبة' },
      { id: 22, student: 'نوف محمد الدوسري', type: 'خطة تدخل عاجلة', date: '2026-04-13', status: 'meeting', result: 'تم جدولة لقاء مع المرشدة' },
      { id: 23, student: 'سارة راشد الحارثي', type: 'جلسة متابعة أكاديمية', date: '2026-04-08', status: 'followup', result: 'متابعة التحسن في الحضور خلال أسبوع' },
      { id: 24, student: 'سندس عبدالله القاسم', type: 'توجيه مهني', date: '2026-04-06', status: 'completed', result: 'تم تحديد مسار مهاري واضح للفصل القادم' },
      { id: 25, student: 'ريم علي الدوسري', type: 'رسالة تحفيزية', date: '2026-04-02', status: 'completed', result: 'استجابة إيجابية وتحسن الالتزام الأسبوعي' },
    ];
  }

  const lang = normalizeLanguage(getCurrentLanguage());
  return translateNode([
    { id: 1, student: byLanguage(lang, 'محمد عمار القحطاني', 'Mohammed Ammar Al-Qahtani'), type: byLanguage(lang, 'رسالة دعم أكاديمي', 'Academic Support Message'), date: '2026-04-10', status: 'sent', result: byLanguage(lang, 'بانتظار رد الطالب', 'Awaiting student response') },
    { id: 2, student: byLanguage(lang, 'سلمان عبدالله المطيري', 'Salman Abdullah Al-Mutairi'), type: byLanguage(lang, 'خطة تدخل عاجلة', 'Urgent Intervention Plan'), date: '2026-04-12', status: 'meeting', result: byLanguage(lang, 'تم جدولة لقاء مع المرشد', 'Meeting scheduled with advisor') },
    { id: 3, student: byLanguage(lang, 'طارق سامي الغامدي', 'Tariq Sami Al-Ghamdi'), type: byLanguage(lang, 'جلسة متابعة أكاديمية', 'Academic Follow-up Session'), date: '2026-03-28', status: 'completed', result: byLanguage(lang, 'تحسن المعدل من 2.1 إلى 3.4', 'GPA improved from 2.1 to 3.4') },
    { id: 4, student: byLanguage(lang, 'عبدالعزيز حسن العنزي', 'Abdulaziz Hassan Al-Enezi'), type: byLanguage(lang, 'توجيه مهني', 'Career Guidance'), date: '2026-04-05', status: 'followup', result: byLanguage(lang, 'متابعة التقدم بعد أسبوعين', 'Follow-up on progress after 2 weeks') },
    { id: 5, student: byLanguage(lang, 'زياد ناصر البلوي', 'Ziad Nasser Al-Blawi'), type: byLanguage(lang, 'رسالة تحفيزية', 'Motivational Message'), date: '2026-04-01', status: 'completed', result: byLanguage(lang, 'استجابة إيجابية — رفع المعدل', 'Positive response — GPA improved') },
  ], lang);
}

export async function generateIntervention(studentId, advisorId) {
  const apiResult = await request('/api/interventions/generate', {
    method: 'POST',
    body: JSON.stringify({ student_id: studentId, advisor_id: advisorId }),
  });
  if (apiResult) return apiResult;

  const lang = normalizeLanguage(getCurrentLanguage());
  const student = STUDENTS_DB.find((s) => s.id === studentId);
  if (!student) {
    return {
      id: `INV-${Date.now().toString().slice(-4)}`,
      emailSubject: byLanguage(lang, 'خطة دعم أكاديمي', 'Academic Support Plan'),
      emailBody: byLanguage(lang, 'لم يُعثر على بيانات الطالب في القاعدة. يرجى المحاولة لاحقاً.', 'Student data not found in the system. Please try again later.'),
      actionPlan: [{ step: '01', action: byLanguage(lang, 'التحقق من بيانات الطالب', 'Verify student data'), timeline: byLanguage(lang, 'فوراً', 'Immediately'), owner: byLanguage(lang, 'المرشد', 'Advisor') }],
      followUpDate: byLanguage(lang, 'غير محدد', 'Undetermined'),
      status: 'draft'
    };
  }

  return translateNode(generateInterventionPlan(student), lang);
}


// ═══════════════════════════════════════════════════════════════════════════════
//  Student
// ═══════════════════════════════════════════════════════════════════════════════

function formatArabicDateTime(value) {
  const lang = normalizeLanguage(getCurrentLanguage());
  const locale = lang === 'en' ? 'en-US' : 'ar-SA';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return byLanguage(lang, 'موعد غير متاح', 'Unavailable time');
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function buildUnifiedAssignments(courses = [], lang = 'ar') {
  const now = Date.now();
  return courses
    .flatMap((course) => {
      const submissions = Array.isArray(course?.submission_timestamps) ? course.submission_timestamps : [];
      return submissions
        .filter((item) => !item?.actual_submission)
        .map((item, index) => {
          const dueAt = item?.deadline || item?.due_at || null;
          const dueMs = dueAt ? new Date(dueAt).getTime() : Number.NaN;
          const hoursRemaining = Number.isFinite(dueMs)
            ? (dueMs - now) / (1000 * 60 * 60)
            : Number.POSITIVE_INFINITY;

          return {
            id: `${course?.course_code || 'course'}-${item?.assignment || `task-${index}`}`,
            courseCode: course?.course_code || '',
            courseName: course?.course_name || byLanguage(lang, 'مقرر غير معروف', 'Unknown Course'),
            assignmentName: item?.assignment || byLanguage(lang, `تكليف ${index + 1}`, `Assignment ${index + 1}`),
            dueAt,
            dueLabel: formatArabicDateTime(dueAt),
            hoursRemaining,
          };
        });
    })
    .sort((a, b) => a.hoursRemaining - b.hoursRemaining);
}

function buildAttendanceRadar(courses = [], lang = 'ar') {
  return courses
    .map((course) => {
      const absenceCount = Number(course?.absence_count ?? 0);
      const totalSessions = Number(course?.total_sessions ?? 0);
      const absencePercent = totalSessions > 0 ? (absenceCount / totalSessions) * 100 : 0;

      return {
        courseCode: course?.course_code || '',
        courseName: course?.course_name || byLanguage(lang, 'مقرر غير معروف', 'Unknown Course'),
        absenceCount,
        totalSessions,
        absencePercent,
      };
    })
    .sort((a, b) => b.absencePercent - a.absencePercent);
}

function buildStudentAutoMessage(student, assignments = [], attendanceRadar = []) {
  const lang = normalizeLanguage(getCurrentLanguage());
  const name = String(student?.name || 'عزيزي الطالب').split(' ')[0];
  const urgentAssignment = assignments.find((item) => Number.isFinite(item?.hoursRemaining) && item.hoursRemaining <= 48);
  const riskyCourse = attendanceRadar.find((item) => item?.absencePercent >= 20);

  if (urgentAssignment && riskyCourse) {
    return byLanguage(
      lang,
      `مرحباً ${name}، لديك ${urgentAssignment.assignmentName} في ${urgentAssignment.courseName} قريب جداً (${urgentAssignment.dueLabel})، كما أن غيابك في ${riskyCourse.courseName} وصل ${riskyCourse.absencePercent.toFixed(1)}%. أنصحك بإغلاق الواجب اليوم وحضور المحاضرات القادمة مباشرة.`,
      `Hi ${name}, ${urgentAssignment.assignmentName} in ${urgentAssignment.courseName} is due soon (${urgentAssignment.dueLabel}), and your absence in ${riskyCourse.courseName} reached ${riskyCourse.absencePercent.toFixed(1)}%. Finish this assignment today and attend upcoming classes consistently.`,
    );
  }

  if (urgentAssignment) {
    return byLanguage(
      lang,
      `مرحباً ${name}، تذكير ذكي: ${urgentAssignment.assignmentName} في ${urgentAssignment.courseName} موعده ${urgentAssignment.dueLabel}. خصص جلسة قصيرة الآن حتى تتجنب ضغط آخر لحظة.`,
      `Hi ${name}, smart reminder: ${urgentAssignment.assignmentName} in ${urgentAssignment.courseName} is due ${urgentAssignment.dueLabel}. Start a short focused session now to avoid last-minute pressure.`,
    );
  }

  if (riskyCourse) {
    return byLanguage(
      lang,
      `مرحباً ${name}، تنبيه حضور: نسبة الغياب في ${riskyCourse.courseName} وصلت ${riskyCourse.absencePercent.toFixed(1)}%. أنت قريب من إنذار الحرمان، فركز على الحضور الكامل خلال الأسابيع القادمة.`,
      `Hi ${name}, attendance alert: your absence in ${riskyCourse.courseName} reached ${riskyCourse.absencePercent.toFixed(1)}%. You are close to debarment warning, so prioritize full attendance in upcoming weeks.`,
    );
  }

  return byLanguage(
    lang,
    `مرحباً ${name}، وضعك مستقر حالياً. استمر بهذا الإيقاع وحافظ على التسليم المبكر والحضور المنتظم.`,
    `Hi ${name}, your status is currently stable. Keep this pace and maintain early submissions and regular attendance.`,
  );
}

function countUpcomingAssignments(students = [], horizonHours = 72) {
  const now = Date.now();
  const windowMs = horizonHours * 60 * 60 * 1000;
  return students.reduce((count, student) => {
    const courses = Array.isArray(student?.current_courses) ? student.current_courses : [];
    const studentCount = courses
      .flatMap((course) => Array.isArray(course?.submission_timestamps) ? course.submission_timestamps : [])
      .filter((item) => !item?.actual_submission)
      .filter((item) => {
        const dueAt = item?.deadline || item?.due_at;
        const dueMs = new Date(dueAt || '').getTime();
        return Number.isFinite(dueMs) && dueMs >= now && (dueMs - now) <= windowMs;
      }).length;
    return count + studentCount;
  }, 0);
}

function countDebarmentRiskStudents(students = []) {
  const atRiskIds = new Set();

  students.forEach((student) => {
    const courses = Array.isArray(student?.current_courses) ? student.current_courses : [];
    const isAtRisk = courses.some((course) => {
      const absenceCount = Number(course?.absence_count ?? 0);
      const totalSessions = Number(course?.total_sessions ?? 0);
      if (totalSessions <= 0) return false;
      const currentRatio = (absenceCount / totalSessions) * 100;
      const nextRatio = ((absenceCount + 1) / totalSessions) * 100;
      return currentRatio < 25 && nextRatio >= 25;
    });

    if (isAtRisk && student?.id) atRiskIds.add(student.id);
  });

  return atRiskIds.size;
}

export async function getBeaconProactiveOpening(language = null) {
  const lang = normalizeLanguage(language || getCurrentLanguage());
  const analyzedStudents = analyzeAllStudents();
  const upcomingAssignmentsCount = countUpcomingAssignments(analyzedStudents, 72);
  const debarmentRiskCount = countDebarmentRiskStudents(analyzedStudents);

  return {
    upcomingAssignmentsCount,
    debarmentRiskCount,
    message: buildBeaconOpeningMessage(upcomingAssignmentsCount, debarmentRiskCount, lang),
  };
}

export async function getStudentDashboard(studentId) {
  const lang = normalizeLanguage(getCurrentLanguage());
  const apiResult = await request(`/api/student/dashboard/${encodeURIComponent(studentId)}`);
  if (apiResult) return apiResult;

  const student = STUDENTS_DB.find((s) => s.id === studentId);
  if (!student) {
    console.error('Student not found:', studentId);
    return {
      student: {
        name: byLanguage(lang, 'طالب', 'Student'),
        gpa: 0,
        maxGpa: 5,
        completionRate: 0,
        status: 'warning',
        statusMessage: byLanguage(lang, 'لم يتم العثور على بيانات الطالب', 'Student data not found'),
        major: '',
        year: '',
        streak: 0,
      },
      adaptive: [],
      tasks: [],
      skills: [],
      peers: [],
      splitSteps: [],
      unifiedAssignments: [],
      attendanceRadar: [],
      aiAutoMessage: byLanguage(lang, 'تعذر توليد الرسالة الذكية حالياً.', 'Unable to generate smart message at the moment.'),
    };
  }
  const analyzed = analyzeStudentRisk(student);
  let unifiedAssignments = [];
  let attendanceRadar = [];
  let aiAutoMessage = '';

  try {
    unifiedAssignments = buildUnifiedAssignments(analyzed?.current_courses || [], lang);
    attendanceRadar = buildAttendanceRadar(analyzed?.current_courses || [], lang);
    aiAutoMessage = buildStudentAutoMessage(analyzed, unifiedAssignments, attendanceRadar);
  } catch (error) {
    console.warn('Student dashboard enrichment failed:', error);
    unifiedAssignments = [];
    attendanceRadar = [];
    aiAutoMessage = byLanguage(lang, 'تعذر إنشاء تنبيه ذكي الآن، لكن بياناتك الأساسية متاحة.', 'Unable to generate a smart alert now, but your core data is available.');
  }

  // تحديد حالة الطالب للـ HeroSection
  let status, statusMessage;
  if (analyzed.riskLevel === 'red') {
    status = 'danger';
    statusMessage = byLanguage(lang, 'يحتاج تدخل أكاديمي عاجل', 'Requires urgent academic intervention');
  } else if (analyzed.riskLevel === 'yellow') {
    status = 'warning';
    statusMessage = byLanguage(lang, 'أداء يحتاج متابعة ومراقبة', 'Performance needs monitoring and follow-up');
  } else {
    status = 'success';
    statusMessage = byLanguage(lang, 'مسار سليم — استمر بالتميز!', 'Healthy trajectory - keep going!');
  }

  const yearLabel = byLanguage(lang, 'السنة', 'Year') + ` ${analyzed.year || 2}`;

  return {
    student: {
      ...analyzed,
      status,
      statusMessage,
      maxGpa: 5.0,
      completionRate: analyzed.taskCompletion || 72,
      streak: 5,
      year: yearLabel,
      major: byLanguage(lang,
        analyzed.major || 'هندسة برمجيات',
        analyzed.major === 'هندسة برمجيات' ? 'Software Engineering'
          : analyzed.major === 'علوم الحاسب' ? 'Computer Science'
          : analyzed.major || 'Software Engineering',
      ),
    },
    adaptive: [
      {
        id: 1,
        courseIcon: '📐',
        course: byLanguage(lang, 'هياكل البيانات', 'Data Structures'),
        issue: byLanguage(lang, 'تم رصد صعوبة في فهم الأشجار الثنائية — إليك مسارات بديلة:', 'Difficulty detected with binary trees — try these alternative routes:'),
        alternatives: [
          { key: 'video', label: byLanguage(lang, 'فيديو مرئي تفاعلي', 'Interactive Visual Video'), color: '#818CF8', bg: 'rgba(129,140,248,0.1)' },
          { key: 'podcast', label: byLanguage(lang, 'بودكاست صوتي مبسط', 'Simplified Audio Podcast'), color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
          { key: 'map', label: byLanguage(lang, 'خريطة ذهنية تفاعلية', 'Interactive Mind Map'), color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
        ],
      },
      {
        id: 2,
        courseIcon: '💻',
        course: byLanguage(lang, 'الخوارزميات', 'Algorithms'),
        issue: byLanguage(lang, 'صعوبة في البرمجة الديناميكية — جرب هذه الطرق:', 'Difficulty with dynamic programming — try these methods:'),
        alternatives: [
          { key: 'video', label: byLanguage(lang, 'شرح مرئي خطوة بخطوة', 'Step-by-Step Visual Guide'), color: '#818CF8', bg: 'rgba(129,140,248,0.1)' },
          { key: 'map', label: byLanguage(lang, 'أمثلة تفاعلية محلولة', 'Interactive Solved Examples'), color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
        ],
      },
    ],
    peers: [
      {
        id: 'peer-1',
        name: byLanguage(lang, 'فهد عبدالله', 'Fahd Abdullah'),
        initials: byLanguage(lang, 'فع', 'FA'),
        strong: byLanguage(lang, 'هياكل بيانات', 'Data Structures'),
        weak: byLanguage(lang, 'الرياضيات', 'Mathematics'),
        compatibility: 92,
        color: '#818CF8',
        reason: byLanguage(lang, 'فهد متفوق في هياكل البيانات ويحتاج مساعدة في الرياضيات — توأمة مثالية!', 'Fahd excels in Data Structures and needs help in Mathematics — a perfect match!'),
      },
      {
        id: 'peer-2',
        name: byLanguage(lang, 'عمر الشمري', 'Omar Al-Shammari'),
        initials: byLanguage(lang, 'عش', 'OA'),
        strong: byLanguage(lang, 'قواعد بيانات', 'Databases'),
        weak: byLanguage(lang, 'الرياضيات', 'Mathematics'),
        compatibility: 85,
        color: '#10B981',
        reason: byLanguage(lang, 'عمر خبير في قواعد البيانات ويمكنه مساعدتك في المشروع.', 'Omar is a database expert and can help you with your project.'),
      },
    ],
    skills: [
      {
        id: 1,
        skill: byLanguage(lang, 'تحليل البيانات', 'Data Analysis'),
        level: 35,
        color: '#F59E0B',
        hot: true,
        reason: byLanguage(lang, 'مطلوب بشدة في سوق العمل السعودي — الفرص زادت 40% هذا الفصل.', 'In high demand in the Saudi job market — opportunities increased 40% this semester.'),
        boost: 40,
        course: 'Data Analysis with Python',
        platform: 'Coursera',
        link: 'https://www.coursera.org/learn/data-analysis-with-python',
      },
      {
        id: 2,
        skill: byLanguage(lang, 'الذكاء الاصطناعي', 'Artificial Intelligence'),
        level: 25,
        color: '#818CF8',
        hot: true,
        reason: byLanguage(lang, 'تخصصك يفتح لك الباب — ابدأ بالأساسيات الآن.', 'Your major opens the door — start with the fundamentals now.'),
        boost: 55,
        course: 'AI For Everyone',
        platform: 'Coursera',
        link: 'https://www.coursera.org/learn/ai-for-everyone',
      },
      {
        id: 3,
        skill: byLanguage(lang, 'تطوير الويب', 'Web Development'),
        level: 50,
        color: '#10B981',
        hot: false,
        reason: byLanguage(lang, 'مهارة أساسية لأي مبرمج — طوّر مستواك.', 'A core skill for any developer — level up.'),
        boost: 30,
        course: 'The Web Developer Bootcamp',
        platform: 'Udemy',
        link: 'https://www.udemy.com/course/the-web-developer-bootcamp/',
      },
    ],
    tasks: [
      {
        id: 1,
        title: byLanguage(lang, 'تقرير هياكل البيانات', 'Data Structures Report'),
        deadline: byLanguage(lang, 'غداً — 11:59 م', 'Tomorrow — 11:59 PM'),
        progress: 0,
        urgency: 'danger',
        canSplit: true,
        aiNote: byLanguage(lang, 'لم تبدأ بعد! قسّم المهمة لخطوات صغيرة وابدأ الآن.', "You haven't started yet! Split the task into small steps and begin now."),
      },
      {
        id: 2,
        title: byLanguage(lang, 'واجب الخوارزميات #5', 'Algorithms Assignment #5'),
        deadline: byLanguage(lang, 'بعد 3 أيام', 'In 3 days'),
        progress: 60,
        urgency: 'warning',
        canSplit: false,
        aiNote: byLanguage(lang, 'أحسنت! تبقى 40% فقط — خصص ساعة اليوم.', 'Well done! Only 40% left — allocate an hour today.'),
      },
      {
        id: 3,
        title: byLanguage(lang, 'مشروع قواعد البيانات النهائي', 'Final Database Project'),
        deadline: byLanguage(lang, 'بعد أسبوع', 'In one week'),
        progress: 10,
        urgency: 'warning',
        canSplit: true,
        aiNote: byLanguage(lang, 'ابدأ بتصميم قاعدة البيانات (ERD) أولاً.', 'Start by designing the database schema (ERD) first.'),
      },
    ],
    splitSteps: [
      { icon: '📖', text: byLanguage(lang, 'قراءة متطلبات التقرير وفهم الأسئلة', 'Read report requirements and understand the questions'), time: byLanguage(lang, '20 دقيقة', '20 min') },
      { icon: '🔍', text: byLanguage(lang, 'بحث وجمع المراجع والأمثلة', 'Research and gather references and examples'), time: byLanguage(lang, '30 دقيقة', '30 min') },
      { icon: '✍️', text: byLanguage(lang, 'كتابة المقدمة والإطار النظري', 'Write the introduction and theoretical framework'), time: byLanguage(lang, '40 دقيقة', '40 min') },
      { icon: '💻', text: byLanguage(lang, 'كتابة الكود والتحليل التطبيقي', 'Write the code and applied analysis'), time: byLanguage(lang, '50 دقيقة', '50 min') },
      { icon: '📊', text: byLanguage(lang, 'إضافة الرسوم البيانية والنتائج', 'Add charts and results'), time: byLanguage(lang, '25 دقيقة', '25 min') },
      { icon: '✅', text: byLanguage(lang, 'المراجعة النهائية والتنسيق', 'Final review and formatting'), time: byLanguage(lang, '15 دقيقة', '15 min') },
    ],
    unifiedAssignments,
    attendanceRadar,
    aiAutoMessage,
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
  const lang = normalizeLanguage(getCurrentLanguage());
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
      ? byLanguage(lang, `تم العثور على ${match.name} كتوأم أكاديمي${weakSkill ? ` في ${weakSkill}` : ''}`, `Found ${match.name} as an academic peer${weakSkill ? ` for ${weakSkill}` : ''}`)
      : byLanguage(lang, 'لم يتم العثور على توأم مناسب حالياً', 'No suitable peer match found at this time'),
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

  const lang = normalizeLanguage(getCurrentLanguage());
  return [
    // ميزات الطلاب
    { code: 'task_splitter', name: byLanguage(lang, 'تقسيم المهام الذكي', 'Smart Task Splitting'), description: byLanguage(lang, 'يقسّم المهمة الكبيرة لخطوات صغيرة مع تقدير الوقت', 'Breaks large tasks into small steps with time estimates'), enabled: true, category: 'student' },
    { code: 'peer_matching', name: byLanguage(lang, 'التوأمة الأكاديمية', 'Academic Peer Matching'), description: byLanguage(lang, 'يوصل الطالب بزميل متفوق في مهارة يحتاجها', 'Connects student with a peer excelling in a needed skill'), enabled: true, category: 'student' },
    { code: 'adaptive_routes', name: byLanguage(lang, 'التوجيه التكيّفي', 'Adaptive Routing'), description: byLanguage(lang, 'مسارات تعلم بديلة حسب أسلوب الطالب', 'Alternative learning paths based on student style'), enabled: true, category: 'student' },
    { code: 'skill_compass', name: byLanguage(lang, 'بوصلة المهارات', 'Skills Compass'), description: byLanguage(lang, 'ربط المهارات بفرص سوق العمل مع كورسات مقترحة', 'Links skills to job market opportunities with suggested courses'), enabled: true, category: 'student' },
    { code: 'streak_tracking', name: byLanguage(lang, 'تتبع الانضباط اليومي', 'Daily Streak Tracking'), description: byLanguage(lang, 'عدّاد الأيام المتواصلة والمكافآت', 'Consecutive days counter and rewards'), enabled: true, category: 'student' },
    // ميزات المرشد والجامعة
    { code: 'risk_engine', name: byLanguage(lang, 'محرك تحليل الخطورة', 'Risk Analysis Engine'), description: byLanguage(lang, 'تحليل 6 عوامل بأوزان لتحديد مؤشر الخطورة', 'Analyzes 6 weighted factors to determine risk score'), enabled: true, category: 'advisor' },
    { code: 'intervention_gen', name: byLanguage(lang, 'مولّد خطط التدخل', 'Intervention Plan Generator'), description: byLanguage(lang, 'توليد رسائل دعم وخطط علاجية ذكية بالـ AI', 'AI-powered support messages and remedial plans'), enabled: true, category: 'advisor' },
    { code: 'curriculum_radar', name: byLanguage(lang, 'رادار المناهج', 'Curriculum Radar'), description: byLanguage(lang, 'رصد المقررات ذات نسب الرسوب العالية', 'Monitors courses with high failure rates'), enabled: true, category: 'advisor' },
    { code: 'notifications', name: byLanguage(lang, 'الإشعارات الذكية', 'Smart Notifications'), description: byLanguage(lang, 'تنبيهات فورية لحالات الخطر والتغييرات', 'Real-time alerts for risk cases and changes'), enabled: true, category: 'advisor' },
    // ميزات الذكاء الاصطناعي
    { code: 'copilot_tips', name: byLanguage(lang, 'توصيات Copilot', 'Copilot Recommendations'), description: byLanguage(lang, 'نصائح ذكية سياقية حسب الدور والصفحة', 'Contextual smart tips based on role and page'), enabled: true, category: 'ai' },
    { code: 'ai_email_gen', name: byLanguage(lang, 'مولّد الرسائل بالـ AI', 'AI Message Generator'), description: byLanguage(lang, 'كتابة رسائل دعم شخصية بنبرة إنسانية', 'Writes personal support messages with human tone'), enabled: true, category: 'ai' },
    { code: 'root_cause_ai', name: byLanguage(lang, 'تحليل السبب الجذري', 'Root Cause Analysis'), description: byLanguage(lang, 'استنتاج السبب الحقيقي وراء التعثر الأكاديمي', 'Deduces the real cause behind academic struggles'), enabled: true, category: 'ai' },
    { code: 'dark_mode', name: byLanguage(lang, 'الوضع الداكن', 'Dark Mode'), description: byLanguage(lang, 'واجهة داكنة مريحة للعين', 'Eye-friendly dark interface'), enabled: true, category: 'ai' },
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

export async function sendStudentChat(studentId, message, sessionId = null, language = null) {
  const lang = normalizeLanguage(language || getCurrentLanguage());
  const apiResult = await request('/api/chat/student', {
    method: 'POST',
    body: JSON.stringify({
      student_id: studentId,
      message,
      session_id: sessionId,
      language: lang,
    }),
  });
  if (apiResult) return apiResult;

  if (!hasAnyRemoteAIProvider()) {
    return {
      response: getAISetupHint(lang),
      session_id: sessionId || 'setup-required-session',
      timestamp: new Date().toISOString(),
    };
  }

  // Context-aware fallback when backend/AI provider is unavailable
  const baseStudent = STUDENTS_DB.find((s) => s.id === studentId) || { id: studentId };
  let contextData = { ...baseStudent };

  try {
    const dashboard = await getStudentDashboard(studentId);
    contextData = {
      ...contextData,
      ...(dashboard?.student || {}),
      unifiedAssignments: dashboard?.unifiedAssignments || [],
      attendanceRadar: dashboard?.attendanceRadar || [],
      tasks: dashboard?.tasks || [],
    };
  } catch {
    // keep base mock context
  }

  const reply = await generateSmartReply(message, false, contextData, lang);
  return {
    response: reply,
    session_id: sessionId || 'ai-session',
    timestamp: new Date().toISOString(),
  };
}

export async function sendAdvisorChat(advisorId, message, studentId = null, language = null) {
  const lang = normalizeLanguage(language || getCurrentLanguage());
  const apiResult = await request('/api/chat/advisor', {
    method: 'POST',
    body: JSON.stringify({
      advisor_id: advisorId,
      message,
      student_id: studentId,
      language: lang,
    }),
  });
  if (apiResult) return apiResult;

  if (!hasAnyRemoteAIProvider()) {
    return {
      response: getAISetupHint(lang),
      timestamp: new Date().toISOString(),
    };
  }

  const analyzedStudents = analyzeAllStudents();
  const studentContext = studentId
    ? (analyzedStudents.find((s) => s.id === studentId) || STUDENTS_DB.find((s) => s.id === studentId) || null)
    : null;

  const advisorContext = {
    advisorId,
    studentContext,
    totalStudents: analyzedStudents.length,
    atRiskStudents: analyzedStudents.filter((s) => s.riskLevel === 'red').length,
  };

  const reply = await generateSmartReply(message, true, advisorContext, lang);
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

export async function getSilentAnalysis(studentId, language = null) {
  const lang = normalizeLanguage(language || getCurrentLanguage());
  const apiResult = await request(`/api/student/silent-analysis/${encodeURIComponent(studentId)}`);
  if (apiResult) return apiResult;
  const student = STUDENTS_DB.find((s) => s.id === studentId);
  if (!student) return { alerts: [], overall_mood: 'neutral', priority_action: '' };

  return generateSilentAnalysis(student, lang);
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

export async function getAdaptiveTaskContent(taskName, type, language = null) {
  const lang = normalizeLanguage(language || getCurrentLanguage());
  const apiResult = await request('/api/student/adaptive-content', {
    method: 'POST',
    body: JSON.stringify({ taskName, type, language: lang })
  });
  if (apiResult) return apiResult;

  // Real AI Fallback
  return await generateAdaptiveContent(taskName, type, lang);
}

export async function runAIHealthCheck() {
  return checkNemotronFreeModel();
}
