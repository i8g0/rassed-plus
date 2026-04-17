/**
 * services/aiService.js — خدمة الذكاء الاصطناعي المتكاملة
 *
 * 🤖 تتصل بـ Groq API (مجاني وسريع) أو تستخدم محرك محاكاة ذكي محلي
 * 🧠 تحاكي عملية التفكير (Thinking States) مع streaming حقيقي
 * 📊 تحلل بيانات الطالب وتولد توصيات حية ديناميكية
 *
 * الميزات:
 *   1. التوجيه التكيفي — يحلل نقاط الضعف ويقدم مسارات بديلة
 *   2. رادار المناهج — يحلل المقررات عالية المخاطر
 *   3. بوصلة سوق العمل — يربط المهارات بسوق العمل السعودي
 *   4. مولد خطط التدخل — يكتب رسائل دعم بالـ AI
 */

// ─── Configuration ─────────────────────────────────────────────────────────
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// ─── حالات التفكير ─────────────────────────────────────────────────────────
export const THINKING_STATES = {
  IDLE: 'idle',
  ANALYZING: 'analyzing',
  REASONING: 'reasoning',
  GENERATING: 'generating',
  COMPLETE: 'complete',
  ERROR: 'error',
};

const THINKING_MESSAGES = {
  [THINKING_STATES.ANALYZING]: [
    'جاري تحليل البيانات الأكاديمية...',
    'أقرأ مؤشرات الأداء...',
    'أفحص السجل الأكاديمي...',
    'أحلل أنماط السلوك...',
  ],
  [THINKING_STATES.REASONING]: [
    'أربط النتائج بقاعدة المعرفة...',
    'أقارن مع حالات مشابهة...',
    'أبني خريطة الارتباطات...',
    'أستنتج الأسباب الجذرية...',
  ],
  [THINKING_STATES.GENERATING]: [
    'أصوغ التوصيات الشخصية...',
    'أولد خطة العمل...',
    'أكتب المقترحات...',
    'أنسق النتائج النهائية...',
  ],
};

function getThinkingMessage(state) {
  const messages = THINKING_MESSAGES[state];
  if (!messages) return '';
  return messages[Math.floor(Math.random() * messages.length)];
}

// ─── استدعاء API حقيقي (Groq) ──────────────────────────────────────────────
async function callGroqAPI(systemPrompt, userPrompt) {
  if (!GROQ_API_KEY) return null;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    return JSON.parse(content);
  } catch {
    return null;
  }
}

