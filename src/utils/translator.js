export const DICTIONARY = {
  // Names
  "محمد القحطاني": "Mohammed Al-Qahtani",
  "د. خالد القحطاني": "Dr. Khalid Al-Qahtani",
  "د. نورة السبيعي": "Dr. Noura Al-Subaie",
  "ريم فهد القحطاني": "Reem Fahad Al-Qahtani",
  "أسامة": "Osama",
  "أحمد عمرو": "Ahmed Amr",
  "عبدالرحمن": "Abdulrahman",
  
  "ريم ناصر الشهري": "Reem Nasser Al-Shehri",
  "لينا خالد المالكي": "Lina Khalid Al-Malki",
  "سلمان عبدالله المطيري": "Salman Abdullah Al-Mutairi",
  "يارا فهد العتيبي": "Yara Fahad Al-Otaibi",
  "وليد سعد الحربي": "Waleed Saad Al-Harbi",
  "نوف محمد الدوسري": "Nouf Mohammed Al-Dawsari",
  "عبدالعزيز حسن العنزي": "Abdulaziz Hassan Al-Enezi",
  "ميار علي الزهراني": "Mayar Ali Al-Zahrani",
  "طارق سامي الغامدي": "Tariq Sami Al-Ghamdi",
  "فيصل تركي الشهراني": "Faisal Turki Al-Shahrani",
  "شهد ماجد القحطاني": "Shahad Majed Al-Qahtani",
  "رائد نواف الشمري": "Raed Nawaf Al-Shammari",
  "جود هاني البقمي": "Joud Hani Al-Baqami",
  "أحمد ياسر الدخيل": "Ahmed Yasser Al-Dakheel",
  "رغد إبراهيم العتيبي": "Raghad Ibrahim Al-Otaibi",
  "منذر خالد الفيفي": "Munther Khalid Al-Faifi",
  "مها ناصر السبيعي": "Maha Nasser Al-Subaie",
  "حسن فهد العجمي": "Hassan Fahad Al-Ajmi",
  "دانة عمر القحطاني": "Dana Omar Al-Qahtani",
  "مازن صالح الدوسري": "Mazen Saleh Al-Dawsari",
  "سارة راشد الحارثي": "Sara Rashid Al-Harthi",
  "عبدالرحمن علي الشهري": "Abdulrahman Ali Al-Shehri",
  "لولوة منصور الزهراني": "Lulwa Mansour Al-Zahrani",
  "إياد ممدوح السهلي": "Eyad Mamdouh Al-Sahli",
  "تهاني فيصل المطيري": "Tahani Faisal Al-Mutairi",
  "زياد ناصر البلوي": "Ziad Nasser Al-Balawi",
  "هند تركي الحربي": "Hind Turki Al-Harbi",
  "رامي فواز الغامدي": "Rami Fawaz Al-Ghamdi",
  "سندس عبدالله القاسم": "Sundus Abdullah Al-Qasim",
  "مهند عبدالعزيز العنزي": "Muhannad Abdulaziz Al-Enezi",
  "نجلاء إبراهيم الشمراني": "Najla Ibrahim Al-Shamrani",
  "بدر ماجد الخالدي": "Badr Majed Al-Khaldi",
  "أروى خالد الزهراني": "Arwa Khalid Al-Zahrani",
  "أصيل عبدالله الحازمي": "Aseel Abdullah Al-Hazmi",
  "ربى فهد السلمي": "Ruba Fahad Al-Sulami",
  "خالد سامي الحربي": "Khalid Sami Al-Harbi",
  "ريم علي الدوسري": "Reem Ali Al-Dawsari",
  "طلال نواف الشهراني": "Talal Nawaf Al-Shahrani",
  "لين محمد القحطاني": "Leen Mohammed Al-Qahtani",
  
  // Majors & Departments
  "هندسة برمجيات": "Software Engineering",
  "علوم الحاسب": "Computer Science",
  "نظم معلومات": "Information Systems",
  "عمادة شؤون الطلاب": "Deanship of Student Affairs",
  "عمادة شؤون الطالبات": "Deanship of Female Student Affairs",
  "مرشد أكاديمي": "Academic Advisor",
  "مشرفة أكاديمية": "Academic Supervisor",

  // Static Text
  "حالة مستقرة بدون مشاكل وتتقدم أكاديمياً حسب الخطة": "Stable condition without issues, progressing academically as planned",
  "تنبيه: \"محمد عمار\" يعاني من فجوة في منهجية الـ Multi-threading": "Alert: 'Mohammed Ammar' has a gap in Multi-threading",
  "نمط تسليم متأخر رُصد مجدداً للطالب \"عبدالرحمن\"": "Late submission pattern detected again for 'Abdulrahman'",
  "أسامة سلم تقييم الـ Frontend بنجاح بعد تدخل المرشد": "Osama successfully submitted the Frontend assessment after advisor intervention",
  "انخفاض في نتائج تحليل المخاطر الأكاديمي بسبب MATH205 لـ \"أحمد عمرو\"": "Drop in academic risk analysis due to MATH205 for 'Ahmed Amr'",
  "حالة خطر أكاديمي درجة": "Academic danger level",
  "رسالة دعم أكاديمي": "Academic Support Message",
  "بانتظار رد الطالب": "Awaiting Student Reply",
  "مراجعة غياب": "Attendance Review",
  "تم الحل": "Resolved",
  "توجيه مهني": "Career Guidance",
  "قيد العمل": "In Progress",

  // Smart Pairing Text Snippets
  "يعاني من صعوبة في فهم الأشجار الثنائية": "has difficulty understanding Binary Trees",
  "شرح مفاهيم الشبكات العصبية": "explained Neural Networks concepts",
  "متفوق في": "Excelled in",
  "متأخر في": "Lagging in",
};

export function translateNode(node, lang) {
  if (lang !== 'en') return node;
  if (!node) return node;

  if (typeof node === 'string') {
    let result = node;
    // Exact match
    if (DICTIONARY[result]) return DICTIONARY[result];
    
    // Substring replace
    const keys = Object.keys(DICTIONARY).sort((a,b) => b.length - a.length);
    for (let k of keys) {
      if (result.includes(k)) {
        result = result.split(k).join(DICTIONARY[k]);
      }
    }
    return result;
  }

  if (Array.isArray(node)) {
    return node.map(item => translateNode(item, lang));
  }

  if (typeof node === 'object' && node !== null) {
    const out = {};
    for (let key in node) {
      out[key] = translateNode(node[key], lang);
    }
    return out;
  }

  return node;
}
