"""
main.py — محرك الذكاء الاصطناعي لنظام "راصد بلس"
FastAPI backend مع 3 endpoints رئيسية:
  1. POST /api/v1/students/risk-analysis   → تحليل مؤشر الخطورة
  2. POST /api/v1/students/match           → التوأمة الأكاديمية
  3. POST /api/v1/advisors/generate-intervention → مولد خطة التدخل

للتشغيل:
  pip install fastapi uvicorn pydantic
  uvicorn main:app --reload
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
import math
import logging

# ─── إعداد التسجيل (Logging) ──────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("rassed-plus")

# ─── إعداد التطبيق ────────────────────────────────────────────────────────────
app = FastAPI(
    title="Rassed Plus API",
    description="نظام راصد بلس — محرك الذكاء الاصطناعي الأكاديمي الاستباقي",
    version="1.0.0",
)

# CORS — السماح لواجهة React بالاتصال من localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Mock Data — قاعدة البيانات الوهمية ────────────────────────────────────────
# تمثل 10 طلاب بملفات أكاديمية واقعية وتفصيلية
MOCK_STUDENTS_DB = [
    {
        "id": "44120345",
        "name": "أحمد محمود",
        "major": "علوم الحاسب",
        "year": 3,
        "gpa": 2.1,
        "attendance_rate": 58.0,
        "avg_task_completion_time_ratio": 2.8,   # نسبة الوقت الفعلي ÷ الوقت المتوقع
        "task_completion_rate": 45.0,             # % المهام المكتملة
        "late_login_count_week": 6,               # عدد مرات الدخول بعد منتصف الليل
        "incomplete_lectures_pct": 65.0,          # % المحاضرات غير المكتملة
        "strong_skills": ["خوارزميات", "رياضيات"],
        "weak_skills": ["قواعد بيانات", "شبكات"],
    },
    {
        "id": "44210988",
        "name": "سارة خالد",
        "major": "علوم الحاسب",
        "year": 2,
        "gpa": 3.4,
        "attendance_rate": 82.0,
        "avg_task_completion_time_ratio": 2.1,
        "task_completion_rate": 72.0,
        "late_login_count_week": 3,
        "incomplete_lectures_pct": 40.0,
        "strong_skills": ["رياضيات", "إحصاء"],
        "weak_skills": ["برمجة متقدمة", "هياكل بيانات"],
    },
    {
        "id": "43990122",
        "name": "فهد عبدالله",
        "major": "هندسة البرمجيات",
        "year": 4,
        "gpa": 4.8,
        "attendance_rate": 97.0,
        "avg_task_completion_time_ratio": 0.9,
        "task_completion_rate": 98.0,
        "late_login_count_week": 0,
        "incomplete_lectures_pct": 2.0,
        "strong_skills": ["برمجة متقدمة", "هياكل بيانات", "خوارزميات"],
        "weak_skills": [],
    },
    {
        "id": "44112340",
        "name": "نورة سعد",
        "major": "علوم الحاسب",
        "year": 2,
        "gpa": 2.5,
        "attendance_rate": 70.0,
        "avg_task_completion_time_ratio": 1.9,
        "task_completion_rate": 60.0,
        "late_login_count_week": 7,
        "incomplete_lectures_pct": 50.0,
        "strong_skills": ["تصميم واجهات"],
        "weak_skills": ["خوارزميات", "شبكات"],
    },
    {
        "id": "44315200",
        "name": "عمر الشمري",
        "major": "نظم المعلومات",
        "year": 3,
        "gpa": 3.8,
        "attendance_rate": 90.0,
        "avg_task_completion_time_ratio": 1.1,
        "task_completion_rate": 91.0,
        "late_login_count_week": 1,
        "incomplete_lectures_pct": 10.0,
        "strong_skills": ["قواعد بيانات", "شبكات", "إحصاء"],
        "weak_skills": ["رياضيات"],
    },
]

# ─── Pydantic Models ──────────────────────────────────────────────────────────

class RiskAnalysisRequest(BaseModel):
    """بيانات الطالب المستخدمة في تحليل مؤشر الخطورة"""
    student_id: str = Field(..., description="رقم الطالب الجامعي")
    gpa: float = Field(..., ge=0.0, le=5.0, description="المعدل التراكمي الحالي")
    attendance_rate: float = Field(..., ge=0.0, le=100.0, description="نسبة الحضور %")
    avg_task_completion_time_ratio: float = Field(
        ..., ge=0.0,
        description="نسبة الوقت الفعلي لإكمال المهام مقارنةً بالمتوقع (1.0 = طبيعي)"
    )
    task_completion_rate: float = Field(..., ge=0.0, le=100.0, description="% المهام المكتملة")
    late_login_count_week: int = Field(..., ge=0, description="عدد الدخولات بعد منتصف الليل هذا الأسبوع")
    incomplete_lectures_pct: float = Field(..., ge=0.0, le=100.0, description="% المحاضرات غير المكتملة")

class RiskAnalysisResponse(BaseModel):
    student_id: str
    risk_level: Literal["green", "yellow", "red"]
    risk_score: float             # 0.0 – 100.0 (كلما كان أعلى، الخطورة أكبر)
    primary_reason: str           # السبب المخفي الرئيسي
    secondary_reasons: list[str]
    recommendations: list[str]
    analyzed_at: str

class MatchRequest(BaseModel):
    """طلب التوأمة: رقم الطالب ونقطة ضعفه"""
    student_id: str = Field(..., description="رقم الطالب الذي يبحث عن توأم")
    weak_skill: str = Field(..., description="المهارة التي يواجه فيها تحدياً")

class MatchResponse(BaseModel):
    matched_student_id: str
    matched_student_name: str
    matched_student_strong_skill: str   # المهارة التي يتقنها الطالب المقترح
    requester_strong_skill: str         # ما يقدمه الطالب الأول في المقابل
    mutual_benefit_explanation: str
    virtual_room_link: str              # رابط وهمي لغرفة الدراسة

class InterventionRequest(BaseModel):
    """طلب توليد خطة تدخل للمرشد"""
    student_id: str
    student_name: str
    risk_level: Literal["yellow", "red"]
    primary_reason: str
    advisor_name: Optional[str] = "المرشد الأكاديمي"

class InterventionResponse(BaseModel):
    email_subject: str
    email_body: str               # رسالة البريد الإلكتروني الجاهزة
    action_plan: list[dict]       # خطوات علاجية مرتبة بأولوية
    follow_up_date: str           # موعد المتابعة المقترح
    generated_at: str

# ─── Helper Functions ──────────────────────────────────────────────────────────

def calculate_risk_score(data: RiskAnalysisRequest) -> tuple[float, list[str]]:
    """
    خوارزمية حساب مؤشر الخطورة بنظام الأوزان المرجّحة (Weighted Scoring).
    
    كل عامل له وزن يعكس أهميته في التنبؤ بالتعثر الأكاديمي،
    مستوحى من أبحاث Early Alert Systems في الجامعات الأمريكية.
    
    المخرجات: (score: 0–100, activated_risk_factors: list)
    """
    factors = []
    score = 0.0

    # الوزن 1: GPA (25%)
    # GPA < 2.0 خطر حقيقي، 2.0–2.5 تحذير، > 2.5 آمن
    gpa_score = max(0, (2.5 - data.gpa) / 2.5) * 25
    score += gpa_score
    if data.gpa < 2.0:
        factors.append("معدل تراكمي حرج دون 2.0")
    elif data.gpa < 2.5:
        factors.append("معدل تراكمي منخفض دون 2.5")

    # الوزن 2: الحضور (20%)
    attendance_score = max(0, (80 - data.attendance_rate) / 80) * 20
    score += attendance_score
    if data.attendance_rate < 60:
        factors.append("غياب مفرط يتجاوز 40%")
    elif data.attendance_rate < 80:
        factors.append("نسبة حضور دون المتوقع")

    # الوزن 3: وقت الإنجاز (15%)
    # نسبة > 1.5 تدل على معاناة حقيقية في الفهم
    time_score = min(15, max(0, (data.avg_task_completion_time_ratio - 1.5) / 1.5) * 15)
    score += time_score
    if data.avg_task_completion_time_ratio > 2.0:
        factors.append("يستغرق أكثر من ضعف الوقت المتوقع في المهام (مؤشر صامت على المعاناة)")

    # الوزن 4: إكمال المهام (25%)
    task_score = max(0, (70 - data.task_completion_rate) / 70) * 25
    score += task_score
    if data.task_completion_rate < 50:
        factors.append("أقل من نصف المهام مكتملة")
    elif data.task_completion_rate < 70:
        factors.append("معدل إكمال المهام منخفض")

    # الوزن 5: أوقات الدخول المتأخرة (10%)
    # الدخول في أوقات متأخرة متكرراً مؤشر على اضطراب القلق أو الأرق
    late_score = min(10, data.late_login_count_week * 1.5)
    score += late_score
    if data.late_login_count_week >= 5:
        factors.append("نمط دخول منتصف الليل المتكرر (مؤشر قلق أو اضطراب نوم)")

    # الوزن 6: المحاضرات غير المكتملة (5%)
    lecture_score = min(5, (data.incomplete_lectures_pct / 100) * 5)
    score += lecture_score
    if data.incomplete_lectures_pct > 50:
        factors.append("أكثر من نصف المحاضرات المسجلة لم تكتمل")

    return round(score, 2), factors


def determine_primary_cause(score: float, factors: list[str]) -> str:
    """
    يستنتج السبب الجذري المخفي (Root Cause) بناءً على نمط العوامل المفعّلة.
    هذا يميز راصد بلس عن الأنظمة التقليدية التي تكتفي بالنتيجة.
    """
    if "نمط دخول منتصف الليل" in " ".join(factors) and score > 50:
        return "قلق أكاديمي مزمن واضطراب إدارة الوقت"
    if "غياب مفرط" in " ".join(factors):
        return "انفصال عاطفي عن البيئة الأكاديمية"
    if "يستغرق أكثر من ضعف الوقت" in " ".join(factors):
        return "فجوة في المفاهيم الأساسية تُعيق الفهم"
    if "أقل من نصف المهام مكتملة" in " ".join(factors):
        return "سوء إدارة المهام والأولويات"
    if score > 60:
        return "تراكم متعدد المصادر يستدعي تدخلاً شاملاً"
    return "ضغط أكاديمي قابل للمعالجة بتوجيه مبكر"

# ─── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def root():
    """نقطة الصحة (Health Check) للتحقق من تشغيل الخادم"""
    return {"status": "running", "system": "راصد بلس API v1.0", "timestamp": datetime.now().isoformat()}


@app.post(
    "/api/v1/students/risk-analysis",
    response_model=RiskAnalysisResponse,
    tags=["تحليل الطلاب"],
    summary="تحليل مؤشر خطورة الطالب"
)
def analyze_student_risk(data: RiskAnalysisRequest) -> RiskAnalysisResponse:
    """
    يحلل بيانات الطالب الأكاديمية والسلوكية ويُرجع:
    - مؤشر الخطورة (أحمر/أصفر/أخضر)
    - درجة الخطورة الرقمية (0–100)
    - السبب الجذري المخفي
    - توصيات استباقية
    """
    logger.info(f"تحليل الطالب: {data.student_id}")

    score, factors = calculate_risk_score(data)
    primary_reason = determine_primary_cause(score, factors)

    # تصنيف مستوى الخطورة
    if score >= 55:
        risk_level = "red"
        recs = [
            "جدولة لقاء عاجل مع المرشد الأكاديمي خلال 48 ساعة",
            "إحالة إلى وحدة الدعم النفسي إذا تأكدت مؤشرات القلق",
            "وضع خطة تعافٍ أسبوعية مع أهداف قابلة للقياس",
        ]
    elif score >= 30:
        risk_level = "yellow"
        recs = [
            "مراقبة أسبوعية ومتابعة منتظمة من المرشد",
            "اقتراح برامج إدارة الوقت وتقنيات المذاكرة الفعّالة",
            "تفعيل نظام التوأمة الأكاديمية مع زميل متفوق",
        ]
    else:
        risk_level = "green"
        recs = [
            "استمر في مسارك الممتاز",
            "فكّر في برامج الطلاب المتميزين ومسارات التطوير المهني",
        ]

    logger.info(f"نتيجة الطالب {data.student_id}: {risk_level} ({score})")

    return RiskAnalysisResponse(
        student_id=data.student_id,
        risk_level=risk_level,
        risk_score=score,
        primary_reason=primary_reason,
        secondary_reasons=factors,
        recommendations=recs,
        analyzed_at=datetime.now().isoformat(),
    )


@app.post(
    "/api/v1/students/match",
    response_model=MatchResponse,
    tags=["التوأمة الأكاديمية"],
    summary="اقتراح توأم أكاديمي للطالب"
)
def match_student(data: MatchRequest) -> MatchResponse:
    """
    يبحث في قاعدة البيانات عن طالب:
      - متفوق في النقطة الضعيفة للطالب الأول
      - ضعيف في نقطة يتقنها الطالب الأول
    يضمن علاقة تبادل منفعة حقيقية (Mutual Benefit).
    """
    logger.info(f"بحث توأمة: {data.student_id} يحتاج مساعدة في '{data.weak_skill}'")

    # إيجاد الطالب الطالب
    requester = next((s for s in MOCK_STUDENTS_DB if s["id"] == data.student_id), None)
    if not requester:
        raise HTTPException(status_code=404, detail=f"الطالب {data.student_id} غير موجود في النظام")

    # البحث عن الطالب المناسب للتوأمة:
    # يجب أن يكون متفوقاً في المهارة الضعيفة للطالب الأول
    # ويجب أن يكون الطالب الأول متفوقاً في شيء يحتاجه المرشح
    best_match = None
    for candidate in MOCK_STUDENTS_DB:
        if candidate["id"] == data.student_id:
            continue  # لا نطابق الطالب مع نفسه

        candidate_is_strong = any(
            data.weak_skill.lower() in skill.lower()
            for skill in candidate["strong_skills"]
        )
        # التحقق من وجود منفعة عكسية
        mutual_benefit = any(
            req_skill.lower() in (candidate.get("weak_skills") or [""])
            for req_skill in requester.get("strong_skills", [])
        )

        if candidate_is_strong and mutual_benefit:
            best_match = candidate
            break

    # fallback: إذا لم يوجد توافق مثالي، نأخذ أفضل مرشح متوفر
    if not best_match:
        for candidate in MOCK_STUDENTS_DB:
            if candidate["id"] != data.student_id:
                candidate_is_strong = any(
                    data.weak_skill.lower() in skill.lower()
                    for skill in candidate["strong_skills"]
                )
                if candidate_is_strong:
                    best_match = candidate
                    break

    if not best_match:
        raise HTTPException(
            status_code=404,
            detail=f"لم يتم العثور على توأم مناسب لمهارة '{data.weak_skill}' في الوقت الحالي"
        )

    # المهارة التي يقدمها الطالب الأول في المقابل
    requester_offers = requester["strong_skills"][0] if requester["strong_skills"] else "مجال آخر"

    explanation = (
        f"أنت متفوق في '{requester_offers}' وهو ما يحتاجه {best_match['name']}، "
        f"في المقابل {best_match['name']} متفوق في '{data.weak_skill}' "
        f"وهو ما تحتاجه أنت. هذا توافق أكاديمي مثالي للتعلم التبادلي."
    )

    logger.info(f"تم التوأمة: {data.student_id} ↔ {best_match['id']}")

    return MatchResponse(
        matched_student_id=best_match["id"],
        matched_student_name=best_match["name"],
        matched_student_strong_skill=data.weak_skill,
        requester_strong_skill=requester_offers,
        mutual_benefit_explanation=explanation,
        # رابط وهمي — في الإنتاج يُولَّد رابط Zoom أو Teams ديناميكياً
        virtual_room_link=f"https://rassed-plus.edu/rooms/study/{data.student_id}-{best_match['id']}",
    )


@app.post(
    "/api/v1/advisors/generate-intervention",
    response_model=InterventionResponse,
    tags=["المرشد الأكاديمي"],
    summary="توليد خطة تدخل جاهزة بنقرة واحدة"
)
def generate_intervention(data: InterventionRequest) -> InterventionResponse:
    """
    يولد تلقائياً:
      - مسودة بريد إلكتروني داعم وإنساني (ليس عقابياً)
      - خطة علاجية مرحلية مخصصة للحالة
      - تاريخ متابعة مقترح
    
    القاعدة في صياغة الرسائل: الطالب "يُدعم" لا "يُراقَب".
    """
    logger.info(f"توليد خطة تدخل: {data.student_id} | السبب: {data.primary_reason}")

    urgency_label = "عاجلة جداً" if data.risk_level == "red" else "استباقية"

    email_subject = f"📚 رسالة دعم أكاديمي {urgency_label} — {data.student_name}"

    email_body = f"""السلام عليكم ورحمة الله، {data.student_name}

