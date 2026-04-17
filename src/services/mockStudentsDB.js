// High-entropy mock dataset for 40 unique CS/SE students.
// The generator is deterministic by student id to keep test runs stable.

const SUBMISSION_PATTERNS = [
  'مبكر جداً',
  'على الوقت',
  'الدقيقة الأخيرة (11:59pm)',
  'متأخر مزمن',
  'متذبذب',
];

const ATTENDANCE_TRENDS = [
  'منتظم 100%',
  'غياب تدريجي',
  'انقطاع مفاجئ مؤخراً',
  'غياب في المحاضرات النظرية فقط',
];

const LEARNING_STYLE_GAPS = [
  'ضعف في النظري/قوة في العملي',
  'قوة في الحفظ/ضعف في حل المشكلات',
  'ضعف في العمل الجماعي',
];

const FOCUS_WINDOWS = ['فجراً', 'صباحاً', 'مساءً', 'بعد منتصف الليل'];
const MOTIVATION_DRIVERS = ['منحة التميز', 'وظيفة تعاونية', 'مشروع تخرج مبتكر', 'مسابقة برمجية', 'تحدي شخصي'];
const SUPPORT_NEEDS = ['توجيه أكاديمي أسبوعي', 'دعم نفسي خفيف', 'جلسات مهارات اختبار', 'متابعة إدارة وقت', 'مختبر تقوية'];
const STUDY_HABITS = ['تلخيص يدوي', 'مراجعة فيديو', 'مذاكرة جماعية', 'حل بنوك أسئلة', 'تطبيقات عملية'];
const SKILL_POOL = [
  'إدارة الوقت',
  'تفكيك المشكلات',
  'تحليل المتطلبات',
  'التوثيق التقني',
  'الاختبارات الكتابية',
  'التواصل في الفريق',
  'تصميم الخوارزميات',
  'تقدير التعقيد الزمني',
  'ربط النظري بالتطبيق',
  'حل أسئلة الاحتمالات',
];

const COURSE_CATALOG = [
  { code: 'SE301', name: 'Software Architecture', theoretical: true },
  { code: 'CS302', name: 'Data Structures', theoretical: true },
  { code: 'CS303', name: 'Algorithms', theoretical: true },
  { code: 'CS341', name: 'Database Systems', theoretical: true },
  { code: 'CS352', name: 'Operating Systems', theoretical: true },
  { code: 'CS372', name: 'Computer Networks', theoretical: true },
  { code: 'CS421', name: 'Machine Learning', theoretical: true },
  { code: 'CS422', name: 'Artificial Intelligence', theoretical: true },
  { code: 'SE351', name: 'Software Testing', theoretical: false },
  { code: 'SE361', name: 'DevOps Engineering', theoretical: false },
  { code: 'SE371', name: 'Cloud Computing', theoretical: false },
  { code: 'SE381', name: 'Mobile App Development', theoretical: false },
  { code: 'SE391', name: 'Full-Stack Engineering', theoretical: false },
  { code: 'CS431', name: 'Data Visualization', theoretical: false },
  { code: 'CS441', name: 'Information Security', theoretical: true },
  { code: 'SE441', name: 'Distributed Systems', theoretical: true },
];

