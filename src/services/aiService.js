// src/services/aiService.js

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_URL = GEMINI_API_KEY
  ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`
  : '';

async function callGemini(prompt) {
  if (!GEMINI_URL) return null;
  try {
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });
    const data = await response.json();
    if (data.candidates && data.candidates.length > 0) {
      return data.candidates[0].content.parts[0].text;
    }
    return null;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
}

export async function getRasedAIRecommendation(studentData, question) {
  const prompt = `أنت المساعد الذكي لنظام "راصد بلس" الأكاديمي.
بيانات الطالب الحالية: ${JSON.stringify(studentData)}
سؤال الطالب أو المشكلة: ${question}
أريدك أن ترد برد قصير، احترافي، ومباشر لمساعدة الطالب أكاديمياً بأسلوب يجمع بين التشجيع والموضوعية.
`;
  return await callGemini(prompt) || "عذراً، لم أتمكن من تحليل البيانات حالياً.";
}

export async function generateInterventionPlan(studentData) {
  const prompt = `أنت الذكاء الاصطناعي في نظام "راصد بلس". هدفك توليد خطة تدخل من المرشد الأكاديمي إلى الطالب المتعثر.
بيانات الطالب: الاسم: ${studentData.name}، المعدل: ${studentData.gpa}، الحضور: ${studentData.attendance}%.
المواد المتعثر فيها: ${studentData.atRiskCourses?.map(c => c.name).join('، ')}.
اكتب النص بأسلوب إنساني وداعم، وموجه للطالب مباشرة.

قم بالرد حصرياً ككائن JSON بالصيغة التالية (بدون أي نصوص خارج الـ JSON):
{
  "emailSubject": "عنوان البريد المكتوب",
  "emailBody": "نص البريد كاملاً بصيغة تشجيعية",
  "actionPlan": [
    { "step": "01", "action": "اسم الخطوة الأولى", "timeline": "التاريخ المتوقع أو المدة", "owner": "الطالب أو المرشد" }
  ],
  "followUpDate": "تاريخ المتابعة مثلاً: الأسبوع القادم"
}
`;
  const result = await callGemini(prompt);
  try {
    const cleanJson = result.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    return {
      id: `INV-${Date.now().toString().slice(-4)}`,
      status: 'draft',
      ...parsed
    };
  } catch {
      return {
      id: `INV-${Date.now().toString().slice(-4)}`,
      emailSubject: `خطة الدعم للطالب ${studentData.name}`,
      emailBody: `عزيزي ${studentData.name}، نأمل زيارة مكتب الإرشاد.`,
      actionPlan: [{ step: '01', action: 'حجز موعد', timeline: 'خلال يومين', owner: 'الطالب' }],
      followUpDate: 'غير محدد',
      status: 'draft'
    };
  }
}

export async function generateSmartReply(message, isAdvisor, contextData = {}) {
  const role = isAdvisor ? 'مرشد أكاديمي' : 'طالب جامعي';
  const prompt = `أنت محلل بيانات أكاديمي خبير في نظام "راصد بلس".
تتحدث الآن مع: ${role}.
هذه هي البيانات الأكاديمية الدقيقة من قاعدة البيانات للسياق الحالي:
${JSON.stringify(contextData, null, 2)}

سؤال المستخدم: "${message}"

تعليمات صارمة لك:
1. قم بتحليل الدرجات، مخرجات التعلم (CLOs)، وتواريخ التسليم للطالب.
2. لا تقترح حلولاً نفسية أو طبية. اقترح فقط خطط مراجعة دقيقة، مصادر تعلم محددة، واكتشف الفجوات المعرفية بين المواد.
3. أجب باللغة العربية باختصار شديد ومباشرة.
4. لا تسأل المستخدم السماح بالوصول لبياناته، البيانات مسحوبة وتراها في السياق.
5. استخدم أرقام واسماء مواد وإحصائيات حقيقية من البيانات المرفقة قدر الإمكان.
6. استعمل رموز تعبيرية خفيفة لدعم النص الأكاديمي.`;
  
  return await callGemini(prompt) || "عذراً، الخدمة تحت الصيانة حالياً.";
}

export async function generateSilentAnalysis(studentData) {
  const prompt = `أنت محلل بيانات في نظام "راصد بلس". تقريرك يجب أن يكون مبنياً حصرياً على البيانات الأكاديمية.
المعدل: ${studentData.gpa}، الإنجاز: ${studentData.completionRate}، الحضور: ${studentData.attendance}%
قم بصياغة تقرير قصير جداً بحجم JSON فقط يحتوي على:
{
  "overall_status": "(excellent | good | warning | critical)",
  "priority_action": "جملة واحدة للإجراء الأكاديمي الأهم بناءً على مخرجات التعلم والفجوات",
  "alerts": ["تنبيه أكاديمي 1", "تنبيه أكاديمي 2"]
}
أجب فقط بـ JSON صحيح دون أي نص إضافي.`;

  const result = await callGemini(prompt);
  try {
    const cleanJson = result.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch {
      return {
      overall_status: studentData.gpa > 3.5 ? 'good' : 'warning',
      priority_action: 'مراجعة وتقوية الفهم في المواد المتعثرة',
      alerts: ['انخفاض في درجات التقييم التكويني'],
    };
  }
}

export async function generateAdaptiveContent(taskName, type) {
  const label = type === 'map' ? 'هيكل خريطة ذهنية مبسطة' : 'سكريبت بودكاست صوتي تفاعلي قصير';
  const prompt = `المهمة: "${taskName}".
الطالب يعاني من صعوبة فيها. اكتب له ${label} في أقل من 3 أسطر باللغة العربية لمساعدته. لا تضف مقدمات.`;
  const result = await callGemini(prompt);
  return result || "تعذر توليد المحتوى الآن، حاول مرة أخرى.";
}