أتواصل معك {data.advisor_name} بشكل شخصي، ليس لأنك أخطأت، بل لأن النظام الذكي لاحظ بعض الإشارات التي قد تؤثر على مسيرتك الأكاديمية، وأريد أن أكون بجانبك قبل أن تستفحل.

📊 ما لاحظناه:
{data.primary_reason}

نحن هنا لمساعدتك، وهذه الرسالة هي بداية الحل، وليست تقريباً.

ما الذي تحتاجه؟ أخبرني، دعنا نخطط معاً.

مع تحياتي الصادقة،
{data.advisor_name}
نظام راصد بلس — الإرشاد الأكاديمي الذكي"""

    # خطة علاجية مرحلية مخصصة حسب السبب
    action_plan = _build_action_plan(data.risk_level, data.primary_reason)

    # موعد المتابعة: 3 أيام للأحمر، 7 أيام للأصفر
    from datetime import timedelta
    days_offset = 3 if data.risk_level == "red" else 7
    follow_up = (datetime.now() + timedelta(days=days_offset)).strftime("%Y-%m-%d")

    logger.info(f"خطة التدخل جاهزة: موعد المتابعة {follow_up}")

    return InterventionResponse(
        email_subject=email_subject,
        email_body=email_body,
        action_plan=action_plan,
        follow_up_date=follow_up,
        generated_at=datetime.now().isoformat(),
    )


def _build_action_plan(risk_level: str, primary_reason: str) -> list[dict]:
    """
    يبني خطة علاجية مرنة بناءً على مستوى الخطورة والسبب الجذري.
    كل خطوة لها أولوية ومسؤول ومدة زمنية.
    """
    base_plan = [
        {
            "priority": 1,
            "action": "مقابلة شخصية مع المرشد الأكاديمي",
            "responsible": "المرشد",
            "timeline": "خلال 48 ساعة" if risk_level == "red" else "خلال أسبوع",
            "goal": "فهم السياق الكامل للوضع وتقديم دعم نفسي أولي",
        },
        {
            "priority": 2,
            "action": "تحليل جدول الطالب الأسبوعي وإعادة هيكلته",
            "responsible": "المرشد + الطالب معاً",
            "timeline": "خلال 3 أيام من اللقاء",
            "goal": "توزيع الأعباء بشكل واقعي وتحقيق التوازن",
        },
    ]

    # خطط متخصصة بحسب السبب الجذري
    if "قلق" in primary_reason:
        base_plan.append({
            "priority": 3,
            "action": "إحالة إلى وحدة الإرشاد النفسي الجامعي",
            "responsible": "المرشد",
            "timeline": "خلال أسبوع",
            "goal": "معالجة قلق الامتحانات وتقنيات الاسترخاء",
        })
    elif "مهام" in primary_reason or "إدارة" in primary_reason:
        base_plan.append({
            "priority": 3,
            "action": "ورشة عمل: تقنيات إدارة المهام (Pomodoro وGTD)",
            "responsible": "وحدة الدعم الأكاديمي",
            "timeline": "خلال أسبوعين",
            "goal": "بناء عادات دراسية منتجة ومستدامة",
        })
    elif "غياب" in primary_reason:
        base_plan.append({
            "priority": 3,
            "action": "التواصل مع الأسرة للاطمئنان على الوضع خارج الجامعة",
            "responsible": "المرشد (بإذن الطالب)",
            "timeline": "خلال 3 أيام",
            "goal": "الكشف عن أسباب خارجية قد تؤثر على الحضور",
        })

    base_plan.append({
        "priority": len(base_plan) + 1,
        "action": "جلسة متابعة لتقييم التحسن",
        "responsible": "المرشد",
        "timeline": "بعد 3 أسابيع",
        "goal": "التحقق من فاعلية الخطة وتعديلها إن لزم",
    })

    return base_plan


# ─── تشغيل الخادم مباشرة (للتطوير) ──────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
