/**
 * services/mockEngine.js
 * محرك البيانات الذكي المركزي — يحاكي عمل الـ Backend/AI بقوة مستخدماً البيانات الأكاديمية العميقة.
 */

import { studentsDB } from './mockStudentsDB.js';

const RISK_TO_ENGINE_LEVEL = {
  'Critical High': 'red',
  High: 'red',
  Medium: 'yellow',
  Low: 'green',
};

const FEMALE_FIRST_NAMES = new Set([
  'ريم', 'سارة', 'هديل', 'ليان', 'جود', 'نوف', 'رغد', 'لمى', 'شيماء', 'نجلاء',
  'بتول', 'رنا', 'شهد', 'ديما',
]);

function inferGender(name) {
  const firstName = String(name || '').trim().split(' ')[0];
  return FEMALE_FIRST_NAMES.has(firstName) ? 'female' : 'male';
}

function idSeed(value) {
  return String(value || '')
    .split('')
    .reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
}

function buildSubmissionTimestamps(pattern) {
  const deadline = '2026-05-01T23:59:00Z';
  switch (pattern) {
    case 'Early':
    case 'مبكر جداً':
      return [{ assignment: 'Coursework', actual_submission: '2026-04-28T12:00:00Z', deadline }];
    case 'On-Time':
    case 'على الوقت':
      return [{ assignment: 'Coursework', actual_submission: '2026-05-01T20:30:00Z', deadline }];
    case 'Last-Minute':
    case 'الدقيقة الأخيرة (11:59pm)':
      return [{ assignment: 'Coursework', actual_submission: '2026-05-01T23:10:00Z', deadline }];
    case 'Late':
    case 'متأخر مزمن':
      return [{ assignment: 'Coursework', actual_submission: '2026-05-02T10:00:00Z', deadline }];
    case 'Chronic Late Submissions':
      return [
        { assignment: 'Coursework-1', actual_submission: '2026-05-02T10:00:00Z', deadline },
        { assignment: 'Coursework-2', actual_submission: '2026-05-03T12:00:00Z', deadline },
      ];
    case 'متذبذب':
      return [
        { assignment: 'Coursework-1', actual_submission: '2026-04-30T14:20:00Z', deadline },
        { assignment: 'Coursework-2', actual_submission: '2026-05-02T01:10:00Z', deadline },
      ];
    default:
      return [{ assignment: 'Coursework', actual_submission: '2026-05-01T20:30:00Z', deadline }];
  }
}

export const STUDENTS_DB = studentsDB.map((student) => {
  const seed = idSeed(student.id);
  const completionNudge = (seed % 9) - 4;
  const loginNudge = seed % 4;
  const lectureNudge = seed % 6;
  const mappedCourses = (student.current_semester_courses || []).map((course) => ({
    course_code: course.course_code,
    course_name: course.course_name,
    attendance_percentage: course.attendance_rate,
    absence_count: Number(course.absence_count ?? 0),
    total_sessions: Number(course.total_sessions ?? 0),
    assessments: {
      midterm: course.midterm_score,
      max_midterm: 20,
      lab: course.lab_project_score,
      max_lab: 30,
    },
    clo_analytics: course.clo_mastery,
    submission_timestamps: Array.isArray(course.submission_timestamps) && course.submission_timestamps.length > 0
      ? course.submission_timestamps.map((item) => ({
        assignment: item.assignment || 'Coursework',
        actual_submission: item.submitted_at || item.actual_submission,
        deadline: item.due_at || item.deadline,
      }))
      : buildSubmissionTimestamps(course.submission_pattern),
  }));

  const avgAttendance = mappedCourses.length > 0
    ? Math.round(mappedCourses.reduce((sum, c) => sum + c.attendance_percentage, 0) / mappedCourses.length)
    : 90;

  return {
    id: student.id,
    name: student.name,
    gender: student.gender || inferGender(student.name),
    major: student.major,
    level: student.level,
    year: student.level,
    gpa: student.gpa,
    cumulative_gpa: student.gpa,
    risk_level: student.risk_level,
    system_flags: Array.isArray(student.academic_flags) ? student.academic_flags : [],
    behavioral_signals: {
      platform_engagement: student?.behavioral_signals?.platform_engagement || 'Active',
      daily_login_count: Number(student?.behavioral_signals?.daily_login_count ?? 2),
      file_access_rate: Number(student?.behavioral_signals?.file_access_rate ?? 75),
      session_depth: {
        reading_minutes: Number(student?.behavioral_signals?.session_depth?.reading_minutes ?? 35),
        idle_minutes: Number(student?.behavioral_signals?.session_depth?.idle_minutes ?? 12),
        active_ratio: Number(student?.behavioral_signals?.session_depth?.active_ratio ?? 74),
      },
      behavior_fingerprint: student?.behavioral_signals?.behavior_fingerprint || `${student.id}|baseline`,
    },
    current_courses: mappedCourses,
    attendance: avgAttendance,
    taskTimeRatio: student.risk_level === 'Critical High' ? 2.9 : student.risk_level === 'High' ? 2.4 : student.risk_level === 'Medium' ? 1.4 : 0.9,
    taskCompletion: Math.max(
      15,
      Math.min(
        98,
        (student.risk_level === 'Critical High' ? 32 : student.risk_level === 'High' ? 48 : student.risk_level === 'Medium' ? 71 : 93) + completionNudge,
      ),
    ),
    lateLogins: (student.risk_level === 'Critical High' ? 11 : student.risk_level === 'High' ? 8 : student.risk_level === 'Medium' ? 4 : 1) + loginNudge,
    incompleteLectures: (student.risk_level === 'Critical High' ? 23 : student.risk_level === 'High' ? 16 : student.risk_level === 'Medium' ? 8 : 2) + lectureNudge,
  };
});

