// src/services/aiService.js
import { byLanguage, getCurrentLanguage, normalizeLanguage } from '../utils/localization';

const ZEN_API_KEY = import.meta.env.VITE_ZEN_API_KEY || '';
const ZEN_MODEL = import.meta.env.VITE_ZEN_MODEL || 'nemotron-3-super-free';
const ZEN_BASE_URL = (import.meta.env.VITE_ZEN_BASE_URL || '').replace(/\/$/, '');
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || import.meta.env.VITE_NEMOTRON_API_KEY || '';
const OPENROUTER_MODEL = import.meta.env.VITE_OPENROUTER_MODEL || 'nvidia/llama-3.1-nemotron-70b-instruct:free';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY || '';
const GEMINI_URL = GEMINI_API_KEY
  ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`
  : '';
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_MODEL = import.meta.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile';
const AI_REQUEST_TIMEOUT_MS = 12000;

export function hasAnyRemoteAIProvider() {
  return Boolean(ZEN_API_KEY || OPENROUTER_API_KEY || GEMINI_API_KEY || GROQ_API_KEY);
}

export function getAISetupHint(language = null) {
  const lang = resolveLanguage(language);
  return byLanguage(
    lang,
    'تنبيه إعداد: الذكاء الحقيقي غير مفعل حالياً. أضف VITE_ZEN_API_KEY (أو VITE_OPENROUTER_API_KEY / VITE_GEMINI_API_KEY / VITE_GROQ_API_KEY) في ملف .env ثم أعد تشغيل npm run dev.',
    'Setup notice: Real AI is not enabled. Add VITE_ZEN_API_KEY (or VITE_OPENROUTER_API_KEY / VITE_GEMINI_API_KEY / VITE_GROQ_API_KEY) in .env, then restart npm run dev.',
  );
}

function resolveLanguage(language = null) {
  return normalizeLanguage(language || getCurrentLanguage());
}

function deriveLocalInsights(contextData = {}) {
  const gpa = Number(contextData?.gpa ?? contextData?.cumulative_gpa ?? 0);
  const attendance = Number(contextData?.attendance ?? 0);
  const atRiskCourses = contextData?.atRiskCourses || contextData?.courses || [];

  let level = 'جيد';
  if (gpa < 2.2 || attendance < 55) level = 'حرج';
  else if (gpa < 3 || attendance < 75) level = 'متوسط';

  const riskCourseLabel = atRiskCourses
    .slice(0, 2)
    .map((c) => c?.name || c?.course_name)
    .filter(Boolean)
    .join('، ');

  return {
    gpa,
    attendance,
    level,
    riskCourseLabel,
  };
}

function localSmartReply(message, isAdvisor, contextData = {}, language = 'ar') {
  const lang = resolveLanguage(language);
  const { gpa, attendance, level, riskCourseLabel } = deriveLocalInsights(contextData);
  const audience = isAdvisor
    ? byLanguage(lang, 'للمرشد', 'for advisor')
    : byLanguage(lang, 'للطالب', 'for student');
  const focus = riskCourseLabel
    ? byLanguage(lang, `ركز على: ${riskCourseLabel}.`, `Focus on: ${riskCourseLabel}.`)
    : byLanguage(lang, 'ركز على أقل مادتين أداء هذا الأسبوع.', 'Focus on your two weakest courses this week.');
  const action = level === 'حرج'
    ? byLanguage(lang, 'نفّذ خطة إنقاذ: ساعتان يومياً + متابعة بعد 72 ساعة.', 'Run a rescue plan: 2 hours daily + follow-up in 72 hours.')
    : level === 'متوسط'
      ? byLanguage(lang, 'نفّذ خطة تحسين: 60-90 دقيقة يومياً + اختبار قصير نهاية الأسبوع.', 'Run an improvement plan: 60-90 minutes daily + a short quiz this weekend.')
      : byLanguage(lang, 'استمر على نفس النسق مع مراجعة مركزة قبل كل تقييم.', 'Maintain momentum with focused review before each assessment.');

  return byLanguage(
    lang,
    `تحليل ${audience}: المعدل ${gpa || '-'}، الحضور ${attendance || '-'}%. ${focus} ${action} سؤالك: ${message}`,
    `Analysis ${audience}: GPA ${gpa || '-'}, attendance ${attendance || '-'}%. ${focus} ${action} Your question: ${message}`,
  );
}

function localInterventionPlan(studentData = {}, language = 'ar') {
  const lang = resolveLanguage(language);
  const name = studentData?.name || byLanguage(lang, 'الطالب', 'student');
  const attendance = Number(studentData?.attendance ?? 0);
  const atRisk = studentData?.atRiskCourses?.map((c) => c?.name).filter(Boolean).slice(0, 3) || [];

  return {
    id: `INV-${Date.now().toString().slice(-4)}`,
    status: 'draft',
    emailSubject: byLanguage(lang, `خطة دعم أكاديمية عاجلة - ${name}`, `Urgent Academic Support Plan - ${name}`),
    emailBody: byLanguage(
      lang,
      `عزيزي/عزيزتي ${name}، راصد بلس رصد انخفاضاً في الأداء. نوصي بخطة قصيرة لمدة 10 أيام مع متابعة دورية لدعمك أكاديمياً.`,
      `Dear ${name}, Rased Plus detected a performance decline. We recommend a focused 10-day plan with regular check-ins to support your academic progress.`,
    ),
    actionPlan: [
      {
        step: '01',
        action: byLanguage(
          lang,
          `جلسة مراجعة مركزة للمفاهيم الأساسية ${atRisk.length ? `(${atRisk.join('، ')})` : ''}`.trim(),
          `Focused review session for core concepts ${atRisk.length ? `(${atRisk.join(', ')})` : ''}`.trim(),
        ),
        timeline: byLanguage(lang, 'خلال 24 ساعة', 'Within 24 hours'),
        owner: byLanguage(lang, 'الطالب', 'Student'),
      },
      {
        step: '02',
        action: byLanguage(lang, 'حل بنك أسئلة قصير وتوثيق الأخطاء المتكررة', 'Solve a short question bank and document recurring mistakes'),
        timeline: byLanguage(lang, 'خلال 3 أيام', 'Within 3 days'),
        owner: byLanguage(lang, 'الطالب', 'Student'),
      },
      {
        step: '03',
        action: attendance < 70
          ? byLanguage(lang, 'متابعة حضور إلزامية يومية مع المرشد', 'Daily mandatory attendance follow-up with advisor')
          : byLanguage(lang, 'متابعة أكاديمية أسبوعية مع المرشد', 'Weekly academic follow-up with advisor'),
        timeline: byLanguage(lang, 'أسبوع واحد', 'One week'),
        owner: byLanguage(lang, 'المرشد', 'Advisor'),
      },
    ],
    followUpDate: byLanguage(lang, 'بعد 7 أيام', 'After 7 days'),
  };
}

function localSilentAnalysis(studentData = {}, language = 'ar') {
  const lang = resolveLanguage(language);
  const gpa = Number(studentData?.gpa ?? 0);
  const attendance = Number(studentData?.attendance ?? 0);
  const status = (gpa < 2.2 || attendance < 55)
    ? 'critical'
    : (gpa < 3 || attendance < 75)
      ? 'warning'
      : (gpa < 3.8)
        ? 'good'
        : 'excellent';

  return {
    overall_status: status,
    priority_action: status === 'critical'
      ? byLanguage(lang, 'تفعيل خطة تدخل يومية ومراجعة الفجوات الأساسية فوراً.', 'Activate a daily intervention plan and immediately review core learning gaps.')
      : byLanguage(lang, 'رفع كثافة المراجعة في موضوعات الضعف ومتابعة أسبوعية ثابتة.', 'Increase review intensity in weak topics with a fixed weekly follow-up.'),
    alerts: [
      attendance < 70
        ? byLanguage(lang, 'انخفاض في الحضور يحتاج ضبط فوري', 'Attendance is low and needs immediate correction')
        : byLanguage(lang, 'مؤشر الحضور مقبول', 'Attendance indicator is acceptable'),
      gpa < 3
        ? byLanguage(lang, 'تراجع أكاديمي يتطلب خطة قصيرة المدى', 'Academic decline requires a short-term plan')
        : byLanguage(lang, 'الأداء الأكاديمي ضمن الحدود', 'Academic performance is within acceptable range'),
    ],
  };
}

function localAdaptiveContent(taskName, type, language = 'ar') {
  const lang = resolveLanguage(language);
  if (type === 'map') {
    return byLanguage(
      lang,
      `خريطة ${taskName}: 1) المفهوم الأساسي 2) القاعدة/الخوارزمية 3) مثال تطبيقي 4) سؤال تقويمي سريع.`,
      `${taskName} map: 1) Core concept 2) Rule/algorithm 3) Worked example 4) Quick self-check question.`,
    );
  }
  return byLanguage(
    lang,
    `بودكاست ${taskName}: ابدأ بالمشكلة، قسّمها لثلاث خطوات، طبّق مثالاً واحداً، وأنهِ بسؤال تحقق ذاتي.`,
    `${taskName} podcast: start with the problem, break it into three steps, apply one example, and end with a self-check question.`,
  );
}

async function callGemini(prompt) {
  if (!GEMINI_URL) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });
    clearTimeout(timeout);
    const data = await response.json();
    if (data.candidates && data.candidates.length > 0) {
      return data.candidates[0].content.parts[0].text;
    }
    return null;
  } catch (error) {
    clearTimeout(timeout);
    console.error("Gemini API Error:", error);
    return null;
  }
}

function extractAssistantText(data) {
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part?.text === 'string' ? part.text : ''))
      .join('')
      .trim() || null;
  }
  return null;
}

async function callZen(prompt, language = 'ar') {
  if (!ZEN_API_KEY) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);

  try {
    const base = ZEN_BASE_URL || 'https://opencode.ai/zen/v1';
    const response = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ZEN_API_KEY}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: ZEN_MODEL,
        temperature: 0.4,
        messages: [
          {
            role: 'system',
            content: byLanguage(language, 'أنت مساعد أكاديمي عملي ومباشر.', 'You are a practical academic assistant.'),
          },
          { role: 'user', content: String(prompt || '') },
        ],
      }),
    });

    clearTimeout(timeout);
    if (!response.ok) return null;
    const data = await response.json();
    return extractAssistantText(data);
  } catch (error) {
    clearTimeout(timeout);
    console.error('ZEN API Error:', error);
    return null;
  }
}

async function callOpenRouter(prompt, language = 'ar') {
  if (!OPENROUTER_API_KEY) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
        'X-Title': 'Rased Plus',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        temperature: 0.5,
        messages: [
          {
            role: 'system',
            content: byLanguage(language, 'أنت مساعد أكاديمي عربي دقيق ومباشر.', 'You are a concise and practical academic assistant.'),
          },
          { role: 'user', content: String(prompt || '') },
        ],
      }),
    });

    clearTimeout(timeout);
    if (!response.ok) return null;
    const data = await response.json();
    return extractAssistantText(data);
  } catch (error) {
    clearTimeout(timeout);
    console.error('OpenRouter API Error:', error);
    return null;
  }
}

async function callGroq(prompt, language = 'ar') {
  if (!GROQ_API_KEY) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.4,
        messages: [
          {
            role: 'system',
            content: byLanguage(language, 'أنت مساعد أكاديمي عملي ومباشر.', 'You are a practical academic assistant.'),
          },
          { role: 'user', content: String(prompt || '') },
        ],
      }),
    });

    clearTimeout(timeout);
    if (!response.ok) return null;
    const data = await response.json();
    return extractAssistantText(data);
  } catch (error) {
    clearTimeout(timeout);
    console.error('Groq API Error:', error);
    return null;
  }
}

async function callBestProvider(prompt, language = 'ar') {
  // Priority: ZEN -> OpenRouter -> Gemini -> Groq
  const zenResult = await callZen(prompt, language);
  if (zenResult) return zenResult;

  const openRouterResult = await callOpenRouter(prompt, language);
  if (openRouterResult) return openRouterResult;

  const geminiResult = await callGemini(prompt);
  if (geminiResult) return geminiResult;

  const groqResult = await callGroq(prompt, language);
  if (groqResult) return groqResult;

  return null;
}

export async function getRasedAIRecommendation(studentData, question, language = null) {
  const lang = resolveLanguage(language);
  const prompt = byLanguage(
    lang,
    `أنت المساعد الذكي لنظام "راصد بلس" الأكاديمي.
