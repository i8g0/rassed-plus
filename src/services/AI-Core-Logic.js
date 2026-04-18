import { sendMessageToAI } from './aiService';

const CRITICAL_CLO_THRESHOLD = 60;

function toNumber(value, fallback = null) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function getStudentCourses(student) {
  if (Array.isArray(student?.current_courses)) return student.current_courses;
  if (Array.isArray(student?.current_semester_courses)) return student.current_semester_courses;
  return [];
}

function getCourseCloMap(course) {
  return course?.clo_analytics || course?.clo_mastery || {};
}

function getStudentAttendance(student) {
  const directAttendance = toNumber(student?.attendance, null);
  if (directAttendance !== null) return directAttendance;

  const rates = getStudentCourses(student)
    .map((course) => toNumber(course?.attendance_percentage ?? course?.attendance_rate, null))
    .filter((value) => value !== null);

  if (!rates.length) return null;
  return rates.reduce((sum, v) => sum + v, 0) / rates.length;
}

function getAllCloPairs(student) {
  const pairs = [];

  getStudentCourses(student).forEach((course) => {
    const map = getCourseCloMap(course);
    Object.entries(map).forEach(([clo, value]) => {
      const numeric = toNumber(value, null);
      if (numeric !== null) {
        pairs.push({
          clo,
          value: numeric,
          courseName: course?.course_name || course?.name || 'مقرر غير معروف',
          courseCode: course?.course_code || course?.code || null,
        });
      }
    });
  });

  return pairs;
}

function getLowestClo(student) {
  const pairs = getAllCloPairs(student);
  if (!pairs.length) return null;
  return pairs.reduce((lowest, item) => (item.value < lowest.value ? item : lowest), pairs[0]);
}

function getCriticalCloGapsCount(student) {
  return getAllCloPairs(student).filter((item) => item.value < CRITICAL_CLO_THRESHOLD).length;
}

function normalizeSubmissionRows(course) {
  const rows = Array.isArray(course?.submission_timestamps) ? course.submission_timestamps : [];
  return rows
    .map((row) => ({
      dueAt: row?.due_at || row?.deadline || null,
      submittedAt: row?.submitted_at || row?.actual_submission || null,
    }))
    .filter((row) => row.dueAt);
}

function calculateSubmissionDrop(student) {
  const allRows = getStudentCourses(student)
    .flatMap(normalizeSubmissionRows)
    .map((row) => ({
      due: new Date(row.dueAt),
      submitted: row.submittedAt ? new Date(row.submittedAt) : null,
    }))
    .filter((row) => Number.isFinite(row?.due?.getTime?.()))
    .sort((a, b) => a.due - b.due);

  if (allRows.length < 2) return null;

  const latestDue = allRows[allRows.length - 1].due;
  const oneDay = 24 * 60 * 60 * 1000;
  const lastWeekStart = new Date(latestDue.getTime() - 7 * oneDay);
  const prevWeekStart = new Date(latestDue.getTime() - 14 * oneDay);

  const inLastWeek = allRows.filter((row) => row.due > lastWeekStart && row.due <= latestDue);
  const inPrevWeek = allRows.filter((row) => row.due > prevWeekStart && row.due <= lastWeekStart);

  if (!inLastWeek.length || !inPrevWeek.length) return null;

  const completionRate = (rows) => {
    const done = rows.filter((row) => row.submitted && Number.isFinite(row.submitted.getTime())).length;
    return (done / rows.length) * 100;
  };

  const lastRate = completionRate(inLastWeek);
  const prevRate = completionRate(inPrevWeek);

  if (prevRate <= 0) return null;
  const dropPercent = ((prevRate - lastRate) / prevRate) * 100;

  return {
    dropPercent,
    previousCompletionRate: Number(prevRate.toFixed(1)),
    currentCompletionRate: Number(lastRate.toFixed(1)),
    isUrgent: dropPercent >= 40,
  };
}

function computePredictiveRisk(student) {
  const gpa = toNumber(student?.gpa ?? student?.cumulative_gpa, null);
  const attendance = getStudentAttendance(student);
  const criticalGapCount = getCriticalCloGapsCount(student);

  const riskScore = (gpa !== null && gpa < 2 ? 1 : 0)
    + (attendance !== null && attendance < 75 ? 1 : 0)
    + (criticalGapCount > 0 ? 1 : 0);

  return {
    studentId: student?.id,
    studentName: student?.name,
    gpa,
    attendance,
    criticalGapCount,
    riskScore,
    lowestClo: getLowestClo(student),
    existingRiskLabel: student?.riskLevel || student?.risk_level || 'unknown',
  };
}