export const AUTH_ACCOUNTS = [
  {
    role: 'advisor',
    login: 'khaled.advisor@university.edu',
    altLogin: 'AD-1001',
    password: 'Advisor@2026',
    profile: {
      id: 'AD-1001',
      name: 'د. خالد القحطاني',
      email: 'khaled.advisor@university.edu',
      title: 'مرشد أكاديمي',
      department: 'عمادة شؤون الطلاب',
      gender: 'male',
    },
  },
  {
    role: 'advisor',
    login: 'noura.supervisor@university.edu',
    altLogin: 'AD-2001',
    password: 'Supervisor@2026',
    profile: {
      id: 'AD-2001',
      name: 'د. نورة السبيعي',
      email: 'noura.supervisor@university.edu',
      title: 'مشرفة أكاديمية',
      department: 'عمادة شؤون الطالبات',
      gender: 'female',
    },
  },
  {
    role: 'student',
    login: 'mohammed.ammar@university.edu',
    altLogin: 'SCS25001',
    password: 'Mohammed@2026',
    profile: {
      id: 'SCS25001',
      name: 'محمد عمار القحطاني',
      email: 'mohammed.ammar@university.edu',
      major: 'هندسة برمجيات',
      year: 7,
    },
  },
  {
    role: 'student',
    login: 'reem.qahtani@university.edu',
    altLogin: 'SCS25002',
    password: 'Reem@2026',
    profile: {
      id: 'SCS25002',
      name: 'ريم فهد القحطاني',
      email: 'reem.qahtani@university.edu',
      major: 'نظم معلومات',
      year: 3,
      gender: 'female',
    },
  },
];

export function getLoginDemoAccounts() {
  return AUTH_ACCOUNTS.map((account) => ({
    role: account.role,
    name: account.profile.name,
    login: account.login,
    altLogin: account.altLogin,
    password: account.password,
  }));
}

export function authenticateUser(role, identifier, password) {
  const normalizedRole = String(role || '').trim().toLowerCase();
  const normalizedIdentifier = String(identifier || '').trim().toLowerCase();
  const normalizedPassword = String(password || '').trim();

  if (!normalizedRole || !normalizedIdentifier || !normalizedPassword) {
    return { ok: false, message: 'يرجى إدخال جميع الحقول المطلوبة.' };
  }

  const account = AUTH_ACCOUNTS.find((item) => {
    const login = item.login.toLowerCase();
    const alt = item.altLogin.toLowerCase();
    return (
      item.role === normalizedRole
      && (login === normalizedIdentifier || alt === normalizedIdentifier)
      && item.password === normalizedPassword
    );
  });

  if (!account) {
    return { ok: false, message: 'بيانات الدخول غير صحيحة. تأكد من الدور والبريد/الرقم وكلمة المرور.' };
  }

  return { ok: true, user: { ...account.profile, role: account.role } };
}