بيانات الطالب الحالية: ${JSON.stringify(studentData)}
سؤال الطالب أو المشكلة: ${question}
تعليمات إلزامية: أجب باللغة العربية فقط دون أي كلمات إنجليزية.
أريدك أن ترد برد قصير، احترافي، ومباشر لمساعدة الطالب أكاديمياً بأسلوب يجمع بين التشجيع والموضوعية.
`,
    `You are the AI assistant for the Rased Plus academic system.
Current student data: ${JSON.stringify(studentData)}
Student question/problem: ${question}
Mandatory instruction: respond in English only, with no Arabic words.
Provide a short, professional, and direct academic response that is both encouraging and objective.
`,
  );
  return await callBestProvider(prompt, lang) || localSmartReply(question, false, studentData, lang);
}

export async function generateInterventionPlan(studentData, language = null) {
  const lang = resolveLanguage(language);
  const prompt = byLanguage(
    lang,
    `أنت الذكاء الاصطناعي في نظام "راصد بلس". هدفك توليد خطة تدخل من المرشد الأكاديمي إلى الطالب المتعثر.
بيانات الطالب: الاسم: ${studentData.name}، المعدل: ${studentData.gpa}، الحضور: ${studentData.attendance}%.
المواد المتعثر فيها: ${studentData.atRiskCourses?.map(c => c.name).join('، ')}.
اكتب النص بأسلوب إنساني وداعم، وموجه للطالب مباشرة.
تعليمات إلزامية: استخدم العربية فقط دون أي كلمة إنجليزية.

