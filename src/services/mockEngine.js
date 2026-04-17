/**
 * services/mockEngine.js
 * محرك البيانات الذكي المركزي — يحاكي عمل الـ Backend/AI
 * 
 * كل دالة تُرجع بيانات ديناميكية كأنها قادمة من API حقيقي.
 * يمكن استبدال أي دالة لاحقاً بـ fetch() حقيقي بدون تغيير الواجهات.
 */

// ═══════════════════════════════════════════════════════════════════════════════
//  قاعدة البيانات الوهمية (Single Source of Truth)
// ═══════════════════════════════════════════════════════════════════════════════

export const STUDENTS_DB = [
  {
    id: '44120345', name: 'أحمد محمود', major: 'علوم الحاسب', year: 3, gpa: 1.3,
    attendance: 40, taskTimeRatio: 3.0, taskCompletion: 25, lateLogins: 6, incompleteLectures: 75,
    strongSkills: ['خوارزميات', 'رياضيات'], weakSkills: ['قواعد بيانات', 'شبكات'],
    email: 'ahmed.m@university.edu',
  },
  {
    id: '44210988', name: 'محمد عمار', major: 'علوم الحاسب', year: 2, gpa: 3.4,
    attendance: 82, taskTimeRatio: 2.1, taskCompletion: 72, lateLogins: 3, incompleteLectures: 40,
    strongSkills: ['رياضيات', 'إحصاء'], weakSkills: ['برمجة متقدمة', 'هياكل بيانات'],
    gender: 'male',
    email: 'mohammed.ammar@university.edu',
  },
  {
    id: '43990122', name: 'فهد عبدالله', major: 'هندسة البرمجيات', year: 4, gpa: 4.8,
    attendance: 97, taskTimeRatio: 0.9, taskCompletion: 98, lateLogins: 0, incompleteLectures: 2,
    strongSkills: ['برمجة متقدمة', 'هياكل بيانات', 'خوارزميات'], weakSkills: [],
    email: 'fahad.a@university.edu',
  },
  {
    id: '44112340', name: 'نورة سعد', major: 'علوم الحاسب', year: 2, gpa: 1.6,
    attendance: 42, taskTimeRatio: 2.5, taskCompletion: 30, lateLogins: 7, incompleteLectures: 70,
    strongSkills: ['تصميم واجهات'], weakSkills: ['خوارزميات', 'شبكات'],
    email: 'noura.s@university.edu',
  },
  {
    id: '44315200', name: 'عمر الشمري', major: 'نظم المعلومات', year: 3, gpa: 3.8,
    attendance: 90, taskTimeRatio: 1.1, taskCompletion: 91, lateLogins: 1, incompleteLectures: 10,
    strongSkills: ['قواعد بيانات', 'شبكات', 'إحصاء'], weakSkills: ['رياضيات'],
    email: 'omar.sh@university.edu',
  },
  {
    id: '44520101', name: 'لين الحربي', major: 'الذكاء الاصطناعي', year: 1, gpa: 4.2,
    attendance: 93, taskTimeRatio: 1.3, taskCompletion: 85, lateLogins: 2, incompleteLectures: 15,
    strongSkills: ['رياضيات', 'برمجة متقدمة'], weakSkills: ['إحصاء'],
    email: 'leen.h@university.edu',
  },
];