// ═══════════════════════════════════════════════════════════════════════════════
//  1. خوارزمية تحليل الخطورة الأكاديمية (Risk Analysis Engine)
// ═══════════════════════════════════════════════════════════════════════════════

export function analyzeStudentRisk(student) {
  const seed = idSeed(student?.id);
  const factors = [];
  let score = 0;

  // 1. المعدل التراكمي (30%)
  const gpaScore = Math.max(0, (2.6 - student.cumulative_gpa) / 2.6) * 30;
  score += gpaScore;
  if (student.cumulative_gpa < 2.0) factors.push('معدل تراكمي حرج أقل من النسبة المطلوبة لخطة التخرج');
  else if (student.cumulative_gpa < 3.0) factors.push('معدل تراكمي منخفض يتطلب رفع المستوى لتجنب الإنذارات');

  // استخراج وتحليل المقررات الحالية
  let missingOrLateSubmissions = 0;
  let totalClos = 0;
  let weakClos = 0;
  let avgAttendance = 0;
  let theoreticalPracticalGap = false;

  if (student.current_courses && student.current_courses.length > 0) {
    let attendanceSum = 0;
    
    student.current_courses.forEach(course => {
      attendanceSum += course.attendance_percentage;
      
      // تحليل مخرجات التعلم (CLOs)
      if (course.clo_analytics) {
        let theoryAvg = 0; let theoryCount = 0;
        let practicalAvg = 0; let practicalCount = 0;

        Object.entries(course.clo_analytics).forEach(([key, val]) => {
          totalClos++;
          if (val < 60) weakClos++;
          
          if(key.includes('Project') || key.includes('Integration') || key.includes('Application')) {
            practicalAvg += val; practicalCount++;
          } else {
            theoryAvg += val; theoryCount++;
          }
        });

        if (practicalCount > 0 && theoryCount > 0) {
            const tAvg = theoryAvg/theoryCount;
            const pAvg = practicalAvg/practicalCount;
            if (tAvg > 85 && pAvg < 65) {
                theoreticalPracticalGap = true;
            }
        }
      }
      
      // تحليل بطاقة التسليمات
      if (course.submission_timestamps) {
        course.submission_timestamps.forEach(sub => {
          const actual = new Date(sub.actual_submission);
          const deadline = new Date(sub.deadline);
          // تسليم في الدقائق/ساعات الأخيرة أو متأخر
          const hoursDiff = (deadline - actual) / (1000 * 60 * 60);
          if (hoursDiff < 0) missingOrLateSubmissions += 1.5; // متأخر
          else if (hoursDiff < 4) missingOrLateSubmissions += 1.0; // بآخر اللحظات
        });
      }
    });
    avgAttendance = attendanceSum / student.current_courses.length;
  }

  // 2. الحضور والمشاركة (20%)
  const attendanceScore = Math.max(0, (85 - avgAttendance) / 85) * 20;
  score += attendanceScore;
  if (avgAttendance < 75) factors.push('غياب ملحوظ في الحضور والمشاركة النشطة يؤثر على درجة الأعمال الفَصليّة');

  // 3. فجوات ومعضلات CLO (30%)
  if (totalClos > 0) {
    const cloFailRatio = weakClos / totalClos;
    score += cloFailRatio * 30;
    if (cloFailRatio > 0.3) factors.push(`ضعف أكاديمي في ${(cloFailRatio*100).toFixed(0)}% من مخرجات التعلم الأساسية`);
    else if (weakClos > 0) factors.push('انخفاض أداء في مخرجات تعلم (CLOs) دقيقة محددة');
  }

  if (theoreticalPracticalGap) {
      score += 15;
      factors.push('تفاوت ملحوظ بين التفوق النظري والضعف في التطبيق العملي/المشاريع');
  }

  // 4. نمط التسليم / السلوك (20%)
  const subScore = Math.min(20, missingOrLateSubmissions * 7);
  score += subScore;
  if (missingOrLateSubmissions >= 2) factors.push('نمط تسليم في اللحظات الأخيرة (Last-minute) يؤثر سلبياً على جودة المخرجات');

  score = Math.round(score * 100) / 100;

  // تحديد مستوى الخطورة
  let riskLevel, riskLabel;
  if (score >= 45) { riskLevel = 'red'; riskLabel = 'خطر — تدخل أكاديمي فوري'; }
  else if (score >= 25 || (student.system_flags && student.system_flags.length > 0)) { riskLevel = 'yellow'; riskLabel = 'تحذير — بحاجة لمراقبة وتقوية'; }
  else { riskLevel = 'green'; riskLabel = 'أداء مستقر وممتاز'; }

  // إذا كانت البيانات المصدر تحدد الخطر صراحة، نستخدمها لتوحيد عدادات ولوحات التصفية.
  const mappedRisk = RISK_TO_ENGINE_LEVEL[student.risk_level];
  if (mappedRisk) {
    riskLevel = mappedRisk;
    if (riskLevel === 'red') {
      riskLabel = 'خطر — تدخل أكاديمي فوري';
      score = Math.max(score, 55);
    } else if (riskLevel === 'yellow') {
      riskLabel = 'تحذير — بحاجة لمراقبة وتقوية';
      score = Math.min(Math.max(score, 30), 44);
    } else {
      riskLabel = 'أداء مستقر وممتاز';
      score = Math.min(score, 24);
    }
  }

  const uniquenessBump = (seed % 31) / 10;
  if (riskLevel === 'red') {
    score = Math.min(96, Math.max(55, Number((score + uniquenessBump).toFixed(1))));
  } else if (riskLevel === 'yellow') {
    score = Math.min(54.9, Math.max(30, Number((score + uniquenessBump).toFixed(1))));
  } else {
    score = Math.min(29.9, Math.max(8, Number((score + uniquenessBump).toFixed(1))));
  }

  // اختيار السبب الرئيسي
  const primaryReason = student.system_flags && student.system_flags[0] 
     ? student.system_flags[0] 
     : (factors[0] || 'حالة مستقرة بدون مشاكل وتتقدم أكاديمياً حسب الخطة');

  let recommendations;
  if (riskLevel === 'red') {
    recommendations = [
      'توجيه الطالب بشكل عاجل لعيادات البرمجة وورش التقوية',
      'بناء جدول مراجعة تكويني مع أستاذ المادة وتحديد متطلبات سابقة مفقودة',
      'تخصيص مشاريع تطبيقية صغيرة لمعالجة فجوات الـ CLOs'
    ];
  } else if (riskLevel === 'yellow') {
    recommendations = [
      'اقتراح مصادر تعلم تطبيقية إضافية مستهدفة للمخرجات الضعيفة',
      'تفعيل نظام التوأمة الأكاديمية مع طالب متفوق',
      'التوجيه بضرورة تنظيم الوقت والبدء المبكر بالمهام البرمجية'
    ];
  } else {
    recommendations = [
      'ترشيح الطالب لبرنامج الذكاء الاصطناعي المتميز (مساعد تدريس)',
      'توجيهه لمهام برمجية إثرائية متقدمة'
    ];
  }

  return {
    ...student,
    riskLevel, riskLabel, riskScore: score,
    primaryReason, factors, recommendations,
  };
}