قم بالرد حصرياً ككائن JSON بالصيغة التالية (بدون أي نصوص خارج الـ JSON):
{
  "emailSubject": "عنوان البريد المكتوب",
  "emailBody": "نص البريد كاملاً بصيغة تشجيعية",
  "actionPlan": [
    { "step": "01", "action": "اسم الخطوة الأولى", "timeline": "التاريخ المتوقع أو المدة", "owner": "الطالب أو المرشد" }
  ],
  "followUpDate": "تاريخ المتابعة مثلاً: الأسبوع القادم"
}
`,
    `You are the AI engine in Rased Plus. Your goal is to generate an intervention plan from advisor to an at-risk student.
Student data: name: ${studentData.name}, GPA: ${studentData.gpa}, attendance: ${studentData.attendance}%.
At-risk courses: ${studentData.atRiskCourses?.map(c => c.name).join(', ')}.
Write in a supportive human tone directly addressed to the student.
Mandatory instruction: use English only with no Arabic words.

Respond strictly as a JSON object only (no extra text):
{
  "emailSubject": "Email subject",
  "emailBody": "Full supportive email body",
  "actionPlan": [
    { "step": "01", "action": "First action", "timeline": "Due date or duration", "owner": "Student or Advisor" }
  ],
  "followUpDate": "Follow-up date, e.g. next week"
}
`,
  );
  const result = await callBestProvider(prompt, lang);
  if (!result) return localInterventionPlan(studentData, lang);
  try {
    const cleanJson = result.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    return {
      id: `INV-${Date.now().toString().slice(-4)}`,
      status: 'draft',
      ...parsed
    };
  } catch {
    return localInterventionPlan(studentData, lang);
  }
}

export async function generateSmartReply(message, isAdvisor, contextData = {}, language = null) {
  const lang = resolveLanguage(language);
  const role = isAdvisor
    ? byLanguage(lang, 'مرشد أكاديمي', 'Academic Advisor')
    : byLanguage(lang, 'طالب جامعي', 'University Student');

  const prompt = byLanguage(
    lang,
    `أنت محلل بيانات أكاديمي خبير في نظام "راصد بلس".
