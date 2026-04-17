/**
 * services/mockDatabase.js
 * قاعدة البيانات الأكاديمية العميقة - راصد بلس
 * تحتوي على بيانات دقيقة جداً تركز على مخرجات التعلم (CLOs)، الفجوات المعرفية التراكمية،
 * وأنماط التسليم، مما يوفر أساساً متيناً لمحرك الذكاء الاصطناعي لاستخراج الرؤى الأكاديمية.
 */

export const studentDatabase = [
  // ==========================================
  // الحالة 1: محمد عمار - (الطالب المتميز ذو الفجوة الدقيقة)
  // ==========================================
  {
    id: "44210988",
    name: "محمد عمار",
    major: "علوم الحاسب",
    level: 7,
    cumulative_gpa: 4.8,
    academic_history: [
      { course_code: "CS211", course_name: "برمجة كائنية التوجه", grade: "A+" },
      { course_code: "CS320", course_name: "قواعد البيانات", grade: "A+" },
      { course_code: "CS311", course_name: "هياكل البيانات", grade: "A" }
    ],
    current_courses: [
      {
        course_code: "CS421",
        course_name: "نظم التشغيل",
        attendance_percentage: 95,
        assessments: { midterm: 28, max_midterm: 30, lab: 18, max_lab: 20, project: 15, max_project: 20 },
        clo_analytics: {
          "CLO1_Concepts": 98,
          "CLO2_ProcessManagement": 95,
          "CLO3_MemoryAllocation": 96,
          "CLO4_Multi_threading": 45 // الفجوة الدقيقة المخفية
        },
        submission_timestamps: [
          { assignment: "HW1", actual_submission: "2026-03-01T10:00:00Z", deadline: "2026-03-05T23:59:00Z" },
          { assignment: "Lab3", actual_submission: "2026-03-15T15:30:00Z", deadline: "2026-03-20T23:59:00Z" }
        ],
        system_flags: ["تراجع ملحوظ في مفاهيم المعالجة المتعددة (Multi-threading) رغم التفوق العام"]
      }
    ]
  },

  // ==========================================
  // الحالة 2: عبدالرحمن - (أزمة صمت وتأخير التسليم)
  // ==========================================
  {
    id: "44118833",
    name: "عبدالرحمن",
    major: "هندسة البرمجيات",
    level: 6,
    cumulative_gpa: 3.5,
    academic_history: [
      { course_code: "SE310", course_name: "هندسة متطلبات البرمجيات", grade: "B+" },
      { course_code: "CS212", course_name: "الخوارزميات", grade: "B" }
    ],
    current_courses: [
      {
        course_code: "SE420",
        course_name: "تصميم وعمارة البرمجيات",
        attendance_percentage: 88,
        assessments: { midterm: 20, max_midterm: 30, lab: 12, max_lab: 20, project: null, max_project: 30 },
        clo_analytics: {
          "CLO1_DesignPatterns": 75,
          "CLO2_ArchitectureStyles": 80,
          "CLO3_CleanCode": 60
        },
        submission_timestamps: [
          { assignment: "HW1", actual_submission: "2026-02-14T23:49:00Z", deadline: "2026-02-14T23:59:00Z" },
          { assignment: "HW2", actual_submission: "2026-03-01T23:55:00Z", deadline: "2026-03-01T23:59:00Z" },
          { assignment: "UML_Project", actual_submission: "2026-03-20T23:58:00Z", deadline: "2026-03-20T23:59:00Z" }
        ],
        system_flags: ["نمط تسليم في اللحظات الأخيرة (Last-minute submitter) يؤثر على جودة الكود المصدري"]
      }
    ]
  },

  // ==========================================
  // الحالة 3: أحمد عمرو - (فجوة المتطلبات السابقة)
  // ==========================================
  {
    id: "44320155",
    name: "أحمد عمرو",
    major: "علوم الحاسب",
    level: 8,
    cumulative_gpa: 2.9,
    academic_history: [
      { course_code: "MATH205", course_name: "الاحتمالات والإحصاء", grade: "D+" }, // الفجوة الأساسية
      { course_code: "CS311", course_name: "هياكل البيانات", grade: "C+" },
      { course_code: "CS350", course_name: "شبكات الحاسب", grade: "B" }
    ],
    current_courses: [
      {
        course_code: "CS480",
        course_name: "الذكاء الاصطناعي",
        attendance_percentage: 82,
        assessments: { midterm: 12, max_midterm: 30, lab: 15, max_lab: 20, project: null, max_project: 30 },
        clo_analytics: {
          "CLO1_SearchAlgorithms": 85,
          "CLO2_MachineLearning": 40, // يعتمد على الإحصاء بقوة
          "CLO3_NeuralNetworks": 35    // يعتمد على الإحصاء بقوة
        },
        submission_timestamps: [
          { assignment: "HW1", actual_submission: "2026-02-20T14:00:00Z", deadline: "2026-02-21T23:59:00Z" },
          { assignment: "ML_Lab", actual_submission: "2026-03-16T12:00:00Z", deadline: "2026-03-18T23:59:00Z" }
        ],
        system_flags: ["تراجع في نماذج تعلم الآلة بسبب فجوة تراكمية في مادة الاحتمالات والإحصاء (MATH205)"]
      }
    ]
  },

  // ==========================================
  // الحالة 4: أسامة - (التباين بين النظري والعملي)
  // ==========================================
  {
    id: "44410922",
    name: "أسامة",
    major: "هندسة البرمجيات",
    level: 5,
    cumulative_gpa: 3.8,
    academic_history: [
      { course_code: "CS111", course_name: "أساسيات البرمجة", grade: "B+" },
      { course_code: "SE200", course_name: "مقدمة في هندسة البرمجيات", grade: "A" }
    ],
    current_courses: [
      {
        course_code: "SE330",
        course_name: "تطوير الويب",
        attendance_percentage: 92,
        assessments: { midterm: 29, max_midterm: 30, lab: 12, max_lab: 20, project: 8, max_project: 20 },
        clo_analytics: {
          "CLO1_WebProtocols": 98,     // نظري
          "CLO2_FrontendDesign": 95,   // نظري
          "CLO3_BackendIntegration": 55, // عملي كبير
          "CLO4_Deployment": 60          // عملي كبير
        },
        submission_timestamps: [
          { assignment: "Quiz1", actual_submission: "2026-02-10T09:00:00Z", deadline: "2026-02-10T10:00:00Z" },
          { assignment: "Fullstack_Project", actual_submission: "2026-03-25T23:59:00Z", deadline: "2026-03-25T23:59:00Z" }
        ],
        system_flags: ["تفوق في التقييمات النظرية مقابل ضعف ملحوظ في التطبيق العملي والمشاريع"]
      }
    ]
  },

  // ==========================================
  // طلاب إضافيين لاستكمال وتكثيف قاعدة البيانات
  // ==========================================

  {
    id: "44150011",
    name: "نورة سعد",
    major: "علوم الحاسب",
    level: 4,
    cumulative_gpa: 4.9,
    academic_history: [
      { course_code: "CS111", course_name: "أساسيات البرمجة", grade: "A+" },
      { course_code: "MATH101", course_name: "التفاضل والتكامل", grade: "A+" }
    ],
    current_courses: [
      {
        course_code: "CS212",
        course_name: "الخوارزميات",
        attendance_percentage: 100,
        assessments: { midterm: 29, max_midterm: 30, lab: 20, max_lab: 20 },
        clo_analytics: { "CLO1_Sorting": 98, "CLO2_Graph": 99, "CLO3_Dynamic": 95 },
        submission_timestamps: [
          { assignment: "HW1", actual_submission: "2026-02-05T14:00:00Z", deadline: "2026-02-10T23:59:00Z" }
        ],
        system_flags: ["حالة مستقرة. مرشحة لبرنامج مساعدي التدريس"]
      }
    ]
  },

  {
    id: "44230199",
    name: "خالد سعيد",
    major: "نظم المعلومات",
    level: 6,
    cumulative_gpa: 2.1,
    academic_history: [
      { course_code: "IS200", course_name: "أساسيات نظم المعلومات", grade: "D" },
      { course_code: "CS211", course_name: "برمجة كائنية التوجه", grade: "F" }
    ],
    current_courses: [
      {
        course_code: "CS211",
        course_name: "برمجة كائنية التوجه",
        attendance_percentage: 60,
        assessments: { midterm: 12, max_midterm: 30, lab: 8, max_lab: 20 },
        clo_analytics: { "CLO1_Classes": 65, "CLO2_Inheritance": 40, "CLO3_Polymorphism": 30 },
        submission_timestamps: [
          { assignment: "HW1", actual_submission: "2026-03-01T10:00:00Z", deadline: "2026-02-28T23:59:00Z" } // متأخر
        ],
        system_flags: ["ضعف عام في مفاهيم البرمجة المتقدمة. غياب متكرر وتأخر مستمر"]
      }
    ]
  },

  {
    id: "44010888",
    name: "مروة أحمد",
    major: "هندسة البرمجيات",
    level: 7,
    cumulative_gpa: 4.1,
    academic_history: [
      { course_code: "SE310", course_name: "هندسة المتطلبات", grade: "B+" },
      { course_code: "CS320", course_name: "قواعد البيانات", grade: "A" }
    ],
    current_courses: [
      {
        course_code: "SE340",
        course_name: "ضمان جودة البرمجيات",
        attendance_percentage: 95,
        assessments: { midterm: 26, max_midterm: 30, lab: 19, max_lab: 20 },
        clo_analytics: { "CLO1_Testing": 90, "CLO2_Automation": 95, "CLO3_TestCases": 88 },
        submission_timestamps: [
          { assignment: "HW1", actual_submission: "2026-02-15T18:00:00Z", deadline: "2026-02-20T23:59:00Z" }
        ],
        system_flags: ["أداء مستقر وإنجاز المهام في وقت مبكر"]
      }
    ]
  },

  {
    id: "44445011",
    name: "زياد طارق",
    major: "علوم الحاسب",
    level: 3,
    cumulative_gpa: 3.0,
    academic_history: [
      { course_code: "MATH101", course_name: "التفاضل والتكامل 1", grade: "C" },
      { course_code: "CS111", course_name: "أساسيات البرمجة", grade: "B" }
    ],
    current_courses: [
      {
        course_code: "MATH102",
        course_name: "التفاضل والتكامل 2",
        attendance_percentage: 75,
        assessments: { midterm: 18, max_midterm: 30, lab: 0, max_lab: 0 },
        clo_analytics: { "CLO1_Integration": 70, "CLO2_Series": 60, "CLO3_VectorCalc": 55 },
        submission_timestamps: [
          { assignment: "HW1", actual_submission: "2026-02-25T23:00:00Z", deadline: "2026-02-25T23:59:00Z" }
        ],
        system_flags: ["فجوة رياضيات تراكمية قد تؤثر على المقررات المتقدمة"]
      }
    ]
  },

  {
    id: "43920101",
    name: "لين صالح",
    major: "الذكاء الاصطناعي",
    level: 5,
    cumulative_gpa: 4.4,
    academic_history: [
      { course_code: "CS212", course_name: "الخوارزميات", grade: "A" },
      { course_code: "MATH205", course_name: "الاحتمالات والإحصاء", grade: "A+" }
    ],
    current_courses: [
      {
        course_code: "CS480",
        course_name: "الذكاء الاصطناعي",
        attendance_percentage: 100,
        assessments: { midterm: 28, max_midterm: 30, lab: 18, max_lab: 20 },
        clo_analytics: { "CLO1_SearchAlgorithms": 95, "CLO2_MachineLearning": 98, "CLO3_NeuralNetworks": 92 },
        submission_timestamps: [
          { assignment: "Project_Phase1", actual_submission: "2026-03-05T08:00:00Z", deadline: "2026-03-10T23:59:00Z" }
        ],
        system_flags: ["استيعاب عالي. يمكن الاستفادة منها لتفعيل نظام التوأمة مع الطلاب المتعثرين"]
      }
    ]
  },

  {
    id: "44199822",
    name: "فارس عبدالعزيز",
    major: "أمن سيبراني",
    level: 8,
    cumulative_gpa: 2.8,
    academic_history: [
      { course_code: "CS350", course_name: "شبكات الحاسب", grade: "C+" },
      { course_code: "CS421", course_name: "نظم التشغيل", grade: "D+" }
    ],
    current_courses: [
      {
        course_code: "CYB400",
        course_name: "أمن الشبكات",
        attendance_percentage: 80,
        assessments: { midterm: 14, max_midterm: 30, lab: 10, max_lab: 20 },
        clo_analytics: { "CLO1_Cryptography": 70, "CLO2_NetworkAttacks": 60, "CLO3_FirewallConfig": 40 },
        submission_timestamps: [
          { assignment: "Lab1", actual_submission: "2026-02-15T23:59:00Z", deadline: "2026-02-15T23:59:00Z" },
          { assignment: "Lab2", actual_submission: "2026-03-10T12:00:00Z", deadline: "2026-03-05T23:59:00Z" } // تأخير كبير
        ],
        system_flags: ["تراجع في التطبيق العملي بسبب ضعف في المادة التأسيسية (الشبكات) وتأخر في تسليم المعامل"]
      }
    ]
  }
];

export default studentDatabase;