export function analyzeAllStudents() {
  return STUDENTS_DB
    .map(analyzeStudentRisk)
    .sort((a, b) => b.riskScore - a.riskScore);
}

export function getStudentsForAdvisor(advisorId, analyzedStudents = null) {
  const all = Array.isArray(analyzedStudents) ? analyzedStudents : analyzeAllStudents();
  const advisorAccount = AUTH_ACCOUNTS.find(
    (account) => account.role === 'advisor' && account.profile?.id === advisorId,
  );
  const advisorGender = String(advisorAccount?.profile?.gender || '').toLowerCase();

  if (advisorGender === 'female') {
    return all.filter((student) => String(student?.gender || '').toLowerCase() === 'female');
  }

  if (advisorGender === 'male') {
    return all.filter((student) => String(student?.gender || '').toLowerCase() === 'male');
  }

  return all;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  2. مولد خطة التدخل المتطورة (Intervention Generator)
// ═══════════════════════════════════════════════════════════════════════════════

export function generateIntervention(student, advisorName = 'د. خالد') {
  const analyzed = student.riskLevel ? student : analyzeStudentRisk(student);
  const urgency = analyzed.riskLevel === 'red' ? 'عاجلة جداً' : 'استباقية';

  const emailSubject = `📊 خطة دعم أكاديمي مخصصة ${urgency} — الطالب: ${analyzed.name}`;

  const emailBody = `السلام عليكم ورحمة الله، ${analyzed.name}

بصفتي مرشدك الأكاديمي (${advisorName})، يقوم نظام الذكاء الاصطناعي بالتتبع العميق للمخرجات (CLOs) للتأكد من تفوقك. رصدنا مؤخراً مؤشرات تتطلب تعزيزاً عاجلاً للمخرجات:

📌 الملاحظات الأكاديمية الدقيقة:
${analyzed.primaryReason}

الفجوات المرصودة بالأرقام:
${analyzed.factors.map(f => `  • ${f}`).join('\n')}

هذا التقرير هو إضاءة لطريقك نحو التفوق لتدارك الفجوات قبل التأثير على المعدل النهائي.
الرجاء مراجعة خطة العمل أدناه.

تحياتي،
${advisorName}`;

  // بناء الخطة العلاجية الأكاديمية الصارمة
  const actionPlan = [
    { step: 1, action: 'حضور جلسة توجيه وتقييم فجوات (Gap Assessment)', timeline: analyzed.riskLevel === 'red' ? 'خلال 48 ساعة' : 'خلال 5 أيام', owner: 'المرشد الأكاديمي' },
    { step: 2, action: 'تطبيق مهام برمجة وتصاميم خفيفة لإثبات إتقان الـ CLOs المتأثرة', timeline: 'أسبوعياً', owner: 'الطالب بالتعاون مع معيد المادة' },
  ];

  if (analyzed.primaryReason.includes('تراكمية')) {
    actionPlan.push({ step: 3, action: 'التسجيل الإجباري في ورش مراجعة متطلبات التأسيس السابقة', timeline: 'فوري', owner: 'عمادة القبول والتسجيل' });
  } else if (analyzed.primaryReason.includes('اللحظات الأخيرة') || analyzed.primaryReason.includes('نمط تسليم')) {
    actionPlan.push({ step: 3, action: 'تقسيم المهام وتحديد تسليم أولي إلزامي (Milestone) قبل الموعد بـ 3 أيام', timeline: 'بداية كل واجب', owner: 'المرشد الأكاديمي' });
  } else if (analyzed.primaryReason.includes('التطبيق العملي')) {
    actionPlan.push({ step: 3, action: 'توأمة الطالب مع زميل متفوق لمشروع عملي مشترك', timeline: 'خلال 3 أيام', owner: 'إدارة شؤون الطلاب' });
  }

  actionPlan.push({ step: actionPlan.length + 1, action: 'تقييم تكويني شامل لنسبة تحسن الـ CLO', timeline: 'ميدتيرم القادم', owner: 'أستاذ المادة' });

  const followUpDays = analyzed.riskLevel === 'red' ? 3 : 7;
  const followUpDate = new Date();
  followUpDate.setDate(followUpDate.getDate() + followUpDays);

  return {
    emailSubject,
    emailBody,
    actionPlan,
    followUpDate: followUpDate.toLocaleDateString('ar-SA'),
    generatedAt: new Date().toLocaleString('ar-SA'),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
//  3. الإشعارات والإحصاءات للمرشد
// ═══════════════════════════════════════════════════════════════════════════════

export function generateNotifications(role) {
  if (role === 'advisor') {
    return [
      { id: 1, type: 'danger',  time: 'منذ 5 دقائق',  text: 'تنبيه: "محمد عمار" يعاني من فجوة في منهجية الـ Multi-threading', read: false },
      { id: 2, type: 'warning', time: 'منذ 30 دقيقة', text: 'نمط تسليم متأخر رُصد مجدداً للطالب "عبدالرحمن"', read: false },
      { id: 3, type: 'success', time: 'منذ ساعة',     text: 'أسامة سلم تقييم الـ Frontend بنجاح بعد تدخل المرشد',  read: true },
      { id: 4, type: 'danger',  time: 'منذ 2 ساعة',   text: 'انخفاض في نتائج تحليل المخاطر الأكاديمي بسبب MATH205 لـ "أحمد عمرو"', read: false },
    ];
  }
  return [];
}

export function getAdvisorStats(students = null) {
  const all = Array.isArray(students) ? students : analyzeAllStudents();
  const redCount = all.filter(s => s.riskLevel === 'red').length;
  const yellowCount = all.filter(s => s.riskLevel === 'yellow').length;
  return {
    totalStudents: all.length,
    interventionsToday: redCount + yellowCount,
    redCount,
    yellowCount,
    successfulInterventions: 34,
    successRate: 88,
  };
}