تتحدث الآن مع: ${role}.
هذه هي البيانات الأكاديمية الدقيقة من قاعدة البيانات للسياق الحالي:
${JSON.stringify(contextData, null, 2)}

سؤال المستخدم: "${message}"

تعليمات صارمة لك:
1. قم بتحليل الدرجات، مخرجات التعلم (CLOs)، وتواريخ التسليم للطالب.
2. لا تقترح حلولاً نفسية أو طبية. اقترح فقط خطط مراجعة دقيقة، مصادر تعلم محددة، واكتشف الفجوات المعرفية بين المواد.
3. أجب باللغة العربية فقط دون أي كلمة إنجليزية.
4. لا تسأل المستخدم السماح بالوصول لبياناته، البيانات مسحوبة وتراها في السياق.
5. استخدم أرقام واسماء مواد وإحصائيات حقيقية من البيانات المرفقة قدر الإمكان.
6. استعمل رموز تعبيرية خفيفة لدعم النص الأكاديمي.
`,
    `You are an expert academic data analyst in the Rased Plus system.
You are currently talking to: ${role}.
Here is the exact academic context data from the database:
${JSON.stringify(contextData, null, 2)}

User question: "${message}"

Strict instructions:
1. Analyze grades, CLOs, and submission timelines.
2. Do not suggest psychological or medical solutions. Provide only practical academic plans, specific learning resources, and knowledge-gap insights.
3. Respond in English only, with no Arabic words.
4. Do not ask for data access permission; the data is already provided in context.
5. Use real numbers, course names, and statistics from the provided data whenever possible.
6. Keep the answer concise and direct.
`,
  );
  
  return await callBestProvider(prompt, lang) || localSmartReply(message, isAdvisor, contextData, lang);
}

export async function generateSilentAnalysis(studentData, language = null) {
  const lang = resolveLanguage(language);
  const prompt = byLanguage(
    lang,
    `أنت محلل بيانات في نظام "راصد بلس". تقريرك يجب أن يكون مبنياً حصرياً على البيانات الأكاديمية.