// حسابات تسجيل الدخول التجريبية (بيانات جاهزة للاستخدام في الواجهة)
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
    },
  },
  {
    role: 'student',
    login: 'mohammed.ammar@university.edu',
    altLogin: '44210988',
    password: 'Mohammed@2026',
    profile: {
      id: '44210988',
      name: 'محمد عمار',
      email: 'mohammed.ammar@university.edu',
      major: 'علوم الحاسب',
      year: 2,
      gender: 'male',
    },
  },
  {
    role: 'student',
    login: 'ahmed.m@university.edu',
    altLogin: '44120345',
    password: 'Ahmed@2026',
    profile: {
      id: '44120345',
      name: 'أحمد محمود',
      email: 'ahmed.m@university.edu',
      major: 'علوم الحاسب',
      year: 3,
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
    return {
      ok: false,
      message: 'يرجى إدخال جميع الحقول المطلوبة.',
    };
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
    return {
      ok: false,
      message: 'بيانات الدخول غير صحيحة. تأكد من الدور والبريد/الرقم وكلمة المرور.',
    };
  }

  return {
    ok: true,
    user: {
      ...account.profile,
      role: account.role,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
//  1. خوارزمية تحليل الخطورة (Risk Analysis Engine)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * يحسب مؤشر الخطورة لطالب واحد بناءً على 6 عوامل بأوزان مختلفة.
 * هذه نفس الخوارزمية الموجودة في الـ Backend (main.py) لكن بـ JS.
 */
export function analyzeStudentRisk(student) {
  const factors = [];
  let score = 0;

  // الوزن 1: المعدل التراكمي (25%)
  const gpaScore = Math.max(0, (2.5 - student.gpa) / 2.5) * 25;
  score += gpaScore;
  if (student.gpa < 2.0) factors.push('معدل تراكمي حرج دون 2.0');
  else if (student.gpa < 2.5) factors.push('معدل تراكمي منخفض دون 2.5');

  // الوزن 2: الحضور (20%)
  const attendanceScore = Math.max(0, (80 - student.attendance) / 80) * 20;
  score += attendanceScore;
  if (student.attendance < 60) factors.push('غياب مفرط يتجاوز 40%');
  else if (student.attendance < 80) factors.push('نسبة حضور دون المتوقع');

  // الوزن 3: وقت الإنجاز (15%)
  const timeScore = Math.min(15, Math.max(0, (student.taskTimeRatio - 1.5) / 1.5) * 15);
  score += timeScore;
  if (student.taskTimeRatio > 2.0) factors.push('يستغرق أكثر من ضعف الوقت المتوقع في المهام');

  // الوزن 4: إكمال المهام (25%)
  const taskScore = Math.max(0, (70 - student.taskCompletion) / 70) * 25;
  score += taskScore;
  if (student.taskCompletion < 50) factors.push('أقل من نصف المهام مكتملة');
  else if (student.taskCompletion < 70) factors.push('معدل إكمال المهام منخفض');

  // الوزن 5: الدخول المتأخر (10%)
  const lateScore = Math.min(10, student.lateLogins * 1.5);
  score += lateScore;
  if (student.lateLogins >= 5) factors.push('نمط دخول متأخر متكرر (مؤشر قلق أو اضطراب نوم)');

  // الوزن 6: المحاضرات غير المكتملة (5%)
  const lectureScore = Math.min(5, (student.incompleteLectures / 100) * 5);
  score += lectureScore;
  if (student.incompleteLectures > 50) factors.push('أكثر من نصف المحاضرات لم تكتمل');

  score = Math.round(score * 100) / 100;

  // تحديد المستوى
  let riskLevel, riskLabel;
  if (score >= 55) { riskLevel = 'red'; riskLabel = 'خطر — تدخل فوري'; }
  else if (score >= 30) { riskLevel = 'yellow'; riskLabel = 'تحذير — يحتاج مراقبة'; }
  else { riskLevel = 'green'; riskLabel = 'مسار سليم'; }

  // استنتاج السبب الجذري
  const combined = factors.join(' ');
  let primaryReason;
  if (combined.includes('متأخر') && score > 50) primaryReason = 'قلق أكاديمي مزمن واضطراب إدارة الوقت';
  else if (combined.includes('غياب مفرط')) primaryReason = 'انفصال عاطفي عن البيئة الأكاديمية';
  else if (combined.includes('ضعف الوقت')) primaryReason = 'فجوة في المفاهيم الأساسية تعيق الفهم';
  else if (combined.includes('نصف المهام')) primaryReason = 'سوء إدارة المهام والأولويات';
  else if (score > 60) primaryReason = 'تراكم متعدد المصادر يستدعي تدخلاً شاملاً';
  else primaryReason = 'ضغط أكاديمي قابل للمعالجة بتوجيه مبكر';

  // قائمة التوصيات
  let recommendations;
  if (riskLevel === 'red') {
    recommendations = [
      'جدولة لقاء عاجل مع المرشد خلال 48 ساعة',
      'إحالة لوحدة الدعم النفسي إذا تأكدت مؤشرات القلق',
      'وضع خطة تعافٍ أسبوعية بأهداف قابلة للقياس',
    ];
  } else if (riskLevel === 'yellow') {
    recommendations = [
      'متابعة أسبوعية منتظمة من المرشد',
      'اقتراح برامج إدارة الوقت وتقنيات المذاكرة',
      'تفعيل التوأمة الأكاديمية مع زميل متفوق',
    ];
  } else {
    recommendations = [
      'استمر في مسارك الممتاز',
      'فكّر في برامج الطلاب المتميزين',
    ];
  }

  return {
    ...student,
    riskLevel, riskLabel, riskScore: score,
    primaryReason, factors, recommendations,
  };
}

/** يحلل كل الطلاب ويرتبهم حسب الخطورة */
export function analyzeAllStudents() {
  return STUDENTS_DB
    .map(analyzeStudentRisk)
    .sort((a, b) => b.riskScore - a.riskScore);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  2. مولد خطة التدخل (Intervention Generator)
// ═══════════════════════════════════════════════════════════════════════════════

export function generateIntervention(student, advisorName = 'د. خالد') {
  const analyzed = student.riskLevel ? student : analyzeStudentRisk(student);
  const urgency = analyzed.riskLevel === 'red' ? 'عاجلة جداً' : 'استباقية';

  const emailSubject = `📚 رسالة دعم أكاديمي ${urgency} — ${analyzed.name}`;

  const emailBody = `السلام عليكم ورحمة الله، ${analyzed.name}

أتواصل معك ${advisorName} بشكل شخصي، ليس لأنك أخطأت، بل لأن النظام الذكي لاحظ بعض الإشارات التي قد تؤثر على مسيرتك الأكاديمية، وأريد أن أكون بجانبك قبل أن تستفحل.

📊 ما لاحظناه:
${analyzed.primaryReason}

العوامل المساهمة:
${analyzed.factors.map(f => `  • ${f}`).join('\n')}

نحن هنا لمساعدتك، وهذه الرسالة هي بداية الحل، وليست تقريعاً.

ما الذي تحتاجه؟ أخبرني، دعنا نخطط معاً.

مع تحياتي الصادقة،
${advisorName}
نظام راصد بلس — الإرشاد الأكاديمي الذكي`;

  // بناء الخطة العلاجية
  const actionPlan = [
    { step: 1, action: 'مقابلة شخصية مع المرشد', timeline: analyzed.riskLevel === 'red' ? 'خلال 48 ساعة' : 'خلال أسبوع', owner: 'المرشد' },
    { step: 2, action: 'تحليل الجدول الأسبوعي وإعادة هيكلته', timeline: 'خلال 3 أيام من اللقاء', owner: 'المرشد + الطالب' },
  ];

  if (analyzed.primaryReason.includes('قلق')) {
    actionPlan.push({ step: 3, action: 'إحالة لوحدة الإرشاد النفسي', timeline: 'خلال أسبوع', owner: 'المرشد' });
  } else if (analyzed.primaryReason.includes('إدارة') || analyzed.primaryReason.includes('مهام')) {
    actionPlan.push({ step: 3, action: 'ورشة تقنيات إدارة المهام (Pomodoro + GTD)', timeline: 'خلال أسبوعين', owner: 'الدعم الأكاديمي' });
  } else if (analyzed.primaryReason.includes('انفصال')) {
    actionPlan.push({ step: 3, action: 'التواصل مع الأسرة بإذن الطالب', timeline: 'خلال 3 أيام', owner: 'المرشد' });
  }

  actionPlan.push({ step: actionPlan.length + 1, action: 'جلسة متابعة لتقييم التحسن', timeline: 'بعد 3 أسابيع', owner: 'المرشد' });

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
//  3. الإشعارات (Notifications)
// ═══════════════════════════════════════════════════════════════════════════════

export function generateNotifications(role) {
  if (role === 'advisor') {
    return [
      { id: 1, type: 'danger',  time: 'منذ 5 دقائق',  text: 'أحمد محمود: لم يحضر 3 محاضرات متتالية',       read: false },
      { id: 2, type: 'warning', time: 'منذ 30 دقيقة', text: 'نورة سعد: تسجيل دخول في 3:00 فجراً',          read: false },
      { id: 3, type: 'success', time: 'منذ ساعة',     text: 'عمر الشمري: رفع معدله من 3.5 إلى 3.8',       read: true },
      { id: 4, type: 'info',    time: 'منذ 2 ساعة',    text: 'CS301: 60% فشل في الاختبار النصفي (رادار)',   read: false },
      { id: 5, type: 'success', time: 'أمس',           text: 'خطة تدخل محمد عمار: بدأت تظهر تحسناً',       read: true },
    ];
  }
  return [
    { id: 1, type: 'danger',  time: 'منذ 10 دقائق', text: 'تذكير: تسليم تقرير هياكل البيانات غداً!',     read: false },
    { id: 2, type: 'info',    time: 'منذ ساعة',     text: 'أحمد وافق على جلسة التوأمة — غداً 4 مساءً',  read: false },
    { id: 3, type: 'success', time: 'منذ 3 ساعات',  text: 'أكمل اختبار الإحصاء التطبيقي بنجاح!',        read: true },
    { id: 4, type: 'info',    time: 'أمس',           text: 'كورس Data Analysis متاح الآن على Coursera',  read: false },
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
//  4. إحصاءات المرشد (Advisor Stats)
// ═══════════════════════════════════════════════════════════════════════════════

export function getAdvisorStats() {
  const all = analyzeAllStudents();
  const redCount = all.filter(s => s.riskLevel === 'red').length;
  const yellowCount = all.filter(s => s.riskLevel === 'yellow').length;
  return {
    totalStudents: 1248,
    interventionsToday: redCount + yellowCount,
    redCount,
    yellowCount,
    successfulInterventions: 34,
    successRate: 88,
  };
}