function buildAdvisorActionSummary(student, predictive) {
  const rootCause = [];
  if (predictive?.gpa !== null && predictive?.gpa < 2) rootCause.push('انخفاض المعدل التراكمي دون الحد الآمن');
  if (predictive?.attendance !== null && predictive?.attendance < 75) rootCause.push('هبوط الحضور عن 75%');
  if ((predictive?.criticalGapCount || 0) > 0) rootCause.push('فجوات CLO حرجة أقل من 60%');

  return [
    `الحالة الحالية: ${student?.name || 'طالب'} | GPA: ${predictive?.gpa ?? 'Insufficient Data'} | Attendance: ${predictive?.attendance !== null ? `${Math.round(predictive.attendance)}%` : 'Insufficient Data'}`,
    `السبب الجذري: ${rootCause.length ? rootCause.join(' + ') : 'Insufficient Data'}`,
    `الإجراء الفوري: ${predictive?.riskScore >= 2 ? 'بدء تدخل علاجي فوري مع متابعة أسبوعية' : 'متابعة استباقية وتقييم CLO دوري'}`,
  ];
}

function buildMicroLearningPlan(student, lowestClo) {
  if (!lowestClo) {
    return {
      studentId: student?.id,
      status: 'Insufficient Data',
      plan: [],
    };
  }

  return {
    studentId: student?.id,
    targetClo: lowestClo.clo,
    course: lowestClo.courseName,
    baseline: lowestClo.value,
    plan: [
      {
        day: 'اليوم 1',
        action: `مراجعة مركزة لمفاهيم ${lowestClo.courseName} المرتبطة بـ ${lowestClo.clo} لمدة 45 دقيقة + اختبار قصير 10 أسئلة.`,
      },
      {
        day: 'اليوم 2',
        action: `حل مسألتين تطبيقيتين وتوثيق خطوات الحل، ثم مقارنة النتيجة بمثال نموذجي.`,
      },
      {
        day: 'اليوم 3',
        action: `تنفيذ Mini-Assessment ورفع تقرير تقدم للمرشد مع نقاط الضعف المتبقية.`,
      },
    ],
  };
}

function createCriticalReportDraft(student, predictive) {
  const lowest = predictive?.lowestClo;
  const evidence = [];
  if (predictive?.gpa !== null) evidence.push(`GPA=${predictive.gpa}`);
  if (predictive?.attendance !== null) evidence.push(`Attendance=${Math.round(predictive.attendance)}%`);
  if (lowest) evidence.push(`${lowest.clo}=${lowest.value}% (${lowest.courseName})`);

  return {
    studentId: student?.id,
    studentName: student?.name,
    issue: 'حالة خطر أكاديمي حرجة',
    evidence: evidence.length ? evidence : ['Insufficient Data'],
    proposedSolution: 'تدخل متعدد المسارات: خطة تعلم قصيرة + دعم حضوري + توأمة أكاديمية موجهة.',
    rescueTimeline: [
      '24 ساعة: اجتماع تقييم فجوة الأداء',
      '72 ساعة: بدء مهام علاجية قصيرة',
      '7 أيام: تقييم أثر التدخل وتعديل الخطة',
    ],
  };
}