المعدل: ${studentData.gpa}، الإنجاز: ${studentData.completionRate}، الحضور: ${studentData.attendance}%
تعليمات إلزامية: استخدم العربية فقط.
قم بصياغة تقرير قصير جداً بحجم JSON فقط يحتوي على:
{
  "overall_status": "(excellent | good | warning | critical)",
  "priority_action": "جملة واحدة للإجراء الأكاديمي الأهم بناءً على مخرجات التعلم والفجوات",
  "alerts": ["تنبيه أكاديمي 1", "تنبيه أكاديمي 2"]
}
أجب فقط بـ JSON صحيح دون أي نص إضافي.`,
    `You are a data analyst in the Rased Plus system. Your report must be based only on academic data.
GPA: ${studentData.gpa}, completion: ${studentData.completionRate}, attendance: ${studentData.attendance}%
Mandatory instruction: use English only.
Return a very short JSON report only with:
{
  "overall_status": "(excellent | good | warning | critical)",
  "priority_action": "One sentence with the top academic action based on CLO gaps",
  "alerts": ["Academic alert 1", "Academic alert 2"]
}
Respond only with valid JSON and no extra text.`,
  );

  const result = await callBestProvider(prompt, lang);
  if (!result) return localSilentAnalysis(studentData, lang);
  try {
    const cleanJson = result.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch {
    return localSilentAnalysis(studentData, lang);
  }
}

export async function generateAdaptiveContent(taskName, type, language = null) {
  const lang = resolveLanguage(language);
  const label = type === 'map'
    ? byLanguage(lang, 'هيكل خريطة ذهنية مبسطة', 'a concise mind-map structure')
    : byLanguage(lang, 'سكريبت بودكاست صوتي تفاعلي قصير', 'a short interactive podcast script');
  const prompt = byLanguage(
    lang,
    `المهمة: "${taskName}".