const STUDENT_IDENTITIES = [
  { id: 'SCS25001', name: 'محمد عمار القحطاني', gender: 'male', major: 'هندسة برمجيات', level: 7 },
  { id: 'SCS25002', name: 'ريم ناصر الشهري', gender: 'female', major: 'علوم الحاسب', level: 8 },
  { id: 'SCS25003', name: 'لينا خالد المالكي', gender: 'female', major: 'هندسة برمجيات', level: 5 },
  { id: 'SCS25004', name: 'سلمان عبدالله المطيري', gender: 'male', major: 'علوم الحاسب', level: 6 },
  { id: 'SCS25005', name: 'يارا فهد العتيبي', gender: 'female', major: 'هندسة برمجيات', level: 4 },
  { id: 'SCS25006', name: 'وليد سعد الحربي', gender: 'male', major: 'علوم الحاسب', level: 7 },
  { id: 'SCS25007', name: 'نوف محمد الدوسري', gender: 'female', major: 'علوم الحاسب', level: 3 },
  { id: 'SCS25008', name: 'عبدالعزيز حسن العنزي', gender: 'male', major: 'هندسة برمجيات', level: 6 },
  { id: 'SCS25009', name: 'ميار علي الزهراني', gender: 'female', major: 'علوم الحاسب', level: 5 },
  { id: 'SCS25010', name: 'طارق سامي الغامدي', gender: 'male', major: 'هندسة برمجيات', level: 8 },
  { id: 'SCS25011', name: 'فيصل تركي الشهراني', gender: 'male', major: 'علوم الحاسب', level: 6 },
  { id: 'SCS25012', name: 'شهد ماجد القحطاني', gender: 'female', major: 'هندسة برمجيات', level: 7 },
  { id: 'SCS25013', name: 'رائد نواف الشمري', gender: 'male', major: 'علوم الحاسب', level: 4 },
  { id: 'SCS25014', name: 'جود هاني البقمي', gender: 'female', major: 'علوم الحاسب', level: 7 },
  { id: 'SCS25015', name: 'أحمد ياسر الدخيل', gender: 'male', major: 'هندسة برمجيات', level: 5 },
  { id: 'SCS25016', name: 'رغد إبراهيم العتيبي', gender: 'female', major: 'علوم الحاسب', level: 8 },
  { id: 'SCS25017', name: 'منذر خالد الفيفي', gender: 'male', major: 'هندسة برمجيات', level: 3 },
  { id: 'SCS25018', name: 'مها ناصر السبيعي', gender: 'female', major: 'علوم الحاسب', level: 5 },
  { id: 'SCS25019', name: 'حسن فهد العجمي', gender: 'male', major: 'علوم الحاسب', level: 8 },
  { id: 'SCS25020', name: 'دانة عمر القحطاني', gender: 'female', major: 'هندسة برمجيات', level: 6 },
  { id: 'SCS25021', name: 'مازن صالح الدوسري', gender: 'male', major: 'علوم الحاسب', level: 7 },
  { id: 'SCS25022', name: 'سارة راشد الحارثي', gender: 'female', major: 'علوم الحاسب', level: 4 },
  { id: 'SCS25023', name: 'عبدالرحمن علي الشهري', gender: 'male', major: 'هندسة برمجيات', level: 5 },
  { id: 'SCS25024', name: 'لولوة منصور الزهراني', gender: 'female', major: 'هندسة برمجيات', level: 8 },
  { id: 'SCS25025', name: 'إياد ممدوح السهلي', gender: 'male', major: 'علوم الحاسب', level: 6 },
  { id: 'SCS25026', name: 'تهاني فيصل المطيري', gender: 'female', major: 'علوم الحاسب', level: 7 },
  { id: 'SCS25027', name: 'زياد ناصر البلوي', gender: 'male', major: 'هندسة برمجيات', level: 4 },
  { id: 'SCS25028', name: 'هند تركي الحربي', gender: 'female', major: 'علوم الحاسب', level: 5 },
  { id: 'SCS25029', name: 'رامي فواز الغامدي', gender: 'male', major: 'هندسة برمجيات', level: 6 },
  { id: 'SCS25030', name: 'سندس عبدالله القاسم', gender: 'female', major: 'علوم الحاسب', level: 5 },
  { id: 'SCS25031', name: 'مهند عبدالعزيز العنزي', gender: 'male', major: 'علوم الحاسب', level: 7 },
  { id: 'SCS25032', name: 'نجلاء إبراهيم الشمراني', gender: 'female', major: 'هندسة برمجيات', level: 8 },
  { id: 'SCS25033', name: 'بدر ماجد الخالدي', gender: 'male', major: 'هندسة برمجيات', level: 3 },
  { id: 'SCS25034', name: 'أروى خالد الزهراني', gender: 'female', major: 'علوم الحاسب', level: 4 },
  { id: 'SCS25035', name: 'أصيل عبدالله الحازمي', gender: 'male', major: 'علوم الحاسب', level: 8 },
  { id: 'SCS25036', name: 'ربى فهد السلمي', gender: 'female', major: 'هندسة برمجيات', level: 6 },
  { id: 'SCS25037', name: 'خالد سامي الحربي', gender: 'male', major: 'هندسة برمجيات', level: 5 },
  { id: 'SCS25038', name: 'ريم علي الدوسري', gender: 'female', major: 'علوم الحاسب', level: 7 },
  { id: 'SCS25039', name: 'طلال نواف الشهراني', gender: 'male', major: 'علوم الحاسب', level: 6 },
  { id: 'SCS25040', name: 'لين محمد القحطاني', gender: 'female', major: 'هندسة برمجيات', level: 4 },
];

function hashString(input) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return Math.abs(hash >>> 0);
}

function seededInt(seed, min, max) {
  const normalized = Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1;
  return Math.floor(normalized * (max - min + 1)) + min;
}

function pickByEntropy(list, key, salt) {
  const seed = hashString(`${key}:${salt}`);
  return list[seed % list.length];
}