function autoPeerTwinning(students) {
  const enriched = students.map((student) => ({
    student,
    pairs: getAllCloPairs(student),
  }));

  const proposals = [];

  enriched.forEach(({ student, pairs }) => {
    const low = pairs
      .filter((pair) => pair.value < CRITICAL_CLO_THRESHOLD)
      .sort((a, b) => a.value - b.value)[0];

    if (!low) return;

    const tutors = enriched
      .filter((entry) => entry.student?.id !== student?.id)
      .map((entry) => {
        const best = entry.pairs
          .filter((pair) => pair.clo === low.clo && pair.value >= 90)
          .sort((a, b) => b.value - a.value)[0];
        return best
          ? {
            tutorId: entry.student?.id,
            tutorName: entry.student?.name,
            tutorScore: best.value,
            clo: best.clo,
            course: best.courseName,
          }
          : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.tutorScore - a.tutorScore);

    if (!tutors.length) return;

    proposals.push({
      studentId: student?.id,
      studentName: student?.name,
      gapClo: low.clo,
      gapValue: low.value,
      gapCourse: low.courseName,
      tutor: tutors[0],
    });
  });

  return proposals.slice(0, 5);
}

function buildActionCommands({ triageTop3, proactiveAlerts, twinning, criticalReports }) {
  const actions = [];

  triageTop3.forEach((item) => {
    actions.push({ action: 'highlight_student', id: item.studentId, priority: 'high' });
  });

  proactiveAlerts.forEach((alert) => {
    actions.push({ action: 'show_urgent_notification', id: alert.studentId, priority: 'high' });
  });

  twinning.forEach((pair) => {
    actions.push({
      action: 'show_twinning_card',
      id: pair.studentId,
      tutorId: pair?.tutor?.tutorId,
      priority: 'medium',
    });
  });

  criticalReports.forEach((report) => {
    actions.push({ action: 'open_report_draft', id: report.studentId, priority: 'high' });
  });

  return actions;
}

async function requestAIGuidanceSnapshot(students, deterministicResult, visibleState = {}) {
  const snapshot = {
    visibleState,
    students: students.slice(0, 30),
    deterministicResult,
  };

  const prompt = [
    'SYSTEM TASK: Produce STRICT JSON ONLY for an academic advisor dashboard.',
    'Analysis Step (silent): compare each flagged student with cohort average before final JSON.',
    'Return schema: {"headline":string,"actionCommands":[{"action":string,"id":string,"priority":string}],"notes":[string]}',
    `Context Snapshot: ${JSON.stringify(snapshot)}`,
  ].join('\n');

  try {
    const raw = await sendMessageToAI(prompt);
    const clean = String(raw || '').replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(clean);
    return parsed;
  } catch {
    return null;
  }
}

export async function runAICoreLogic({ students = [], visibleState = {} } = {}) {
  const safeStudents = Array.isArray(students) ? students : [];

  const predictive = safeStudents
    .map((student) => ({ student, predictive: computePredictiveRisk(student) }))
    .sort((a, b) => b.predictive.riskScore - a.predictive.riskScore
      || (a.predictive.gpa ?? 99) - (b.predictive.gpa ?? 99)
      || (a.predictive.attendance ?? 999) - (b.predictive.attendance ?? 999));

  const triageTop3 = predictive.slice(0, 3).map((item) => ({
    ...item.predictive,
    summary: buildAdvisorActionSummary(item.student, item.predictive),
    microLearningPlan: buildMicroLearningPlan(item.student, item.predictive.lowestClo),
  }));

  const proactiveAlerts = predictive
    .map((item) => {
      const drop = calculateSubmissionDrop(item.student);
      if (!drop?.isUrgent) return null;
      return {
        studentId: item.student?.id,
        studentName: item.student?.name,
        type: 'submission_drop_40',
        dropPercent: Number(drop.dropPercent.toFixed(1)),
        previousCompletionRate: drop.previousCompletionRate,
        currentCompletionRate: drop.currentCompletionRate,
        message: `انخفض معدل التسليم الأسبوعي بنسبة ${Number(drop.dropPercent.toFixed(1))}%`,
      };
    })
    .filter(Boolean)
    .slice(0, 5);

  const twinningSuggestions = autoPeerTwinning(safeStudents);

  const criticalReports = predictive
    .filter((item) => item.predictive.riskScore >= 2)
    .slice(0, 3)
    .map((item) => createCriticalReportDraft(item.student, item.predictive));

  const actionCommands = buildActionCommands({
    triageTop3,
    proactiveAlerts,
    twinning: twinningSuggestions,
    criticalReports,
  });

  const deterministicResult = {
    generatedAt: new Date().toISOString(),
    triageTop3,
    proactiveAlerts,
    twinningSuggestions,
    criticalReports,
    actionCommands,
    uiState: {
      highlightStudentIds: triageTop3.map((item) => item.studentId).filter(Boolean),
      alertCourseCodes: twinningSuggestions.map((item) => item?.gapCourse).filter(Boolean),
    },
  };

  const aiOverlay = await requestAIGuidanceSnapshot(safeStudents, deterministicResult, visibleState);

  return {
    ...deterministicResult,
    aiOverlay,
  };
}

export function executeMagicAutomation(coreState) {
  const commands = Array.isArray(coreState?.actionCommands) ? coreState.actionCommands : [];
  return commands.slice(0, 5);
}