الطالب يعاني من صعوبة فيها. اكتب له ${label} في أقل من 3 أسطر باللغة العربية فقط لمساعدته. لا تضف مقدمات.`,
    `Task: "${taskName}".
The student is struggling with this task. Write ${label} in less than 3 lines in English only. Do not add introductions.`,
  );
  const result = await callBestProvider(prompt, lang);
  return result || localAdaptiveContent(taskName, type, lang);
}

export async function sendMessageToAI(message, options = {}) {
  const lang = resolveLanguage(options?.language);
  const prompt = byLanguage(
    lang,
    `أنت مساعد أكاديمي في منصة راصد بلس. أجب بالعربية فقط وبشكل مباشر وعملي.
الرسالة:
${String(message || '').trim()}`,
    `You are an academic assistant in the Rased Plus platform. Respond in English only, directly and practically.
Message:
${String(message || '').trim()}`,
  );
  return await callBestProvider(prompt, lang) || localSmartReply(String(message || ''), false, {}, lang);
}

export function buildBeaconOpeningMessage(upcomingAssignmentsCount = 0, debarmentRiskCount = 0, language = null) {
  const lang = resolveLanguage(language);
  const tasks = Number(upcomingAssignmentsCount || 0);
  const risks = Number(debarmentRiskCount || 0);

  if (tasks > 0 && risks > 0) {
    return byLanguage(lang, `تنبيه استباقي: لديك ${tasks} واجباً قريباً و${risks} طالباً على وشك تجاوز حد الحرمان. ابدأ بالحالات الأعلى خطورة أولاً.`, `Proactive alert: ${tasks} assignments are due soon and ${risks} students are close to debarment threshold. Start with the highest-risk cases first.`);
  }
  if (tasks > 0) {
    return byLanguage(lang, `تنبيه استباقي: لديك ${tasks} واجباً قريباً لدى الطلاب. راجع قائمة التسليمات خلال 72 ساعة.`, `Proactive alert: ${tasks} student assignments are due soon. Review submission list within 72 hours.`);
  }
  if (risks > 0) {
    return byLanguage(lang, `تنبيه استباقي: يوجد ${risks} طالباً مهدداً بالحرمان بسبب الغياب. يوصى بتدخل فوري.`, `Proactive alert: ${risks} students are at debarment risk due to absences. Immediate intervention is recommended.`);
  }
  return byLanguage(lang, 'الحالة مستقرة حالياً، لا توجد مؤشرات حرجة الآن.', 'Current status is stable, with no critical indicators at the moment.');
}

export async function checkNemotronFreeModel() {
  try {
    const probe = await sendMessageToAI('Reply with one word: OK', { language: 'en' });
    const ok = String(probe || '').trim().length > 0;
    const provider = ZEN_API_KEY ? 'zen' : (OPENROUTER_API_KEY ? 'openrouter' : (GEMINI_API_KEY ? 'gemini' : (GROQ_API_KEY ? 'groq' : 'local-fallback')));
    const model = ZEN_API_KEY ? ZEN_MODEL : (OPENROUTER_API_KEY ? OPENROUTER_MODEL : (GEMINI_API_KEY ? 'gemini-2.5-flash' : (GROQ_API_KEY ? GROQ_MODEL : 'local-smart-reply')));
    return {
      ok,
      status: ok ? 200 : 503,
      provider,
      model,
      message: ok ? 'AI provider reachable' : 'AI provider not reachable',
    };
  } catch {
    const provider = ZEN_API_KEY ? 'zen' : (OPENROUTER_API_KEY ? 'openrouter' : (GEMINI_API_KEY ? 'gemini' : (GROQ_API_KEY ? 'groq' : 'local-fallback')));
    const model = ZEN_API_KEY ? ZEN_MODEL : (OPENROUTER_API_KEY ? OPENROUTER_MODEL : (GEMINI_API_KEY ? 'gemini-2.5-flash' : (GROQ_API_KEY ? GROQ_MODEL : 'local-smart-reply')));
    return {
      ok: false,
      status: 503,
      provider,
      model,
      message: 'AI provider check failed',
    };
  }
}

export function detectDisengagementRadar(students = []) {
  const lang = resolveLanguage();
  const safe = Array.isArray(students) ? students : [];

  const mapped = safe
    .map((student) => {
      const attendance = Number(student?.attendance ?? 100);
      const gpa = Number(student?.gpa ?? student?.cumulative_gpa ?? 5);
      const baseRisk = Number(student?.riskScore ?? 0);
      const behaviorAccess = Number(student?.behavioral_profile?.file_access_rate ?? 72);
      const fileAccessRate = Math.max(20, Math.min(100, behaviorAccess));

      const attendancePenalty = Math.max(0, 80 - attendance) * 0.7;
      const gpaPenalty = Math.max(0, 3.2 - gpa) * 18;
      const computedRisk = Math.max(baseRisk, attendancePenalty + gpaPenalty);
      const riskScore = Math.max(8, Math.min(96, Number(computedRisk.toFixed(1))));
      const severity = riskScore >= 55 || attendance < 60
        ? 'critical'
        : riskScore >= 30 || attendance < 75
          ? 'warning'
          : 'watch';

      let issue = byLanguage(lang, 'انخفاض مؤشرات الأداء العام.', 'Overall performance indicators are declining.');
      if (attendance < 60) issue = byLanguage(lang, `نسبة حضور منخفضة (${attendance.toFixed(1)}%).`, `Low attendance rate (${attendance.toFixed(1)}%).`);
      else if (gpa < 2.5) issue = byLanguage(lang, `انخفاض المعدل التراكمي (${gpa.toFixed(2)}).`, `Low cumulative GPA (${gpa.toFixed(2)}).`);
      else if (riskScore >= 30) issue = byLanguage(lang, `مؤشر خطورة أكاديمي مرتفع (${Math.round(riskScore)}%).`, `High academic risk indicator (${Math.round(riskScore)}%).`);

      return {
        studentId: student?.id,
        studentName: student?.name || 'طالب',
        severity,
        status: severity === 'critical' ? 'Behavioral Drift' : 'Passive Presence',
        issue,
        riskScore,
        recommendation: severity === 'critical'
          ? byLanguage(lang, 'تدخل عاجل خلال 48 ساعة مع متابعة يومية.', 'Urgent intervention within 48 hours with daily follow-up.')
          : byLanguage(lang, 'متابعة أسبوعية وخطة دراسة قصيرة.', 'Weekly follow-up with a short study plan.'),
        profile: {
          fileAccessRate,
          attendance: Number(attendance.toFixed(1)),
          gpa: Number(gpa.toFixed(2)),
        },
      };
    })
    .filter((item) => item.studentId)
    .sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0));

  const activeCases = mapped.filter((item) => item.severity === 'critical' || item.severity === 'warning');
  if (activeCases.length > 0) {
    return activeCases;
  }

  // Keep the radar populated with the top mild signals when no active cases exist.
  return mapped.slice(0, 3).map((item) => ({
    ...item,
    severity: 'warning',
    status: 'Passive Presence',
    issue: item.issue === 'انخفاض مؤشرات الأداء العام.'
      ? byLanguage(lang, 'رصد انخفاض خفيف في التفاعل يستلزم متابعة استباقية.', 'A mild engagement drop was detected and needs proactive follow-up.')
      : item.issue,
    riskScore: Math.max(28, item.riskScore),
  }));
}

export function buildMotivationPulseMessage(studentName = 'الطالب', signal = null) {
  const lang = resolveLanguage();
  const issue = signal?.issue
    ? byLanguage(lang, `لاحظنا: ${signal.issue}`, `We noticed: ${signal.issue}`)
    : byLanguage(lang, 'لاحظنا حاجة لدعم إضافي', 'We noticed a need for extra support');
  return byLanguage(
    lang,
    `مرحباً ${studentName}، ${issue} هذه خطة سريعة: 1) 45 دقيقة مراجعة مركزة اليوم، 2) حل 10 مسائل من أضعف موضوع، 3) إرسال التقدم للمرشد خلال 24 ساعة.`,
    `Hi ${studentName}, ${issue}. Quick plan: 1) 45 minutes focused review today, 2) solve 10 problems from the weakest topic, 3) send progress update to your advisor within 24 hours.`,
  );
}

export function buildCollectiveDisengagementCommand(alerts = []) {
  const lang = resolveLanguage();
  const total = Array.isArray(alerts) ? alerts.length : 0;
  const critical = Array.isArray(alerts) ? alerts.filter((a) => a?.severity === 'critical').length : 0;
  return byLanguage(
    lang,
    `خطة جماعية مقترحة: ${total} حالة تحتاج متابعة، منها ${critical} حرجة. ابدأ بالحالات الحرجة (اتصال + خطة 48 ساعة)، ثم جدولة متابعة أسبوعية لبقية الحالات.`,
    `Suggested collective plan: ${total} cases need follow-up, including ${critical} critical cases. Start with critical cases (contact + 48-hour plan), then schedule weekly follow-ups for the rest.`,
  );
}

export async function generateDisengagementReport(studentName = 'الطالب', signal = {}) {
  const lang = resolveLanguage();
  const prompt = byLanguage(
    lang,
    `اكتب تقريراً عربياً مختصراً من 5 نقاط عن حالة الطالب ${studentName}.