function pickManyByEntropy(list, key, salt, count) {
  const shuffled = shuffleBySeed(list, `${key}:${salt}`);
  return shuffled.slice(0, count);
}

function shuffleBySeed(items, key) {
  const cloned = [...items];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = hashString(`${key}:${i}`) % (i + 1);
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function rotateBySeed(list, key, salt, offset = 0) {
  const idx = (hashString(`${key}:${salt}`) + offset) % list.length;
  return list[idx];
}

function toIsoTime(day, hour, minute) {
  const hh = String(hour).padStart(2, '0');
  const mm = String(minute).padStart(2, '0');
  return `2026-03-${String(day).padStart(2, '0')}T${hh}:${mm}:00Z`;
}

function buildSubmissionHistory(pattern, studentId, courseCode) {
  const base = hashString(`${studentId}:${courseCode}`);
  const deadlines = [10, 17, 24, 30].map((day) => `${toIsoTime(day, 23, 59)}`);

  return deadlines.map((deadline, idx) => {
    if (pattern === 'مبكر جداً') {
      return {
        assignment: `A${idx + 1}`,
        due_at: deadline,
        submitted_at: toIsoTime(8 + idx * 7, 10, 30),
      };
    }

    if (pattern === 'على الوقت') {
      return {
        assignment: `A${idx + 1}`,
        due_at: deadline,
        submitted_at: toIsoTime(10 + idx * 7, 22, seededInt(base + idx, 20, 55)),
      };
    }

    if (pattern === 'الدقيقة الأخيرة (11:59pm)') {
      return {
        assignment: `A${idx + 1}`,
        due_at: deadline,
        submitted_at: toIsoTime(10 + idx * 7, 23, 56),
      };
    }

    if (pattern === 'متأخر مزمن') {
      return {
        assignment: `A${idx + 1}`,
        due_at: deadline,
        submitted_at: toIsoTime(11 + idx * 7, seededInt(base + idx, 8, 12), seededInt(base + idx, 5, 50)),
      };
    }

    return {
      assignment: `A${idx + 1}`,
      due_at: deadline,
      submitted_at: idx % 2 === 0
        ? toIsoTime(9 + idx * 7, 14, seededInt(base + idx, 10, 55))
        : toIsoTime(11 + idx * 7, 1, seededInt(base + idx, 5, 45)),
    };
  });
}

function buildEntropyProfile(identity, gpa) {
  const key = identity.id;
  const primarySubmission = pickByEntropy(SUBMISSION_PATTERNS, key, 'submission-primary');
  const secondarySubmission = rotateBySeed(SUBMISSION_PATTERNS, key, 'submission-secondary', 2);
  const attendanceTrend = pickByEntropy(ATTENDANCE_TRENDS, key, 'attendance');
  const learningGap = pickByEntropy(LEARNING_STYLE_GAPS, key, 'learning');
  const stressIndex = seededInt(hashString(`${key}:stress`), 18, 91);
  const collaborationIndex = seededInt(hashString(`${key}:collab`), 32, 96);
  const practicalBias = clamp(Math.round((gpa / 5) * 100) + seededInt(hashString(`${key}:practical`), -18, 22), 25, 98);
  const theoreticalBias = clamp(Math.round((gpa / 5) * 100) + seededInt(hashString(`${key}:theory`), -20, 20), 20, 98);

  return {
    primarySubmission,
    secondarySubmission,
    attendanceTrend,
    learningGap,
    stressIndex,
    collaborationIndex,
    practicalBias,
    theoreticalBias,
    focusWindow: pickByEntropy(FOCUS_WINDOWS, key, 'focus-window'),
    motivationDriver: pickByEntropy(MOTIVATION_DRIVERS, key, 'motivation'),
    supportNeed: pickByEntropy(SUPPORT_NEEDS, key, 'support'),
    studyHabit: pickByEntropy(STUDY_HABITS, key, 'habit'),
  };
}

function deriveCourseSubmissionPattern(profile, studentId, courseCode, courseIndex) {
  if (profile.stressIndex > 80 && courseIndex >= 3) return 'الدقيقة الأخيرة (11:59pm)';
  if (profile.stressIndex > 72 && courseIndex % 2 === 1) return profile.secondarySubmission;
  if (profile.learningGap === 'ضعف في العمل الجماعي' && courseCode.startsWith('SE3')) return 'متذبذب';
  if (profile.attendanceTrend === 'انقطاع مفاجئ مؤخراً' && courseIndex >= 2) return 'متأخر مزمن';
  return courseIndex % 3 === 0 ? profile.primarySubmission : profile.secondarySubmission;
}

function buildWeakSkills(profile, studentId) {
  const selected = pickManyByEntropy(SKILL_POOL, studentId, 'weak-skills', 2);
  if (profile.learningGap === 'ضعف في النظري/قوة في العملي') {
    return [...selected, 'فهم الأطر النظرية'];
  }
  if (profile.learningGap === 'قوة في الحفظ/ضعف في حل المشكلات') {
    return [...selected, 'الانتقال من الحفظ إلى التطبيق'];
  }
  return [...selected, 'تنسيق العمل الجماعي'];
}

function buildAcademicHistory(studentId, gpa) {
  const termCount = seededInt(hashString(`${studentId}:term-count`), 3, 5);
  const terms = ['1444-2', '1445-1', '1445-2', '1446-1', '1446-2'];
  const start = terms.length - termCount;

  return terms.slice(start).map((term, idx) => {
    const drift = seededInt(hashString(`${studentId}:${term}:drift`), -3, 3) / 10;
    const momentum = idx === termCount - 1 ? seededInt(hashString(`${studentId}:latest`), -2, 2) / 10 : 0;
    return {
      term,
      gpa: clamp(gpa + drift + momentum, 1.8, 4.9),
    };
  });
}

function deriveAttendanceRate(trend, course, studentId) {
  const seed = hashString(`${studentId}:${course.code}:attendance`);

  if (trend === 'منتظم 100%') {
    return seededInt(seed, 96, 100);
  }

  if (trend === 'غياب تدريجي') {
    return seededInt(seed, 68, 88);
  }

  if (trend === 'انقطاع مفاجئ مؤخراً') {
    return seededInt(seed, 58, 82);
  }

  if (trend === 'غياب في المحاضرات النظرية فقط') {
    return course.theoretical ? seededInt(seed, 62, 78) : seededInt(seed, 90, 100);
  }

  return seededInt(seed, 70, 95);
}

function applyLearningGapToScores(gap, baseTheory, basePractical) {
  let theory = baseTheory;
  let practical = basePractical;

  if (gap === 'ضعف في النظري/قوة في العملي') {
    theory -= 14;
    practical += 12;
  } else if (gap === 'قوة في الحفظ/ضعف في حل المشكلات') {
    theory += 10;
    practical -= 9;
  } else if (gap === 'ضعف في العمل الجماعي') {
    practical -= 7;
  }

  return {
    theory: clamp(Math.round(theory), 5, 100),
    practical: clamp(Math.round(practical), 5, 100),
  };
}

function buildCourseRecord(student, course, profile, courseIndex) {
  const seed = hashString(`${student.id}:${course.code}`);
  const gpaPercent = (student.gpa / 5) * 100;
  const submissionPattern = deriveCourseSubmissionPattern(profile, student.id, course.code, courseIndex);
  const baselineLift = 6;

  const theoryBase = gpaPercent + baselineLift + seededInt(seed, -10, 12) + Math.round((profile.theoreticalBias - 60) / 6);
  const practicalBase = gpaPercent + baselineLift + seededInt(seed + 99, -8, 14) + Math.round((profile.practicalBias - 60) / 6);
  const adjusted = applyLearningGapToScores(profile.learningGap, theoryBase, practicalBase);

  const midterm1 = clamp(Math.round((adjusted.theory / 100) * 20) + seededInt(seed + 8, -2, 2), 0, 20);
  const midterm2 = clamp(Math.round((adjusted.theory / 100) * 20) + seededInt(seed + 19, -2, 2), 0, 20);
  const quizzes = [
    clamp(Math.round((adjusted.theory / 100) * 10) + seededInt(seed + 21, -2, 2), 0, 10),
    clamp(Math.round((adjusted.theory / 100) * 10) + seededInt(seed + 22, -2, 2), 0, 10),
    clamp(Math.round((adjusted.theory / 100) * 10) + seededInt(seed + 23, -2, 2), 0, 10),
  ];

  const lab = clamp(Math.round((adjusted.practical / 100) * 30) + seededInt(seed + 35, -3, 3), 0, 30);
  const project = clamp(Math.round((adjusted.practical / 100) * 30) + seededInt(seed + 44, -3, 3), 0, 30);
  const finalExam = clamp(Math.round((adjusted.theory / 100) * 40) + seededInt(seed + 54, -4, 4), 0, 40);

  const cloAlgorithms = clamp(adjusted.practical + seededInt(seed + 61, -8, 8), 10, 98);
  const cloProbability = clamp(adjusted.theory + seededInt(seed + 63, -10, 10), 10, 96);
  const cloTeamwork = clamp(adjusted.practical + seededInt(seed + 66, -12, 9), 10, 95);

  return {
    course_code: course.code,
    course_name: course.name,
    grade: Math.round((midterm1 + midterm2 + finalExam + lab + project + quizzes.reduce((a, b) => a + b, 0)) / 1.7),
    attendance_rate: deriveAttendanceRate(profile.attendanceTrend, course, student.id),
    midterm_score: Math.round((midterm1 + midterm2) / 2),
    lab_project_score: Math.round((lab + project) / 2),
    submission_pattern: submissionPattern,
    clo_mastery: {
      CLO1_Algorithms: cloAlgorithms,
      CLO2_Probability: cloProbability,
      CLO3_Teamwork: cloTeamwork,
    },
    detailed_assessments: {
      midterms: {
        midterm_1: midterm1,
        midterm_2: midterm2,
        max_each: 20,
      },
      quizzes: {
        quiz_1: quizzes[0],
        quiz_2: quizzes[1],
        quiz_3: quizzes[2],
        max_each: 10,
      },
      lab: {
        score: lab,
        max: 30,
      },
      project: {
        score: project,
        max: 30,
      },
      final_exam: {
        score: finalExam,
        max: 40,
      },
    },
    submission_timestamps: buildSubmissionHistory(submissionPattern, student.id, course.code),
  };
}

function deriveRiskLevel(gpa, avgAttendance, submissionPattern, flagsCount) {
  if (flagsCount >= 3 || avgAttendance < 30) return 'Critical High';
  if (gpa < 2.1 || avgAttendance < 55 || submissionPattern === 'متأخر مزمن') return 'High';
  if (gpa < 3.0 || avgAttendance < 75 || submissionPattern === 'متذبذب') return 'Medium';
  return 'Low';
}

function buildStandardStudent(identity, index) {
  const gpaSeed = hashString(`${identity.id}:gpa`);
  const gpa = clamp(seededInt(gpaSeed, 30, 49) / 10, 3.0, 4.9);
  const profile = buildEntropyProfile(identity, gpa);

  const courseCount = seededInt(hashString(`${identity.id}:course-count`), 5, 6);
  const selectedCourses = shuffleBySeed(COURSE_CATALOG, `${identity.id}:courses`).slice(0, courseCount);
  const courseRecords = selectedCourses.map((course, courseIndex) => (
    buildCourseRecord({ ...identity, gpa }, course, profile, courseIndex)
  ));

  const avgAttendance = Math.round(
    courseRecords.reduce((sum, c) => sum + c.attendance_rate, 0) / courseRecords.length,
  );

  const flags = [];
  if (avgAttendance < 65) flags.push('انخفاض في الالتزام بالحضور');
  if (profile.primarySubmission === 'متأخر مزمن' || profile.secondarySubmission === 'متأخر مزمن') {
    flags.push('تأخر مزمن في التسليم');
  }
  if (profile.primarySubmission === 'متذبذب' || profile.secondarySubmission === 'متذبذب') {
    flags.push('نمط أداء غير مستقر');
  }
  if (gpa < 2.7) flags.push('تراجع أكاديمي ملحوظ');
  if (profile.stressIndex > 78) flags.push('ضغط رقمي مرتفع');
  if (profile.collaborationIndex < 45) flags.push('تعثر في مهارات التعاون');

  const submissionPatternSummary = `${profile.primarySubmission} → ${profile.secondarySubmission}`;

  return {
    ...identity,
    age: 19 + (index % 6),
    gpa,
    cumulative_gpa: gpa,
    risk_level: deriveRiskLevel(gpa, avgAttendance, profile.primarySubmission, flags.length),
    submission_pattern: submissionPatternSummary,
    attendance_trend: profile.attendanceTrend,
    learning_style_gap: profile.learningGap,
    weak_skills: buildWeakSkills(profile, identity.id),
    academic_flags: flags,
    behavior_profile: {
      focus_window: profile.focusWindow,
      motivation_driver: profile.motivationDriver,
      support_need: profile.supportNeed,
      study_habit: profile.studyHabit,
      stress_index: profile.stressIndex,
      collaboration_index: profile.collaborationIndex,
      practical_bias: profile.practicalBias,
      theoretical_bias: profile.theoreticalBias,
    },
    academic_history: {
      prerequisite_alerts: [],
      past_semesters: buildAcademicHistory(identity.id, gpa),
    },
    entropy_signature: `${profile.primarySubmission}|${profile.secondarySubmission}|${profile.attendanceTrend}|${profile.learningGap}|${profile.focusWindow}|${identity.id}`,
    current_semester_courses: courseRecords,
  };
}

function buildMohammedAmmarCase() {
  const student = {
    id: 'SCS25001',
    name: 'محمد عمار القحطاني',
    gender: 'male',
    major: 'هندسة برمجيات',
    level: 7,
    age: 23,
    gpa: 4.2,
    cumulative_gpa: 4.2,
    risk_level: 'High',
    submission_pattern: 'على الوقت',
    attendance_trend: 'منتظم 100%',
    learning_style_gap: 'قوة في الحفظ/ضعف في حل المشكلات',
    weak_skills: ['تحليل احتمالي متقدم', 'نمذجة عدم اليقين'],
    academic_flags: ['خطر رسوب في Artificial Intelligence رغم المعدل المرتفع'],
    academic_history: {
      prerequisite_alerts: [
        {
          course_code: 'STAT211',
          course_name: 'Probability and Statistics',
          term: '1445-2',
          grade: 'D',
          relevance: 'يؤثر مباشرة على CLO2 في الذكاء الاصطناعي',
        },
      ],
      past_semesters: [
        { term: '1445-1', gpa: 4.3 },
        { term: '1445-2', gpa: 4.1 },
        { term: '1446-1', gpa: 4.2 },
      ],
    },
    entropy_signature: 'special:hidden-prerequisite-victim',
    current_semester_courses: [
      {
        course_code: 'CS422',
        course_name: 'Artificial Intelligence',
        grade: 52,
        attendance_rate: 93,
        midterm_score: 9,
        lab_project_score: 23,
        submission_pattern: 'على الوقت',
        clo_mastery: {
          CLO1_Algorithms: 90,
          CLO2_Probability: 20,
          CLO3_Teamwork: 76,
        },
        detailed_assessments: {
          midterms: { midterm_1: 8, midterm_2: 10, max_each: 20 },
          quizzes: { quiz_1: 5, quiz_2: 4, quiz_3: 6, max_each: 10 },
          lab: { score: 24, max: 30 },
          project: { score: 22, max: 30 },
          final_exam: { score: 12, max: 40 },
        },
        submission_timestamps: buildSubmissionHistory('على الوقت', 'SCS25001', 'CS422'),
      },
      {
        course_code: 'SE301',
        course_name: 'Software Architecture',
        grade: 89,
        attendance_rate: 96,
        midterm_score: 17,
        lab_project_score: 27,
        submission_pattern: 'على الوقت',
        clo_mastery: {
          CLO1_Algorithms: 88,
          CLO2_Probability: 79,
          CLO3_Teamwork: 84,
        },
        detailed_assessments: {
          midterms: { midterm_1: 16, midterm_2: 18, max_each: 20 },
          quizzes: { quiz_1: 9, quiz_2: 8, quiz_3: 9, max_each: 10 },
          lab: { score: 27, max: 30 },
          project: { score: 26, max: 30 },
          final_exam: { score: 34, max: 40 },
        },
        submission_timestamps: buildSubmissionHistory('على الوقت', 'SCS25001', 'SE301'),
      },
      {
        course_code: 'CS303',
        course_name: 'Algorithms',
        grade: 91,
        attendance_rate: 95,
        midterm_score: 18,
        lab_project_score: 28,
        submission_pattern: 'على الوقت',
        clo_mastery: {
          CLO1_Algorithms: 94,
          CLO2_Probability: 74,
          CLO3_Teamwork: 80,
        },
        detailed_assessments: {
          midterms: { midterm_1: 18, midterm_2: 18, max_each: 20 },
          quizzes: { quiz_1: 9, quiz_2: 9, quiz_3: 9, max_each: 10 },
          lab: { score: 28, max: 30 },
          project: { score: 28, max: 30 },
          final_exam: { score: 36, max: 40 },
        },
        submission_timestamps: buildSubmissionHistory('على الوقت', 'SCS25001', 'CS303'),
      },
      {
        course_code: 'CS341',
        course_name: 'Database Systems',
        grade: 86,
        attendance_rate: 92,
        midterm_score: 16,
        lab_project_score: 26,
        submission_pattern: 'على الوقت',
        clo_mastery: {
          CLO1_Algorithms: 85,
          CLO2_Probability: 71,
          CLO3_Teamwork: 82,
        },
        detailed_assessments: {
          midterms: { midterm_1: 15, midterm_2: 17, max_each: 20 },
          quizzes: { quiz_1: 8, quiz_2: 8, quiz_3: 8, max_each: 10 },
          lab: { score: 26, max: 30 },
          project: { score: 25, max: 30 },
          final_exam: { score: 33, max: 40 },
        },
        submission_timestamps: buildSubmissionHistory('على الوقت', 'SCS25001', 'CS341'),
      },
      {
        course_code: 'SE351',
        course_name: 'Software Testing',
        grade: 88,
        attendance_rate: 97,
        midterm_score: 17,
        lab_project_score: 27,
        submission_pattern: 'على الوقت',
        clo_mastery: {
          CLO1_Algorithms: 89,
          CLO2_Probability: 70,
          CLO3_Teamwork: 86,
        },
        detailed_assessments: {
          midterms: { midterm_1: 16, midterm_2: 18, max_each: 20 },
          quizzes: { quiz_1: 9, quiz_2: 8, quiz_3: 9, max_each: 10 },
          lab: { score: 27, max: 30 },
          project: { score: 27, max: 30 },
          final_exam: { score: 34, max: 40 },
        },
        submission_timestamps: buildSubmissionHistory('على الوقت', 'SCS25001', 'SE351'),
      },
    ],
  };

  return student;
}

function buildPracticalGeniusCase() {
  const base = buildStandardStudent(STUDENT_IDENTITIES.find((s) => s.id === 'SCS25011'), 10);
  const courses = base.current_semester_courses.map((course) => ({
    ...course,
    grade: clamp(course.grade - 10, 45, 88),
    midterm_score: clamp(course.midterm_score - 8, 2, 12),
    lab_project_score: 30,
    detailed_assessments: {
      ...course.detailed_assessments,
      midterms: {
        ...course.detailed_assessments.midterms,
        midterm_1: clamp(course.detailed_assessments.midterms.midterm_1 - 8, 1, 9),
        midterm_2: clamp(course.detailed_assessments.midterms.midterm_2 - 7, 1, 10),
      },
      lab: { score: 30, max: 30 },
      project: { score: 30, max: 30 },
    },
  }));

  return {
    ...base,
    gpa: 3.1,
    cumulative_gpa: 3.4,
    risk_level: 'High',
    submission_pattern: 'على الوقت',
    attendance_trend: 'منتظم 100%',
    learning_style_gap: 'ضعف في النظري/قوة في العملي',
    weak_skills: ['اختبارات كتابية', 'تحويل الحل العملي إلى برهان نظري'],
    academic_flags: [
      'The Practical Genius: أداء عملي مثالي مقابل تعثر كتابي متكرر',
      'يحتاج مسار تقييم بديل ودعم استراتيجيات الاختبار',
    ],
    entropy_signature: 'special:practical-genius',
    current_semester_courses: courses,
  };
}

function buildSuddenDropCase() {
  const base = buildStandardStudent(STUDENT_IDENTITIES.find((s) => s.id === 'SCS25018'), 17);
  const courses = base.current_semester_courses.map((course) => ({
    ...course,
    attendance_rate: clamp(Math.round(course.attendance_rate * 0.4), 28, 45),
    detailed_assessments: {
      ...course.detailed_assessments,
      quizzes: {
        ...course.detailed_assessments.quizzes,
        quiz_1: clamp(Math.round(course.detailed_assessments.quizzes.quiz_1 * 0.45), 1, 10),
        quiz_2: clamp(Math.round(course.detailed_assessments.quizzes.quiz_2 * 0.4), 1, 10),
        quiz_3: clamp(Math.round(course.detailed_assessments.quizzes.quiz_3 * 0.35), 1, 10),
      },
    },
    submission_pattern: 'متأخر مزمن',
    submission_timestamps: buildSubmissionHistory('متأخر مزمن', base.id, course.course_code),
  }));

  return {
    ...base,
    gpa: 2.7,
    cumulative_gpa: 4.8,
    risk_level: 'Critical High',
    submission_pattern: 'متأخر مزمن',
    attendance_trend: 'انقطاع مفاجئ مؤخراً',
    learning_style_gap: 'ضعف في العمل الجماعي',
    weak_skills: ['الاستمرارية الدراسية', 'الضغط النفسي'],
    academic_flags: [
      'The Sudden Drop: انهيار مفاجئ بنسبة 60% في الحضور والتسليم',
      'يتطلب تدخل إرشادي نفسي/أكاديمي عاجل',
      'مؤشر إنذار أحمر عبر جميع المقررات',
    ],
    academic_history: {
      prerequisite_alerts: [],
      past_semesters: [
        { term: '1444-2', gpa: 4.8 },
        { term: '1445-1', gpa: 4.8 },
        { term: '1445-2', gpa: 4.7 },
        { term: '1446-1', gpa: 4.8 },
      ],
    },
    entropy_signature: 'special:sudden-drop',
    current_semester_courses: courses,
  };
}

function buildLastMinuteCoderCase() {
  const base = buildStandardStudent(STUDENT_IDENTITIES.find((s) => s.id === 'SCS25024'), 23);
  const courses = base.current_semester_courses.map((course) => ({
    ...course,
    grade: clamp(course.grade + 6, 82, 98),
    attendance_rate: clamp(course.attendance_rate, 84, 100),
    submission_pattern: 'الدقيقة الأخيرة (11:59pm)',
    submission_timestamps: buildSubmissionHistory('الدقيقة الأخيرة (11:59pm)', base.id, course.course_code),
  }));

  return {
    ...base,
    gpa: 4.6,
    cumulative_gpa: 4.5,
    risk_level: 'Medium',
    submission_pattern: 'الدقيقة الأخيرة (11:59pm)',
    attendance_trend: 'منتظم 100%',
    learning_style_gap: 'قوة في الحفظ/ضعف في حل المشكلات',
    weak_skills: ['إدارة الوقت', 'الوقاية من الإرهاق الرقمي'],
    academic_flags: [
      'The Last-Minute Coder: جميع تسليمات البرمجة قبل الإغلاق بثلاث دقائق تقريباً',
      'مؤشر خطر إرهاق رقمي',
    ],
    entropy_signature: 'special:last-minute-coder',
    current_semester_courses: courses,
  };
}

function buildGhostCase() {
  const base = buildStandardStudent(STUDENT_IDENTITIES.find((s) => s.id === 'SCS25030'), 29);
  const courses = base.current_semester_courses.map((course) => ({
    ...course,
    grade: clamp(course.grade - 35, 0, 42),
    attendance_rate: 10,
    midterm_score: clamp(course.midterm_score - 10, 0, 8),
    lab_project_score: 0,
    submission_pattern: 'متأخر مزمن',
    detailed_assessments: {
      ...course.detailed_assessments,
      midterms: {
        ...course.detailed_assessments.midterms,
        midterm_1: clamp(course.detailed_assessments.midterms.midterm_1 - 10, 0, 8),
        midterm_2: clamp(course.detailed_assessments.midterms.midterm_2 - 10, 0, 8),
      },
      quizzes: {
        ...course.detailed_assessments.quizzes,
        quiz_1: 0,
        quiz_2: 0,
        quiz_3: 0,
      },
      lab: { score: 0, max: 30 },
      project: { score: 0, max: 30 },
      final_exam: { score: clamp(course.detailed_assessments.final_exam.score - 20, 0, 12), max: 40 },
    },
    submission_timestamps: [
      {
        assignment: 'A1',
        due_at: toIsoTime(10, 23, 59),
        submitted_at: toIsoTime(11, 10, 5),
      },
      {
        assignment: 'A2',
        due_at: toIsoTime(17, 23, 59),
        submitted_at: toIsoTime(18, 11, 33),
      },
      {
        assignment: 'A3',
        due_at: toIsoTime(24, 23, 59),
        submitted_at: null,
      },
      {
        assignment: 'A4',
        due_at: toIsoTime(30, 23, 59),
        submitted_at: null,
      },
    ],
  }));

  return {
    ...base,
    gpa: 1.1,
    cumulative_gpa: 2.4,
    risk_level: 'Critical High',
    submission_pattern: 'متأخر مزمن',
    attendance_trend: 'انقطاع مفاجئ مؤخراً',
    learning_style_gap: 'ضعف في العمل الجماعي',
    weak_skills: ['انقطاع شامل', 'فقدان الارتباط الأكاديمي'],
    academic_flags: [
      'The Ghost: حضور 10% وانعدام التسليم بعد الأسبوع الثالث',
      'انقطاع شامل - يتطلب طي قيد أو تواصل طارئ',
      'حالة حرجة تحتاج بروتوكول إنقاذ فوري',
    ],
    entropy_signature: 'special:ghost',
    current_semester_courses: courses,
  };
}

function buildStudentsDB() {
  const specialBuilders = {
    SCS25001: buildMohammedAmmarCase,
    SCS25011: buildPracticalGeniusCase,
    SCS25018: buildSuddenDropCase,
    SCS25024: buildLastMinuteCoderCase,
    SCS25030: buildGhostCase,
  };

  return STUDENT_IDENTITIES.map((identity, index) => {
    const builder = specialBuilders[identity.id];
    if (builder) return builder();
    return buildStandardStudent(identity, index);
  });
}

export const studentsDB = buildStudentsDB();
export default studentsDB;
