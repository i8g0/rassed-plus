/* eslint-disable react-hooks/rules-of-hooks, no-unused-vars */
/**
 * RasedFeaturesGalaxy.jsx — مستكشف مجرة ميزات راصد بلس
 *
 * 🔧 المهندس: محمد عمار
 * 📌 100 ميزة أسطورية مقسمة إلى 4 فئات رئيسية
 * ✅ معزول تماماً — CSS محلي — RTL — Glassmorphism
 * ✅ بحث حي — Modal تفاصيل — Innovation Score — Hover Effects
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { X, Search, Sparkles, Star, TrendingUp, Zap } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
//  الفئات الأربع الرئيسية
// ═══════════════════════════════════════════════════════════════════════════════

const CATEGORIES = [
  { id: 'all',       label: 'الكل',              icon: '🌌', color: '#8B9A6B' },
  { id: 'academic',  label: 'الذكاء الأكاديمي',  icon: '🧠', color: '#8B9A6B' },
  { id: 'life',      label: 'جودة الحياة',       icon: '🌿', color: '#A3B18A' },
  { id: 'career',    label: 'المستقبل والمهنة',  icon: '🚀', color: '#B5C99A' },
  { id: 'college',   label: 'تمكين الكلية',      icon: '🏛️', color: '#D4A373' },
];

// ═══════════════════════════════════════════════════════════════════════════════
//  100 ميزة أسطورية
// ═══════════════════════════════════════════════════════════════════════════════

const FEATURES_DATA = [
  // ─── الذكاء الأكاديمي (25 ميزة) ───────────────────────────────────────────
  { id: 1,  title: 'محرك تحليل الخطورة الأكاديمية',     category: 'academic', description: 'تحليل 6 عوامل سلوكية بأوزان ذكية لتحديد مستوى الخطر الأكاديمي لكل طالب في الوقت الحقيقي، مع مؤشرات لونية فورية.', innovationScore: 97, icon: '🔴' },
  { id: 2,  title: 'التوجيه التكيّفي الذكي',            category: 'academic', description: 'نظام يرصد أسلوب تعلّم الطالب ويقترح مسارات بديلة (فيديو، بودكاست، خرائط ذهنية) تلقائياً عند رصد صعوبة.', innovationScore: 95, icon: '🧭' },
  { id: 3,  title: 'مولّد خطط التدخل بالذكاء الاصطناعي', category: 'academic', description: 'يولّد رسائل دعم أكاديمي شخصية بنبرة إنسانية مع خطة علاجية مفصّلة وجدول متابعة.', innovationScore: 94, icon: '📋' },
  { id: 4,  title: 'رادار المناهج الذكي',               category: 'academic', description: 'يرصد المقررات ذات نسب الرسوب العالية ويقترح تعديلات منهجية مبنية على تحليل البيانات.', innovationScore: 91, icon: '📡' },
  { id: 5,  title: 'تقسيم المهام الذكي (Task Splitter)', category: 'academic', description: 'يحول المهمة الضخمة إلى خطوات صغيرة مع تقدير زمني وتتبع إنجاز كل خطوة.', innovationScore: 89, icon: '✂️' },
  { id: 6,  title: 'الكشف المبكر عن التعثر',            category: 'academic', description: 'خوارزمية تتنبأ بتعثر الطالب قبل أسبوعين من حدوثه باستخدام أنماط السلوك.', innovationScore: 96, icon: '🔮' },
  { id: 7,  title: 'التوأمة الأكاديمية (Peer Matching)', category: 'academic', description: 'خوارزمية تطابق الطلاب ذوي المهارات المتكاملة لتبادل المعرفة وزيادة التحصيل.', innovationScore: 88, icon: '🤝' },
  { id: 8,  title: 'بوصلة المهارات وسوق العمل',         category: 'academic', description: 'تحليل فجوة المهارات وربطها بفرص سوق العمل السعودي مع كورسات مقترحة.', innovationScore: 92, icon: '🧲' },
  { id: 9,  title: 'تحليل السبب الجذري (Root Cause AI)', category: 'academic', description: 'استنتاج السبب الحقيقي وراء تراجع الأداء: هل هو أكاديمي، نفسي، أو تنظيمي؟', innovationScore: 93, icon: '🔍' },
  { id: 10, title: 'تتبع الانضباط اليومي (Streak)',     category: 'academic', description: 'عدّاد الأيام المتواصلة مع مكافآت تحفيزية ورسائل تشجيعية بأسلوب الألعاب.', innovationScore: 82, icon: '🔥' },
  { id: 11, title: 'الخريطة الحرارية للحضور',           category: 'academic', description: 'رسم بياني حراري يعرض أنماط الحضور والغياب على مدار الفصل الدراسي.', innovationScore: 78, icon: '🗺️' },
  { id: 12, title: 'محرك التوصيات الأكاديمية',          category: 'academic', description: 'يقترح مقررات الفصل القادم بناءً على المعدل وحالة المتطلبات السابقة والعبء الدراسي.', innovationScore: 86, icon: '📚' },
  { id: 13, title: 'لوحة تحكم الطالب الذكية',           category: 'academic', description: 'واجهة شخصية تعرض المعدل والمهام والمهارات وبيانات الأداء في مكان واحد.', innovationScore: 84, icon: '📊' },
  { id: 14, title: 'منبّه المواعيد النهائية الذكي',      category: 'academic', description: 'تنبيهات ذكية تتناسب مع مدى قرب الموعد وحجم المهمة المتبقية.', innovationScore: 80, icon: '⏰' },
  { id: 15, title: 'تحليل جلسات المذاكرة',              category: 'academic', description: 'يتتبع ساعات الدراسة الفعلية ويحلل الأوقات الأكثر إنتاجية لكل طالب.', innovationScore: 77, icon: '📖' },
  { id: 16, title: 'اختبارات ذاتية ذكية (Quiz AI)',     category: 'academic', description: 'يولّد أسئلة تقييمية مخصصة بناءً على نقاط الضعف المحددة لكل طالب.', innovationScore: 90, icon: '❓' },
  { id: 17, title: 'ملخصات المحاضرات بالـ AI',          category: 'academic', description: 'تلخيص تلقائي لمحتوى المحاضرات مع أهم النقاط والمفاهيم الأساسية.', innovationScore: 91, icon: '📝' },
  { id: 18, title: 'مراقبة الأداء المقارن',             category: 'academic', description: 'مقارنة أداء الطالب بمتوسط الشعبة والدفعة مع رسوم بيانية تفاعلية.', innovationScore: 75, icon: '📈' },
  { id: 19, title: 'خطة الدراسة الأسبوعية الذكية',      category: 'academic', description: 'يبني جدول مذاكرة أسبوعي مخصص بناء على المهام والاختبارات القادمة.', innovationScore: 85, icon: '📅' },
  { id: 20, title: 'مساعد الأبحاث الأكاديمية',          category: 'academic', description: 'يساعد في البحث عن مراجع علمية وصياغة الأبحاث بالمعايير الأكاديمية.', innovationScore: 83, icon: '🔬' },
  { id: 21, title: 'تحليل نمط الأسئلة الامتحانية',      category: 'academic', description: 'يحلل الأنماط المتكررة في الاختبارات السابقة ويتوقع أنواع الأسئلة القادمة.', innovationScore: 87, icon: '🎯' },
  { id: 22, title: 'نظام التقييم التكويني',             category: 'academic', description: 'تقييم مستمر لا يعتمد على الاختبارات فقط بل على المشاركة والتفاعل اليومي.', innovationScore: 79, icon: '✅' },
  { id: 23, title: 'محرك ربط المفاهيم',                 category: 'academic', description: 'خريطة مفاهيم تفاعلية تربط المواضيع ببعضها عبر المقررات المختلفة.', innovationScore: 81, icon: '🕸️' },
  { id: 24, title: 'تشخيص فجوات المعرفة',               category: 'academic', description: 'يحدد المفاهيم الأساسية المفقودة التي تعيق فهم المحتوى المتقدم.', innovationScore: 88, icon: '🧩' },
  { id: 25, title: 'تنبؤ المعدل التراكمي',              category: 'academic', description: 'يتنبأ بالمعدل المتوقع نهاية الفصل بناءً على الأداء الحالي والاتجاهات.', innovationScore: 90, icon: '🎓' },

  // ─── جودة الحياة (25 ميزة) ────────────────────────────────────────────────
  { id: 26, title: 'مراقب الصحة النفسية',               category: 'life', description: 'يرصد مؤشرات القلق والضغط الأكاديمي من أنماط السلوك الرقمي ويقترح تدخلات داعمة.', innovationScore: 96, icon: '🧘' },
  { id: 27, title: 'نظام إدارة الوقت الذكي',            category: 'life', description: 'يحلل كيف يقضي الطالب وقته ويقترح توزيعاً أمثل بين الدراسة والراحة.', innovationScore: 88, icon: '⏳' },
  { id: 28, title: 'كاشف اضطرابات النوم',               category: 'life', description: 'يحلل أوقات الدخول المتأخرة ويكشف أنماط اضطراب النوم مع توصيات علاجية.', innovationScore: 93, icon: '😴' },
  { id: 29, title: 'بطاقة الرفاهية الشاملة',            category: 'life', description: 'لوحة تعرض 6 أبعاد للرفاهية: أكاديمي، نفسي، اجتماعي، جسدي، مالي، روحي.', innovationScore: 85, icon: '🌈' },
  { id: 30, title: 'تحفيز بأسلوب الألعاب (Gamification)', category: 'life', description: 'نقاط، شارات، مستويات، ولوحة متصدرين تحوّل الدراسة إلى تجربة ممتعة.', innovationScore: 87, icon: '🎮' },
  { id: 31, title: 'مخطط التوازن الحياتي',              category: 'life', description: 'أداة بصرية تعرض التوازن بين الدراسة، العمل، الأسرة، والترفيه.', innovationScore: 80, icon: '⚖️' },
  { id: 32, title: 'إشعارات تحفيزية ذكية',             category: 'life', description: 'رسائل تحفيزية مخصصة تصل في الوقت المناسب بناءً على حالة الطالب.', innovationScore: 78, icon: '💪' },
  { id: 33, title: 'مراقب ساعات الشاشة',                category: 'life', description: 'يتتبع وقت استخدام النظام ويذكّر بأخذ استراحات منتظمة.', innovationScore: 72, icon: '👁️' },
  { id: 34, title: 'برنامج التأمل والتركيز',            category: 'life', description: 'جلسات تأمل قصيرة مدمجة في النظام لتحسين التركيز قبل المذاكرة.', innovationScore: 76, icon: '🕯️' },
  { id: 35, title: 'مجتمع الدعم الأكاديمي',             category: 'life', description: 'منتدى آمن يتيح للطلاب مشاركة تحدياتهم والحصول على دعم الأقران.', innovationScore: 82, icon: '💬' },
  { id: 36, title: 'تتبع اللياقة والنشاط البدني',       category: 'life', description: 'ربط مع تطبيقات اللياقة لقياس تأثير النشاط البدني على الأداء الأكاديمي.', innovationScore: 74, icon: '🏃' },
  { id: 37, title: 'نظام المكافآت والإنجازات',          category: 'life', description: 'مكافآت حقيقية (خصومات، أولويات تسجيل) للطلاب المتميزين والملتزمين.', innovationScore: 84, icon: '🏆' },
  { id: 38, title: 'مساعد التغذية الصحية',              category: 'life', description: 'نصائح غذائية مخصصة لتعزيز التركيز والطاقة خلال فترات الاختبارات.', innovationScore: 70, icon: '🥗' },
  { id: 39, title: 'مخطط الأنشطة اللامنهجية',           category: 'life', description: 'يقترح أنشطة وأندية جامعية تناسب اهتمامات الطالب وجدوله.', innovationScore: 75, icon: '🎨' },
  { id: 40, title: 'نظام الإرشاد النفسي المباشر',       category: 'life', description: 'حجز جلسات إرشاد نفسي مباشرة مع متخصصين عبر النظام.', innovationScore: 91, icon: '🧑‍⚕️' },
  { id: 41, title: 'يوميات الطالب الذكية',              category: 'life', description: 'دفتر يوميات رقمي يتتبع المزاج والأفكار ويكشف الأنماط العاطفية.', innovationScore: 79, icon: '📓' },
  { id: 42, title: 'مراقب الضغط الأكاديمي',             category: 'life', description: 'مقياس بصري للضغط الأكاديمي مع تنبيهات عند الوصول لمستويات خطرة.', innovationScore: 86, icon: '🌡️' },
  { id: 43, title: 'برنامج العادات الإيجابية',           category: 'life', description: 'بناء عادات دراسية صحية بنظام الـ 21 يوم مع تتبع يومي.', innovationScore: 77, icon: '🌱' },
  { id: 44, title: 'مخطط الإجازات الذكي',               category: 'life', description: 'يخطط فترات الراحة والإجازات بين الاختبارات لتجنب الإرهاق.', innovationScore: 73, icon: '🏖️' },
  { id: 45, title: 'ربط أولياء الأمور',                 category: 'life', description: 'بوابة آمنة لأولياء الأمور للاطلاع على أداء أبنائهم بإذن الطالب.', innovationScore: 83, icon: '👨‍👩‍👧' },
  { id: 46, title: 'مجموعات الدراسة الافتراضية',        category: 'life', description: 'إنشاء غرف دراسة افتراضية مع مؤقت بومودورو مشترك.', innovationScore: 81, icon: '👥' },
  { id: 47, title: 'نظام الشكاوى والمقترحات',           category: 'life', description: 'قناة مباشرة لرفع الشكاوى والمقترحات مع تتبع حالة كل طلب.', innovationScore: 71, icon: '📮' },
  { id: 48, title: 'تقييم أعضاء هيئة التدريس',          category: 'life', description: 'تقييم مجهول وبنّاء لأعضاء هيئة التدريس لتحسين جودة التعليم.', innovationScore: 78, icon: '⭐' },
  { id: 49, title: 'مساعد المواصلات الجامعية',           category: 'life', description: 'تنظيم مشاركة المواصلات بين الطلاب في نفس المنطقة السكنية.', innovationScore: 68, icon: '🚌' },
  { id: 50, title: 'نظام الطوارئ السريع',               category: 'life', description: 'زر طوارئ سريع للتواصل مع الأمن الجامعي أو الخدمات الطبية.', innovationScore: 89, icon: '🚨' },

  // ─── المستقبل والمهنة (25 ميزة) ───────────────────────────────────────────
  { id: 51, title: 'محرك التوصيات المهنية بالـ AI',      category: 'career', description: 'يحلل مهارات الطالب واهتماماته ويقترح مسارات مهنية مناسبة في سوق العمل السعودي.', innovationScore: 95, icon: '💼' },
  { id: 52, title: 'ربط المهارات بسوق العمل',            category: 'career', description: 'خريطة تفاعلية تربط كل مهارة أكاديمية بالوظائف والرواتب المتوقعة.', innovationScore: 92, icon: '🗺️' },
  { id: 53, title: 'بوابة التدريب التعاوني',             category: 'career', description: 'منصة تربط الطلاب بفرص تدريب في الشركات الكبرى تلقائياً.', innovationScore: 90, icon: '🏢' },
  { id: 54, title: 'مُنشئ السيرة الذاتية الذكي',        category: 'career', description: 'يبني سيرة ذاتية احترافية من بيانات الطالب الأكاديمية ومهاراته تلقائياً.', innovationScore: 88, icon: '📄' },
  { id: 55, title: 'محاكي المقابلات بالـ AI',            category: 'career', description: 'تدريب تفاعلي على مقابلات العمل مع تقييم فوري للأداء والنصائح.', innovationScore: 93, icon: '🎤' },
  { id: 56, title: 'تتبع شهادات الكورسات',              category: 'career', description: 'نظام يتتبع الكورسات والشهادات المكتسبة ويقترح الناقص حسب المسار المهني.', innovationScore: 82, icon: '🎖️' },
  { id: 57, title: 'شبكة الخريجين (Alumni Network)',     category: 'career', description: 'يربط الطلاب الحاليين بالخريجين للحصول على نصائح مهنية وتوجيه.', innovationScore: 85, icon: '🌐' },
  { id: 58, title: 'تحليل اتجاهات سوق العمل',           category: 'career', description: 'تقارير حية عن أكثر الوظائف طلباً والمهارات المطلوبة في السوق السعودي.', innovationScore: 87, icon: '📊' },
  { id: 59, title: 'مستشار ريادة الأعمال',              category: 'career', description: 'إرشاد ذكي للطلاب المهتمين بإطلاق مشاريعهم الخاصة.', innovationScore: 84, icon: '💡' },
  { id: 60, title: 'مسرّع الابتكار الطلابي',            category: 'career', description: 'منصة لعرض المشاريع الطلابية الابتكارية والتنافس على جوائز.', innovationScore: 86, icon: '🏅' },
  { id: 61, title: 'مستشار المنح والبعثات',             category: 'career', description: 'يبحث عن منح دراسية وبعثات خارجية تناسب تخصص الطالب ومعدله.', innovationScore: 89, icon: '✈️' },
  { id: 62, title: 'بناء الملف المهني (Portfolio)',      category: 'career', description: 'أداة لبناء ملف أعمال رقمي احترافي يعرض مشاريع الطالب.', innovationScore: 81, icon: '🖼️' },
  { id: 63, title: 'مختبر المهارات الناعمة',             category: 'career', description: 'تقييم وتطوير مهارات التواصل والقيادة والعمل الجماعي.', innovationScore: 80, icon: '🗣️' },
  { id: 64, title: 'تحليل الفجوة المهنية',              category: 'career', description: 'مقارنة مهارات الطالب مع متطلبات الوظيفة المستهدفة وتحديد الفجوات.', innovationScore: 83, icon: '🔎' },
  { id: 65, title: 'مراقب فرص العمل الذكي',             category: 'career', description: 'إشعارات فورية عند نشر فرص عمل تتوافق مع ملف الطالب.', innovationScore: 79, icon: '📢' },
  { id: 66, title: 'محاكي بيئة العمل',                  category: 'career', description: 'تجربة افتراضية لبيئة العمل الحقيقية في مختلف القطاعات.', innovationScore: 77, icon: '🏗️' },
  { id: 67, title: 'برنامج الإرشاد المهني بالأقران',    category: 'career', description: 'ربط طلاب السنوات المتأخرة بالمبتدئين لتقديم نصائح مهنية.', innovationScore: 76, icon: '🤝' },
  { id: 68, title: 'تحليل عائد الاستثمار التعليمي',     category: 'career', description: 'حساب العائد المتوقع من كل تخصص بناءً على تكاليف الدراسة والرواتب.', innovationScore: 85, icon: '💰' },
  { id: 69, title: 'نظام التوصيات للدراسات العليا',     category: 'career', description: 'يقترح برامج ماجستير ودكتوراه تناسب اهتمامات الطالب البحثية.', innovationScore: 82, icon: '🎓' },
  { id: 70, title: 'محرك مطابقة المشاريع',              category: 'career', description: 'يطابق الطلاب مع مشاريع تخرج ومشاريع بحثية تناسب تخصصاتهم.', innovationScore: 78, icon: '🔧' },
  { id: 71, title: 'تحضير اختبارات الشهادات المهنية',   category: 'career', description: 'تجهيز الطالب لاختبارات مثل AWS, CCNA, PMP بخطط دراسية مخصصة.', innovationScore: 81, icon: '📜' },
  { id: 72, title: 'أداة التفاوض على الرواتب',          category: 'career', description: 'محاكاة تفاوض الراتب مع نصائح مبنية على بيانات السوق.', innovationScore: 74, icon: '💵' },
  { id: 73, title: 'مراقب التطوير المهني المستمر',      category: 'career', description: 'خطة تطوير مهني مستمرة حتى بعد التخرج مع أهداف ربع سنوية.', innovationScore: 80, icon: '📈' },
  { id: 74, title: 'منصة المشاريع الحرة (Freelance)',    category: 'career', description: 'ربط الطلاب بمشاريع حرة مناسبة لمهاراتهم لبناء خبرة عملية.', innovationScore: 83, icon: '💻' },
  { id: 75, title: 'نظام التوصيات الأكاديمية للشركات',  category: 'career', description: 'يتيح للأساتذة كتابة توصيات رقمية موثقة يمكن مشاركتها مع أصحاب العمل.', innovationScore: 77, icon: '📧' },

  // ─── تمكين الكلية (25 ميزة) ───────────────────────────────────────────────
  { id: 76,  title: 'لوحة القيادة التنفيذية للعميد',    category: 'college', description: 'لوحة KPI شاملة تعرض مؤشرات الأداء الرئيسية للكلية في نظرة واحدة.', innovationScore: 94, icon: '👔' },
  { id: 77,  title: 'تحليلات الاعتماد الأكاديمي',       category: 'college', description: 'يجمع ويحلل بيانات الاعتماد (ABET, NCAAA) تلقائياً ويولّد تقارير جاهزة.', innovationScore: 93, icon: '🏅' },
  { id: 78,  title: 'نظام إدارة التدخلات المركزي',      category: 'college', description: 'تتبع جميع التدخلات الأكاديمية مع قياس فعاليتها ونسبة النجاح.', innovationScore: 91, icon: '📋' },
  { id: 79,  title: 'مركز تحكم المرشد الأكاديمي',       category: 'college', description: 'واجهة متكاملة للمرشد تعرض طلابه مع مؤشرات الخطورة والأولوية.', innovationScore: 90, icon: '🎛️' },
  { id: 80,  title: 'تقارير الأداء المؤسسي',            category: 'college', description: 'تقارير دورية تعرض أداء الأقسام والبرامج مع مقارنات بينية.', innovationScore: 86, icon: '📑' },
  { id: 81,  title: 'نظام توزيع الطلاب على المرشدين',   category: 'college', description: 'توزيع ذكي يوازن عدد الطلاب ومستوى الخطورة بين المرشدين.', innovationScore: 84, icon: '🔀' },
  { id: 82,  title: 'إدارة الجودة الأكاديمية',          category: 'college', description: 'مؤشرات جودة التعليم مع تتبع التحسينات وخطط التطوير.', innovationScore: 87, icon: '✨' },
  { id: 83,  title: 'تحليل معدلات التخرج والتسرب',      category: 'college', description: 'تحليل عميق لمعدلات التخرج مع تحديد نقاط التسرب الحرجة.', innovationScore: 89, icon: '📉' },
  { id: 84,  title: 'نظام الإنذار المبكر المؤسسي',      category: 'college', description: 'تنبيهات للإدارة عند ملاحظة أنماط سلبية على مستوى القسم أو البرنامج.', innovationScore: 92, icon: '🚨' },
  { id: 85,  title: 'إدارة القاعات والمرافق',           category: 'college', description: 'حجز ذكي للقاعات بناءً على حجم الشعب واحتياجات التجهيزات.', innovationScore: 75, icon: '🏫' },
  { id: 86,  title: 'محرك جدولة الاختبارات',             category: 'college', description: 'جدولة اختبارات خالية من التعارضات مع مراعاة فترات الراحة.', innovationScore: 82, icon: '📆' },
  { id: 87,  title: 'نظام تقييم أعضاء هيئة التدريس',    category: 'college', description: 'تقييم 360° لأعضاء هيئة التدريس مع تقارير تطوير مهنية.', innovationScore: 80, icon: '👨‍🏫' },
  { id: 88,  title: 'إدارة الميزانية الأكاديمية',       category: 'college', description: 'تتبع صرف الميزانية مع تحليل تكلفة-فعالية البرامج الأكاديمية.', innovationScore: 78, icon: '💳' },
  { id: 89,  title: 'مركز البيانات المفتوحة',           category: 'college', description: 'بيانات مجهولة الهوية متاحة للباحثين لدراسة الأنماط التعليمية.', innovationScore: 76, icon: '🗄️' },
  { id: 90,  title: 'نظام الاستبيانات الذكية',          category: 'college', description: 'أداة لإنشاء ونشر وتحليل الاستبيانات الأكاديمية مع AI.', innovationScore: 77, icon: '📝' },
  { id: 91,  title: 'لوحة المقارنة المعيارية',          category: 'college', description: 'مقارنة مؤشرات الأداء مع جامعات مرجعية محلياً وعالمياً.', innovationScore: 85, icon: '🏆' },
  { id: 92,  title: 'نظام إدارة المخاطر الأكاديمية',    category: 'college', description: 'تحديد وتقييم المخاطر الأكاديمية مع خطط استجابة استباقية.', innovationScore: 88, icon: '🛡️' },
  { id: 93,  title: 'تحليل رضا الطلاب',                 category: 'college', description: 'قياس مستمر لرضا الطلاب عن الخدمات الأكاديمية والإدارية.', innovationScore: 79, icon: '😊' },
  { id: 94,  title: 'نظام التقارير التلقائي',           category: 'college', description: 'توليد تقارير دورية تلقائية للإدارة العليا بصيغ متعددة.', innovationScore: 83, icon: '🤖' },
  { id: 95,  title: 'إدارة الشراكات الصناعية',          category: 'college', description: 'تتبع شراكات الكلية مع القطاع الخاص ومدى استفادة الطلاب منها.', innovationScore: 81, icon: '🏭' },
  { id: 96,  title: 'نظام تتبع مخرجات التعلم',          category: 'college', description: 'ربط مخرجات التعلم المعتمدة بالأنشطة والتقييمات وقياس التحقق.', innovationScore: 87, icon: '🎯' },
  { id: 97,  title: 'محرك تخطيط القوى العاملة',         category: 'college', description: 'تحليل احتياجات الكلية من أعضاء هيئة التدريس والموظفين.', innovationScore: 74, icon: '👥' },
  { id: 98,  title: 'نظام إدارة المناهج',               category: 'college', description: 'نظام لتصميم ومراجعة وتحديث المناهج الدراسية بشكل تعاوني.', innovationScore: 82, icon: '📘' },
  { id: 99,  title: 'بوابة الحوكمة الأكاديمية',         category: 'college', description: 'نظام متكامل للحوكمة يضمن الشفافية والمساءلة في القرارات.', innovationScore: 80, icon: '⚙️' },
  { id: 100, title: 'مركز قيادة التحول الرقمي',         category: 'college', description: 'لوحة تقيس مدى التحول الرقمي في الكلية مع خارطة طريق التطوير.', innovationScore: 91, icon: '🌟' },
];

// ═══════════════════════════════════════════════════════════════════════════════
//  Sub-components
// ═══════════════════════════════════════════════════════════════════════════════

function InnovationBar({ score, color }) {
  return (
    <div className="rfg-innovation-bar-track">
      <div
        className="rfg-innovation-bar-fill"
        style={{ width: `${score}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }}
      />
      <span className="rfg-innovation-bar-label">{score}%</span>
    </div>
  );
}

function FeatureCard({ feature, categoryColor, onClick }) {
  return (
    <div
      className="rfg-card"
      onClick={() => onClick(feature)}
      style={{ '--card-glow': categoryColor }}
    >
      <div className="rfg-card-icon">{feature.icon}</div>
      <h3 className="rfg-card-title">{feature.title}</h3>
      <p className="rfg-card-desc">{feature.description}</p>
      <div className="rfg-card-footer">
        <span className="rfg-card-score-label">
          <Zap size={12} /> مؤشر الابتكار
        </span>
        <InnovationBar score={feature.innovationScore} color={categoryColor} />
      </div>
    </div>
  );
}

function FeatureModal({ feature, categoryColor, onClose }) {
  if (!feature) return null;

  const cat = CATEGORIES.find((c) => c.id === feature.category);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="rfg-modal-overlay" onClick={onClose}>
      <div className="rfg-modal" onClick={(e) => e.stopPropagation()}>
        <button className="rfg-modal-close" onClick={onClose}><X size={20} /></button>

        <div className="rfg-modal-icon">{feature.icon}</div>
        <h2 className="rfg-modal-title">{feature.title}</h2>

        <div className="rfg-modal-category" style={{ color: categoryColor }}>
          {cat?.icon} {cat?.label}
        </div>

        <p className="rfg-modal-desc">{feature.description}</p>

        <div className="rfg-modal-score-section">
          <div className="rfg-modal-score-header">
            <TrendingUp size={16} />
            <span>مؤشر الابتكار</span>
          </div>
          <div className="rfg-modal-score-bar-track">
            <div
              className="rfg-modal-score-bar-fill"
              style={{
                width: `${feature.innovationScore}%`,
                background: `linear-gradient(90deg, ${categoryColor}, ${categoryColor}66)`,
              }}
            />
          </div>
          <div className="rfg-modal-score-value" style={{ color: categoryColor }}>
            {feature.innovationScore}/100
          </div>
        </div>

        <div className="rfg-modal-meta">
          <div className="rfg-modal-meta-item">
            <Star size={14} />
            <span>مستوى التأثير: {feature.innovationScore >= 90 ? 'ثوري' : feature.innovationScore >= 80 ? 'عالي' : feature.innovationScore >= 70 ? 'متقدم' : 'قياسي'}</span>
          </div>
          <div className="rfg-modal-meta-item">
            <Sparkles size={14} />
            <span>حالة التطوير: {feature.innovationScore >= 85 ? 'مكتمل ✅' : 'قيد التطوير 🔧'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  المكوّن الرئيسي
// ═══════════════════════════════════════════════════════════════════════════════

export default function RasedFeaturesGalaxy() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [visibleCount, setVisibleCount] = useState(20);

  const getCategoryColor = useCallback((catId) => {
    return CATEGORIES.find((c) => c.id === catId)?.color || '#8B9A6B';
  }, []);

  const filteredFeatures = useMemo(() => {
    let list = FEATURES_DATA;
    if (activeCategory !== 'all') {
      list = list.filter((f) => f.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (f) => f.title.toLowerCase().includes(q) || f.description.toLowerCase().includes(q),
      );
    }
    return list;
  }, [activeCategory, searchQuery]);

  const displayedFeatures = filteredFeatures.slice(0, visibleCount);
  const hasMore = visibleCount < filteredFeatures.length;

  const categoryStats = useMemo(() => {
    const stats = {};
    CATEGORIES.forEach((cat) => {
      if (cat.id === 'all') {
        stats.all = FEATURES_DATA.length;
      } else {
        stats[cat.id] = FEATURES_DATA.filter((f) => f.category === cat.id).length;
      }
    });
    return stats;
  }, []);

  useEffect(() => {
    setVisibleCount(20);
  }, [activeCategory, searchQuery]);

  const avgScore = useMemo(() => {
    if (filteredFeatures.length === 0) return 0;
    return Math.round(filteredFeatures.reduce((s, f) => s + f.innovationScore, 0) / filteredFeatures.length);
  }, [filteredFeatures]);

  return (
    <>
      <style>{GALAXY_CSS}</style>

      <div className="rfg-shell" dir="rtl">
        {/* ── Hero Header ── */}
        <header className="rfg-header">
          <div className="rfg-header-orb rfg-orb-1" />
          <div className="rfg-header-orb rfg-orb-2" />
          <div className="rfg-header-orb rfg-orb-3" />

          <p className="rfg-overline">
            <Sparkles size={14} /> مستكشف مجرّة الميزات
          </p>
          <h1 className="rfg-title">
            <span className="rfg-title-gradient">100 ميزة أسطورية</span> في راصد بلس
          </h1>
          <p className="rfg-subtitle">
            نظام إرشاد أكاديمي ذكي مدعوم بالذكاء الاصطناعي — جاهز لتحويل مستقبل التعليم الجامعي
          </p>

          {/* KPIs */}
          <div className="rfg-kpi-row">
            <div className="rfg-kpi">
              <span className="rfg-kpi-value">{FEATURES_DATA.length}</span>
              <span className="rfg-kpi-label">ميزة إجمالية</span>
            </div>
            <div className="rfg-kpi">
              <span className="rfg-kpi-value">{filteredFeatures.length}</span>
              <span className="rfg-kpi-label">نتيجة معروضة</span>
            </div>
            <div className="rfg-kpi">
              <span className="rfg-kpi-value">{avgScore}%</span>
              <span className="rfg-kpi-label">متوسط الابتكار</span>
            </div>
            <div className="rfg-kpi">
              <span className="rfg-kpi-value">4</span>
              <span className="rfg-kpi-label">فئات رئيسية</span>
            </div>
          </div>

          {/* Search */}
          <div className="rfg-search-wrap">
            <Search size={18} />
            <input
              type="text"
              className="rfg-search-input"
              placeholder="ابحث في 100 ميزة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="rfg-search-clear" onClick={() => setSearchQuery('')}>
                <X size={14} />
              </button>
            )}
          </div>
        </header>

        {/* ── Category Tabs ── */}
        <nav className="rfg-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`rfg-tab ${activeCategory === cat.id ? 'rfg-tab-active' : ''}`}
              style={{ '--tab-color': cat.color }}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span className="rfg-tab-icon">{cat.icon}</span>
              <span className="rfg-tab-label">{cat.label}</span>
              <span className="rfg-tab-count">{categoryStats[cat.id]}</span>
            </button>
          ))}
        </nav>

        {/* ── Features Grid ── */}
        {filteredFeatures.length === 0 ? (
          <div className="rfg-empty">
            <span className="rfg-empty-icon">🔭</span>
            <p>لم يتم العثور على ميزات تطابق بحثك</p>
            <button className="rfg-empty-btn" onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}>
              عرض جميع الميزات
            </button>
          </div>
        ) : (
          <>
            <div className="rfg-grid">
              {displayedFeatures.map((feature, i) => (
                <FeatureCard
                  key={feature.id}
                  feature={feature}
                  categoryColor={getCategoryColor(feature.category)}
                  onClick={setSelectedFeature}
                />
              ))}
            </div>

            {hasMore && (
              <div className="rfg-load-more-wrap">
                <button className="rfg-load-more" onClick={() => setVisibleCount((v) => v + 20)}>
                  عرض المزيد ({filteredFeatures.length - visibleCount} متبقية)
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Feature Detail Modal ── */}
        {selectedFeature && (
          <FeatureModal
            feature={selectedFeature}
            categoryColor={getCategoryColor(selectedFeature.category)}
            onClose={() => setSelectedFeature(null)}
          />
        )}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Scoped CSS — Galaxy Theme (Dark + Earth Tones + Glassmorphism)
// ═══════════════════════════════════════════════════════════════════════════════

const GALAXY_CSS = `
/* ── Shell ── */
.rfg-shell {
  direction: rtl;
  max-width: 100%;
  min-height: 100%;
  color: #F5F0EB;
  font-family: 'Tajawal', sans-serif;
}

/* ── Header ── */
.rfg-header {
  position: relative;
  text-align: center;
  padding: 2.5rem 2rem 1.5rem;
  overflow: hidden;
  border-radius: 20px;
  background: linear-gradient(145deg, rgba(139,154,107,0.08), rgba(212,163,115,0.06), rgba(15,23,42,0.95));
  border: 1px solid rgba(139,154,107,0.12);
  margin-bottom: 1.5rem;
}

.rfg-header-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
  pointer-events: none;
}
.rfg-orb-1 { width: 300px; height: 300px; background: #8B9A6B; top: -100px; right: -50px; }
.rfg-orb-2 { width: 200px; height: 200px; background: #D4A373; bottom: -60px; left: -30px; }
.rfg-orb-3 { width: 150px; height: 150px; background: #B5C99A; top: 50%; left: 50%; transform: translate(-50%,-50%); }

.rfg-overline {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: #A3B18A;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin-bottom: 0.6rem;
  position: relative;
}

.rfg-title {
  font-size: 2.2rem;
  font-weight: 900;
  line-height: 1.3;
  margin-bottom: 0.5rem;
  position: relative;
}

.rfg-title-gradient {
  background: linear-gradient(135deg, #A3B18A, #D4A373, #F5F0EB);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.rfg-subtitle {
  color: rgba(245,240,235,0.5);
  font-size: 0.92rem;
  max-width: 600px;
  margin: 0 auto 1.5rem;
  line-height: 1.6;
  position: relative;
}

/* KPIs */
.rfg-kpi-row {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
  position: relative;
}

.rfg-kpi {
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 0.8rem 1.5rem;
  text-align: center;
  min-width: 110px;
  transition: all 0.3s ease;
}
.rfg-kpi:hover {
  transform: translateY(-2px);
  border-color: rgba(139,154,107,0.3);
  box-shadow: 0 6px 20px rgba(139,154,107,0.1);
}

.rfg-kpi-value {
  display: block;
  font-size: 1.6rem;
  font-weight: 900;
  color: #A3B18A;
  line-height: 1;
}

.rfg-kpi-label {
  font-size: 0.72rem;
  color: rgba(245,240,235,0.45);
  margin-top: 0.2rem;
  display: block;
}

/* Search */
.rfg-search-wrap {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  max-width: 480px;
  margin: 0 auto;
  padding: 0.7rem 1.1rem;
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 14px;
  color: rgba(245,240,235,0.4);
  position: relative;
  transition: all 0.3s ease;
}
.rfg-search-wrap:focus-within {
  border-color: rgba(139,154,107,0.4);
  box-shadow: 0 0 0 3px rgba(139,154,107,0.1);
}

.rfg-search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: #F5F0EB;
  font-family: inherit;
  font-size: 0.9rem;
  direction: rtl;
}
.rfg-search-input::placeholder { color: rgba(245,240,235,0.35); }

.rfg-search-clear {
  width: 24px; height: 24px;
  border: none; border-radius: 50%;
  background: rgba(255,255,255,0.1);
  color: rgba(245,240,235,0.6);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s ease;
}
.rfg-search-clear:hover { background: rgba(244,63,94,0.2); color: #F43F5E; }

/* ── Tabs ── */
.rfg-tabs {
  display: flex;
  gap: 0.5rem;
  padding: 0 0.5rem;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  scrollbar-width: none;
}
.rfg-tabs::-webkit-scrollbar { display: none; }

.rfg-tab {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.6rem 1.1rem;
  border-radius: 99px;
  border: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.03);
  color: rgba(245,240,235,0.45);
  cursor: pointer;
  font-family: inherit;
  font-weight: 600;
  font-size: 0.82rem;
  white-space: nowrap;
  transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
  flex-shrink: 0;
}
.rfg-tab:hover {
  background: rgba(255,255,255,0.06);
  color: rgba(245,240,235,0.7);
}

.rfg-tab-active {
  background: rgba(139,154,107,0.12) !important;
  color: #A3B18A !important;
  border-color: rgba(139,154,107,0.25) !important;
  box-shadow: 0 0 12px rgba(139,154,107,0.1);
}

.rfg-tab-icon { font-size: 1.05rem; }
.rfg-tab-count {
  background: rgba(255,255,255,0.06);
  padding: 0.1rem 0.45rem;
  border-radius: 99px;
  font-size: 0.7rem;
  font-weight: 800;
}
.rfg-tab-active .rfg-tab-count {
  background: rgba(139,154,107,0.2);
  color: #A3B18A;
}

/* ── Grid ── */
.rfg-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 1rem;
  padding: 0 0.25rem;
}

/* ── Card ── */
.rfg-card {
  background: rgba(255,255,255,0.035);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
  position: relative;
  overflow: hidden;
  animation: rfgCardIn 0.4s ease backwards;
}
.rfg-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 16px;
  opacity: 0;
  background: radial-gradient(circle at 50% 0%, var(--card-glow), transparent 70%);
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.rfg-card:hover {
  transform: translateY(-4px);
  border-color: var(--card-glow);
  box-shadow: 0 8px 30px rgba(0,0,0,0.3), 0 0 20px color-mix(in srgb, var(--card-glow) 15%, transparent);
}
.rfg-card:hover::before { opacity: 0.06; }

@keyframes rfgCardIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.rfg-card-icon {
  font-size: 2rem;
  margin-bottom: 0.6rem;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.3));
}

.rfg-card-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #F5F0EB;
  margin-bottom: 0.4rem;
  line-height: 1.4;
}

.rfg-card-desc {
  font-size: 0.78rem;
  color: rgba(245,240,235,0.4);
  line-height: 1.6;
  margin-bottom: 0.9rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.rfg-card-footer {
  border-top: 1px solid rgba(255,255,255,0.05);
  padding-top: 0.7rem;
}

.rfg-card-score-label {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.7rem;
  font-weight: 700;
  color: rgba(245,240,235,0.35);
  margin-bottom: 0.35rem;
}

/* Innovation Bar */
.rfg-innovation-bar-track {
  width: 100%;
  height: 6px;
  border-radius: 99px;
  background: rgba(255,255,255,0.06);
  position: relative;
  overflow: hidden;
}

.rfg-innovation-bar-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 1s cubic-bezier(0.22,1,0.36,1);
}

.rfg-innovation-bar-label {
  position: absolute;
  left: 4px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.58rem;
  font-weight: 800;
  color: rgba(245,240,235,0.5);
  direction: ltr;
}

/* ── Empty State ── */
.rfg-empty {
  text-align: center;
  padding: 3rem 1rem;
  color: rgba(245,240,235,0.35);
}
.rfg-empty-icon { font-size: 3rem; display: block; margin-bottom: 0.75rem; }
.rfg-empty p { font-size: 0.92rem; margin-bottom: 1rem; }
.rfg-empty-btn {
  padding: 0.55rem 1.2rem;
  border-radius: 10px;
  border: 1px solid rgba(139,154,107,0.3);
  background: rgba(139,154,107,0.1);
  color: #A3B18A;
  cursor: pointer;
  font-family: inherit;
  font-weight: 700;
  font-size: 0.82rem;
  transition: all 0.25s ease;
}
.rfg-empty-btn:hover { background: rgba(139,154,107,0.2); }

/* ── Load More ── */
.rfg-load-more-wrap {
  text-align: center;
  padding: 1.5rem 0;
}

.rfg-load-more {
  padding: 0.7rem 2rem;
  border-radius: 99px;
  border: 1px solid rgba(139,154,107,0.25);
  background: rgba(139,154,107,0.08);
  color: #A3B18A;
  cursor: pointer;
  font-family: inherit;
  font-weight: 700;
  font-size: 0.86rem;
  transition: all 0.3s ease;
}
.rfg-load-more:hover {
  background: rgba(139,154,107,0.18);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(139,154,107,0.15);
}

/* ── Modal ── */
.rfg-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(6,8,15,0.75);
  backdrop-filter: blur(10px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  animation: rfgFadeIn 0.25s ease;
}

@keyframes rfgFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.rfg-modal {
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  background: rgba(15,18,30,0.97);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(139,154,107,0.2);
  border-radius: 20px;
  padding: 2rem;
  position: relative;
  animation: rfgModalIn 0.35s cubic-bezier(0.22,1,0.36,1);
  box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(139,154,107,0.06);
  direction: rtl;
  text-align: center;
}

@keyframes rfgModalIn {
  from { opacity: 0; transform: scale(0.92) translateY(12px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

.rfg-modal-close {
  position: absolute;
  top: 1rem;
  left: 1rem;
  width: 36px; height: 36px;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s ease;
}
.rfg-modal-close:hover {
  background: rgba(244,63,94,0.15);
  border-color: rgba(244,63,94,0.3);
  color: #F43F5E;
}

.rfg-modal-icon {
  font-size: 3.5rem;
  margin-bottom: 0.75rem;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.4));
}

.rfg-modal-title {
  font-size: 1.3rem;
  font-weight: 900;
  color: #F5F0EB;
  margin-bottom: 0.5rem;
}

.rfg-modal-category {
  font-size: 0.82rem;
  font-weight: 700;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
}

.rfg-modal-desc {
  font-size: 0.88rem;
  color: rgba(245,240,235,0.55);
  line-height: 1.8;
  margin-bottom: 1.3rem;
  text-align: right;
}

.rfg-modal-score-section {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.rfg-modal-score-header {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: rgba(245,240,235,0.6);
  margin-bottom: 0.6rem;
  justify-content: center;
}

.rfg-modal-score-bar-track {
  width: 100%;
  height: 10px;
  border-radius: 99px;
  background: rgba(255,255,255,0.06);
  overflow: hidden;
  margin-bottom: 0.4rem;
}

.rfg-modal-score-bar-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 1s cubic-bezier(0.22,1,0.36,1);
}

.rfg-modal-score-value {
  font-size: 1.5rem;
  font-weight: 900;
}

.rfg-modal-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rfg-modal-meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.82rem;
  color: rgba(245,240,235,0.45);
  padding: 0.5rem 0.75rem;
  background: rgba(255,255,255,0.02);
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.04);
}

.rfg-modal-meta-item svg {
  color: #A3B18A;
  flex-shrink: 0;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .rfg-title { font-size: 1.5rem; }
  .rfg-grid { grid-template-columns: 1fr; }
  .rfg-kpi-row { gap: 0.75rem; }
  .rfg-kpi { min-width: 80px; padding: 0.6rem 1rem; }
  .rfg-kpi-value { font-size: 1.2rem; }
  .rfg-tabs { gap: 0.35rem; }
  .rfg-tab { padding: 0.5rem 0.85rem; font-size: 0.78rem; }
  .rfg-modal { padding: 1.5rem; }
}
`;