المعطيات: ${JSON.stringify(signal)}
التركيز: تفسير أكاديمي عملي + 3 إجراءات مباشرة للمرشد.
تعليمات إلزامية: العربية فقط.`,
    `Write a concise 5-point report in English about student ${studentName}.
Data: ${JSON.stringify(signal)}
Focus: practical academic interpretation + 3 direct actions for the advisor.
Mandatory instruction: English only.`,
  );

  const result = await callGemini(prompt);
  if (result) return result;

  return byLanguage(
    lang,
    [
      `تقرير الحالة — ${studentName}`,
      `1) المؤشر الرئيسي: ${signal?.issue || 'انخفاض التفاعل الأكاديمي'}.`,
      '2) الاحتمال الأعلى للسبب: تذبذب الحضور وتأخر التسليمات.',
      '3) إجراء فوري: جلسة متابعة قصيرة مع أهداف 48 ساعة.',
      '4) إجراء خلال أسبوع: خطة مراجعة مقسمة مع قياس إنجاز يومي.',
      '5) معيار نجاح: تحسن الحضور/التسليم في الأسبوع القادم.',
    ].join('\n'),
    [
      `Case report — ${studentName}`,
      `1) Primary indicator: ${signal?.issue || 'declining academic engagement'}.`,
      '2) Most likely cause: inconsistent attendance and late submissions.',
      '3) Immediate action: short follow-up session with 48-hour targets.',
      '4) One-week action: split review plan with daily progress tracking.',
      '5) Success criterion: improved attendance/submissions next week.',
    ].join('\n'),
  );
}