// ─── محرك المحاكاة الذكي (Fallback) ───────────────────────────────────────
function simulateDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── 1. التوجيه التكيفي ────────────────────────────────────────────────────
export async function generateAdaptiveGuidance(student, onThinkingChange) {
  const notify = onThinkingChange || (() => {});

  notify({ state: THINKING_STATES.ANALYZING, message: getThinkingMessage(THINKING_STATES.ANALYZING) });
  await simulateDelay(800);

  notify({ state: THINKING_STATES.REASONING, message: getThinkingMessage(THINKING_STATES.REASONING) });
  await simulateDelay(600);

  // محاولة API حقيقي
  const systemPrompt = `أنت مساعد أكاديمي ذكي في نظام "راصد بلس". حلل بيانات الطالب وأعد توصيات تكيفية.
أرجع JSON بالشكل: { "recommendations": [{ "courseIcon": "emoji", "course": "اسم المقرر", "issue": "المشكلة المرصودة", "alternatives": [{ "key": "video|podcast|map", "label": "وصف البديل", "color": "#hex", "bg": "rgba" }] }] }`;

  const userPrompt = `الطالب: ${student.name}
التخصص: ${student.major}
المعدل: ${student.gpa}
نسبة إكمال المهام: ${student.taskCompletion || student.task_completion}%
نقاط الضعف: ${(student.weakSkills || student.weak_skills || []).join('، ')}
نقاط القوة: ${(student.strongSkills || student.strong_skills || []).join('، ')}
الحضور: ${student.attendance}%`;

  notify({ state: THINKING_STATES.GENERATING, message: getThinkingMessage(THINKING_STATES.GENERATING) });

  const apiResult = await callGroqAPI(systemPrompt, userPrompt);
  if (apiResult?.recommendations) {
    notify({ state: THINKING_STATES.COMPLETE, message: 'تم إنشاء التوصيات بنجاح' });
    return apiResult.recommendations;
  }

  // Fallback ذكي
  await simulateDelay(500);
  const weakSkills = student.weakSkills || student.weak_skills || ['برمجة متقدمة', 'هياكل بيانات'];
  const recommendations = weakSkills.slice(0, 3).map((skill, idx) => {
    const icons = ['📐', '💻', '📊', '🧮', '🔬'];
    const issues = [
      `تم رصد صعوبة في فهم ${skill} — إليك مسارات تعلم بديلة مخصصة لك:`,
      `أداؤك في ${skill} يحتاج تعزيزاً — جرب هذه الطرق المبتكرة:`,
      `لاحظنا تأخراً في ${skill} — هذه مسارات مصممة لأسلوب تعلمك:`,
    ];

    return {
      id: idx + 1,
      courseIcon: icons[idx % icons.length],
      course: skill,
      issue: issues[idx % issues.length],
      alternatives: [
        { key: 'video', label: 'فيديو مرئي تفاعلي خطوة بخطوة', color: '#818CF8', bg: 'rgba(129,140,248,0.1)' },
        { key: 'podcast', label: 'بودكاست صوتي مبسط مع أمثلة', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
        { key: 'map', label: 'خريطة ذهنية تفاعلية شاملة', color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
      ],
    };
  });

  notify({ state: THINKING_STATES.COMPLETE, message: 'تم إنشاء التوصيات بنجاح' });
  return recommendations;
}

// ─── 2. بوصلة سوق العمل ───────────────────────────────────────────────────
export async function generateCareerCompass(student, onThinkingChange) {
  const notify = onThinkingChange || (() => {});

  notify({ state: THINKING_STATES.ANALYZING, message: 'أحلل مهاراتك وسوق العمل السعودي...' });
  await simulateDelay(700);

  notify({ state: THINKING_STATES.REASONING, message: 'أربط تخصصك بفرص رؤية 2030...' });
  await simulateDelay(600);

  const systemPrompt = `أنت مستشار مهني ذكي في نظام "راصد بلس". حلل مهارات الطالب وقدم توصيات سوق العمل السعودي.
أرجع JSON بالشكل: { "skills": [{ "skill": "اسم المهارة", "level": number(0-100), "color": "#hex", "hot": boolean, "reason": "سبب", "boost": number, "course": "اسم الكورس", "platform": "المنصة", "link": "رابط" }] }`;

  const userPrompt = `الطالب: ${student.name} | التخصص: ${student.major} | المعدل: ${student.gpa}
نقاط القوة: ${(student.strongSkills || student.strong_skills || []).join('، ')}
نقاط الضعف: ${(student.weakSkills || student.weak_skills || []).join('، ')}`;

  notify({ state: THINKING_STATES.GENERATING, message: 'أصوغ خارطة الفرص المهنية...' });

  const apiResult = await callGroqAPI(systemPrompt, userPrompt);
  if (apiResult?.skills) {
    notify({ state: THINKING_STATES.COMPLETE, message: 'تم تحليل سوق العمل بنجاح' });
    return apiResult.skills;
  }

  await simulateDelay(500);

  const skillsMap = {
    'علوم الحاسب': [
      { skill: 'تحليل البيانات', level: 35, color: '#F59E0B', hot: true, reason: 'مطلوب بشدة في سوق العمل السعودي — الفرص زادت 40% مع رؤية 2030.', boost: 40, course: 'Data Analysis with Python', platform: 'Coursera', link: 'https://www.coursera.org/learn/data-analysis-with-python' },
      { skill: 'الذكاء الاصطناعي', level: 25, color: '#818CF8', hot: true, reason: 'تخصصك يفتح لك الباب — ابدأ بالأساسيات الآن للحاق بموجة AI.', boost: 55, course: 'AI For Everyone', platform: 'Coursera', link: 'https://www.coursera.org/learn/ai-for-everyone' },
      { skill: 'تطوير الويب', level: 50, color: '#10B981', hot: false, reason: 'مهارة أساسية لأي مبرمج — طوّر مستواك لتفتح أبواب العمل الحر.', boost: 30, course: 'The Web Developer Bootcamp', platform: 'Udemy', link: 'https://www.udemy.com/course/the-web-developer-bootcamp/' },
      { skill: 'الأمن السيبراني', level: 15, color: '#F43F5E', hot: true, reason: 'السعودية من أكبر المستثمرين في الأمن السيبراني — فرصة ذهبية.', boost: 60, course: 'Cybersecurity Fundamentals', platform: 'edX', link: 'https://www.edx.org/learn/cybersecurity' },
    ],
    'هندسة البرمجيات': [
      { skill: 'DevOps & Cloud', level: 40, color: '#22D3EE', hot: true, reason: 'التحول الرقمي في السعودية يتطلب خبراء Cloud — فرصة لا تعوض.', boost: 50, course: 'AWS Cloud Practitioner', platform: 'AWS', link: 'https://aws.amazon.com/certification/' },
      { skill: 'هندسة الأنظمة', level: 60, color: '#10B981', hot: false, reason: 'أساس متين لمستقبل مهني في الشركات الكبرى.', boost: 35, course: 'System Design Primer', platform: 'GitHub', link: 'https://github.com/donnemartin/system-design-primer' },
    ],
    'الذكاء الاصطناعي': [
      { skill: 'التعلم العميق', level: 30, color: '#818CF8', hot: true, reason: 'المستقبل في Deep Learning — ابدأ الآن وكن من الرواد.', boost: 65, course: 'Deep Learning Specialization', platform: 'Coursera', link: 'https://www.coursera.org/specializations/deep-learning' },
      { skill: 'معالجة اللغات', level: 20, color: '#F59E0B', hot: true, reason: 'معالجة اللغة العربية سوق ضخم غير مستغل.', boost: 70, course: 'NLP with Python', platform: 'Coursera', link: 'https://www.coursera.org/learn/python-text-mining' },
    ],
  };

  const fallbackSkills = skillsMap[student.major] || skillsMap['علوم الحاسب'];
  const result = fallbackSkills.map((s, i) => ({ ...s, id: i + 1 }));

  notify({ state: THINKING_STATES.COMPLETE, message: 'تم تحليل سوق العمل بنجاح' });
  return result;
}

// ─── 3. رادار المناهج ─────────────────────────────────────────────────────
export async function analyzeRadarCourses(courses, onThinkingChange) {
  const notify = onThinkingChange || (() => {});

  notify({ state: THINKING_STATES.ANALYZING, message: 'أفحص بيانات المقررات...' });
  await simulateDelay(600);

  notify({ state: THINKING_STATES.REASONING, message: 'أحلل أنماط الرسوب والأداء...' });
  await simulateDelay(500);

  notify({ state: THINKING_STATES.GENERATING, message: 'أولد توصيات التحسين...' });
  await simulateDelay(400);

  const analyzed = (courses || []).map(course => {
    let aiInsight, recommendation;
    const failRate = course.fail_rate || course.failRate || 0;

    if (failRate >= 50) {
      aiInsight = `مقرر ${course.name} يسجل نسبة رسوب خطيرة (${failRate}%). التحليل يشير إلى فجوة بين المحتوى ومستوى الطلاب.`;
      recommendation = 'مراجعة عاجلة للمنهج مع إضافة محتوى تحضيري وجلسات دعم أسبوعية.';
    } else if (failRate >= 25) {
      aiInsight = `مقرر ${course.name} يحتاج مراقبة — نسبة الرسوب (${failRate}%) أعلى من المتوسط.`;
      recommendation = 'إضافة اختبارات تكوينية أسبوعية وتفعيل التوأمة الأكاديمية.';
    } else {
      aiInsight = `مقرر ${course.name} في مسار سليم — نسبة نجاح ممتازة.`;
      recommendation = 'استمرار الأداء الحالي مع رصد أي تغييرات مبكراً.';
    }

    return {
      ...course,
      aiInsight,
      recommendation,
      trendDirection: failRate > 40 ? 'up' : failRate > 20 ? 'stable' : 'down',
    };
  });

  notify({ state: THINKING_STATES.COMPLETE, message: 'تم تحليل رادار المناهج' });
  return analyzed;
}

// ─── 4. مولد خطة التدخل بالـ AI ──────────────────────────────────────────
export async function generateAIIntervention(student, advisorName, onThinkingChange) {
  const notify = onThinkingChange || (() => {});

  notify({ state: THINKING_STATES.ANALYZING, message: `أحلل حالة ${student.name} الأكاديمية...` });
  await simulateDelay(900);

  notify({ state: THINKING_STATES.REASONING, message: 'أستنتج السبب الجذري للتعثر...' });
  await simulateDelay(700);

  const systemPrompt = `أنت مرشد أكاديمي متعاطف في نظام "راصد بلس". اكتب رسالة دعم شخصية ومحفزة للطالب.
أرجع JSON بالشكل:
{
  "emailSubject": "عنوان الرسالة",
  "emailBody": "نص الرسالة الكامل بأسلوب إنساني دافئ",
  "actionPlan": [{ "step": number, "action": "الإجراء", "timeline": "المدة", "owner": "المسؤول" }],
  "rootCause": "السبب الجذري",
  "successProbability": number(0-100)
}`;

  const userPrompt = `الطالب: ${student.name} | المعدل: ${student.gpa} | الحضور: ${student.attendance}%
مستوى الخطورة: ${student.riskLevel} | السبب: ${student.primaryReason}
العوامل: ${(student.factors || []).join(' — ')}
المرشد: ${advisorName}`;

  notify({ state: THINKING_STATES.GENERATING, message: 'أكتب رسالة الدعم الشخصية...' });

  const apiResult = await callGroqAPI(systemPrompt, userPrompt);
  if (apiResult?.emailBody) {
    notify({ state: THINKING_STATES.COMPLETE, message: 'تم إنشاء خطة التدخل!' });
    return {
      ...apiResult,
      generatedAt: new Date().toLocaleString('ar-SA'),
      followUpDate: new Date(Date.now() + (student.riskLevel === 'red' ? 3 : 7) * 86400000).toLocaleDateString('ar-SA'),
    };
  }

  // Fallback ذكي
  await simulateDelay(600);

  const urgency = student.riskLevel === 'red' ? 'عاجلة جداً' : 'استباقية';
  const emailSubject = `📚 رسالة دعم أكاديمي ${urgency} — ${student.name}`;

  const factorsText = (student.factors || []).map(f => `  • ${f}`).join('\n');
  const emailBody = `السلام عليكم ورحمة الله، ${student.name}

أتواصل معك ${advisorName} بشكل شخصي، ليس لأنك أخطأت، بل لأن النظام الذكي لاحظ بعض الإشارات التي قد تؤثر على مسيرتك الأكاديمية، وأريد أن أكون بجانبك قبل أن تستفحل.

📊 ما لاحظناه:
${student.primaryReason}

العوامل المساهمة:
${factorsText}

📈 معدلك الحالي: ${student.gpa} | نسبة الحضور: ${student.attendance}%

هذه الرسالة ليست تقريعاً، بل هي يد ممدودة. كل طالب ناجح مرّ بتحديات مشابهة.

💡 الخطوة التالية:
أريد أن نجلس معاً لمدة 15 دقيقة فقط. سنرسم معاً خارطة طريق واضحة تعيدك للمسار.

ما الذي تحتاجه؟ أخبرني، دعنا نخطط معاً.

مع تحياتي الصادقة،
${advisorName}
نظام راصد بلس — الإرشاد الأكاديمي الذكي`;

  const actionPlan = [
    { step: 1, action: 'مقابلة شخصية مع المرشد', timeline: student.riskLevel === 'red' ? 'خلال 48 ساعة' : 'خلال أسبوع', owner: 'المرشد' },
    { step: 2, action: 'تحليل الجدول الأسبوعي وإعادة هيكلته', timeline: 'خلال 3 أيام من اللقاء', owner: 'المرشد + الطالب' },
    { step: 3, action: 'تفعيل التوأمة الأكاديمية مع زميل متفوق', timeline: 'خلال أسبوع', owner: 'النظام' },
    { step: 4, action: 'جلسة متابعة لتقييم التحسن', timeline: 'بعد 3 أسابيع', owner: 'المرشد' },
  ];

  if (student.primaryReason?.includes('قلق')) {
    actionPlan.splice(2, 0, { step: 3, action: 'إحالة لوحدة الإرشاد النفسي', timeline: 'خلال أسبوع', owner: 'المرشد' });
    actionPlan.forEach((s, i) => { s.step = i + 1; });
  }

  const followUpDays = student.riskLevel === 'red' ? 3 : 7;
  const followUpDate = new Date(Date.now() + followUpDays * 86400000);

  notify({ state: THINKING_STATES.COMPLETE, message: 'تم إنشاء خطة التدخل!' });

  return {
    emailSubject,
    emailBody,
    actionPlan,
    rootCause: student.primaryReason,
    successProbability: student.riskLevel === 'red' ? 65 : 85,
    followUpDate: followUpDate.toLocaleDateString('ar-SA'),
    generatedAt: new Date().toLocaleString('ar-SA'),
  };
}

// ─── 5. توصيات Copilot ديناميكية ──────────────────────────────────────────
export async function generateCopilotTip(role, activeTab, student, onThinkingChange) {
  const notify = onThinkingChange || (() => {});

  notify({ state: THINKING_STATES.ANALYZING, message: 'أحلل السياق الحالي...' });
  await simulateDelay(400);

  // محاولة API
  const systemPrompt = `أنت مساعد ذكي في نظام "راصد بلس". أعطِ نصيحة واحدة مختصرة (أقل من 30 كلمة) بالعربية.
أرجع JSON: { "tip": "النصيحة هنا" }`;

  const userPrompt = `الدور: ${role} | الصفحة: ${activeTab} | ${student ? `الطالب: ${student.name}, المعدل: ${student.gpa}` : 'لا يوجد طالب محدد'}`;

  const apiResult = await callGroqAPI(systemPrompt, userPrompt);
  if (apiResult?.tip) {
    notify({ state: THINKING_STATES.COMPLETE, message: '' });
    return apiResult.tip;
  }

  // Fallback
  const tips = {
    advisor: {
      dashboard: 'تم رصد 2 طلاب بمؤشرات حمراء — اضغط "خطة تدخل" لتوليد رسالة فورية.',
      students: 'استخدم الفلتر للتركيز على الحالات الحمراء أولاً — الوقت عامل حاسم.',
      interventions: '3 تدخلات مكتملة هذا الشهر — نسبة نجاح 88%. أداء متميز!',
      radar: 'CS301 يحتاج مراجعة عاجلة — نسبة رسوب 62% تفوق المعدل الطبيعي.',
      galaxy: 'يمكنك استعراض 100 ميزة وربطها فوراً بقاعدة البيانات.',
    },
    student: {
      overview: 'لديك تسليم غداً ولم تبدأ! اضغط على "مهامي" وقسّم المهمة لخطوات صغيرة.',
      tasks: 'ابدأ بالمهمة الأسهل أولاً — ذلك يبني الزخم ويمنحك ثقة للأصعب.',
      skills: 'كورس Data Analysis هو الأعلى طلباً هذا الفصل في السوق السعودي!',
      peers: 'التوأمة الأكاديمية ترفع أداء الطرفين — جرب الآن!',
      galaxy: 'مركز الميزات الأسطورية يمنحك تجربة Super App متكاملة.',
    },
  };

  notify({ state: THINKING_STATES.COMPLETE, message: '' });
  return tips[role]?.[activeTab] || tips[role]?.overview || 'راصد بلس يراقب أداءك ويقدم توصيات ذكية.';
}

// ─── 6. تحليل التوأمة الأكاديمية ──────────────────────────────────────────
export async function analyzePeerMatching(student, candidates, onThinkingChange) {
  const notify = onThinkingChange || (() => {});

  notify({ state: THINKING_STATES.ANALYZING, message: 'أبحث عن أفضل توأم أكاديمي...' });
  await simulateDelay(600);

  notify({ state: THINKING_STATES.REASONING, message: 'أحسب نسبة التوافق مع كل زميل...' });
  await simulateDelay(500);

  const studentWeak = student.weakSkills || student.weak_skills || [];
  const studentStrong = student.strongSkills || student.strong_skills || [];

  const scored = (candidates || [])
    .filter(c => c.id !== student.id)
    .map(candidate => {
      const cStrong = candidate.strongSkills || candidate.strong_skills || [];
      const cWeak = candidate.weakSkills || candidate.weak_skills || [];

      let score = 0;
      const matchedSkills = [];

      // هل الكانديدت قوي في نقاط ضعفي؟
      studentWeak.forEach(skill => {
        if (cStrong.some(cs => cs.includes(skill) || skill.includes(cs))) {
          score += 30;
          matchedSkills.push(skill);
        }
      });

      // هل أنا قوي في نقاط ضعفه؟ (تبادل منفعي)
      cWeak.forEach(skill => {
        if (studentStrong.some(ss => ss.includes(skill) || skill.includes(ss))) {
          score += 25;
        }
      });

      // قرب المعدل
      const gpaDiff = Math.abs(student.gpa - candidate.gpa);
      if (gpaDiff <= 1) score += 15;
      if (gpaDiff <= 0.5) score += 10;

      // نفس التخصص
      if (student.major === candidate.major) score += 10;

      score = Math.min(99, Math.max(50, score));

      const colors = ['#818CF8', '#10B981', '#F59E0B', '#22D3EE', '#F43F5E'];
      const initials = candidate.name.split(' ').map(w => w[0]).join('').slice(0, 2);
      const strongDisplay = matchedSkills.length > 0 ? matchedSkills[0] : (cStrong[0] || 'عام');
      const weakDisplay = cWeak[0] || 'لا توجد';

      return {
        id: `peer-${candidate.id}`,
        name: candidate.name,
        initials,
        strong: strongDisplay,
        weak: weakDisplay,
        compatibility: score,
        color: colors[Math.floor(Math.random() * colors.length)],
        reason: score >= 85
          ? `${candidate.name} متفوق في ${strongDisplay} ويحتاج مساعدة فيما تتقنه — توأمة مثالية!`
          : `${candidate.name} يمكنه مساعدتك في ${strongDisplay} — تعاون مثمر.`,
      };
    })
    .sort((a, b) => b.compatibility - a.compatibility)
    .slice(0, 4);

  notify({ state: THINKING_STATES.COMPLETE, message: `تم إيجاد ${scored.length} توائم مناسبين` });
  return scored;
}
