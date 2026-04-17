import json
<<<<<<< HEAD
import os
import uuid
from datetime import datetime, timedelta
from typing import Any, Literal, Optional

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

=======
from datetime import datetime, timedelta
from typing import Any, Literal, Optional

>>>>>>> origin/main
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from database import get_db, init_db, now_iso

init_db()

<<<<<<< HEAD
# ═══════════════════════════════════════════════════════════════════════════════
#  DeepSeek AI Client
# ═══════════════════════════════════════════════════════════════════════════════

ai_client = OpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY"),
    base_url=os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com"),
)

AI_MODEL = "deepseek-chat"

# ═══════════════════════════════════════════════════════════════════════════════
#  System Prompts العملاقة
# ═══════════════════════════════════════════════════════════════════════════════

STUDENT_SYSTEM_PROMPT = """أنت "مُرشد راصد" — المرشد الأكاديمي الذكي في منصة "راصد بلس" الجامعية.

🎯 هويتك:
- أنت مستشار أكاديمي خبير يجمع بين الذكاء الاصطناعي والحس الإنساني.
- تتحدث بالعربية الفصحى السلسة مع لمسة ودية.
- تنادي الطالب باسمه الأول دائماً.
- تستخدم الإيموجي باعتدال لتقريب الرسائل.

📊 بيانات الطالب المتاحة لك (استخدمها في كل إجابة):
{student_context}

🧠 قواعدك الذهبية:
1. **الدقة الرقمية**: لا تعطِ نصيحة عامة أبداً. استخدم الأرقام الحقيقية من بيانات الطالب.
   - مثال: "معدلك حالياً 1.3 من 5. لرفعه إلى 2.0 تحتاج أن تحقق معدل فصلي لا يقل عن 3.2 في الساعات المتبقية."
2. **اكتشاف الإيجابيات أولاً**: ابدأ دائماً بنقطة إيجابية حقيقية من بياناته قبل أي نقد.
3. **التحفيز الذكي**: استخدم أسلوب "التحدي الإيجابي" بدل التخويف.
4. **خطط عملية**: كل نصيحة يجب أن تكون خطوات ملموسة مع جدول زمني.
5. **الإنذار اللطيف**: إذا رأيت خطراً (غياب عالي، معدل منخفض):
   - لا تُخيف الطالب
   - قدم المشكلة كـ "فرصة للتحسين"
   - اعرض الحل مباشرة بعد التنبيه
6. **الوعي بالسياق**: إذا سأل "كيف أرفع معدلي؟":
   - احسب الساعات المتبقية بناءً على سنته الدراسية
   - اقترح المعدل الفصلي المطلوب
   - حدد المواد الأسهل للتحسين فيها بناءً على مهاراته القوية
7. **الصحة النفسية**: إذا لاحظت إشارات قلق (دخول متأخر متكرر، غياب مفرط):
   - اسأل بلطف عن حاله
   - اقترح موارد الدعم الجامعية
   - لا تكن طبيباً نفسياً — كن صديقاً مهتماً

📋 تنسيق الإجابات:
- استخدم العناوين والنقاط المرقمة
- ضع الأرقام المهمة بين **نجمتين** للتأكيد
- لا تطل — اجعل الرد مركزاً ومفيداً (150-300 كلمة)
- اختم بسؤال تفاعلي يشجع الطالب على الاستمرار في المحادثة

⚠️ حدودك:
- لا تخترع درجات أو بيانات غير موجودة
- لا تعد بنتائج مضمونة
- إذا سُئلت عن شيء خارج نطاقك، وجّه الطالب للجهة المناسبة
- لا تجب على أسئلة غير أكاديمية (سياسة، ترفيه، إلخ) — أعد توجيه المحادثة بلطف"""

ADVISOR_SYSTEM_PROMPT = """أنت "مُرشد راصد للمشرفين" — المساعد الذكي للمشرفين الأكاديميين في منصة "راصد بلس".

🎯 هويتك:
- أنت محلل بيانات أكاديمي خبير يساعد المشرفين في اتخاذ القرارات.
- تتحدث بلغة مهنية واضحة مع المشرف.
- تقدم تحليلات مبنية على البيانات الحقيقية.

📊 بيانات الطلاب المتاحة لك:
{advisor_context}

🧠 قواعدك:
1. **التحليل العميق**: قدم رؤى لا يمكن رؤيتها بالعين المجردة من البيانات.
2. **الأولويات**: رتب الحالات حسب الخطورة وعجلة التدخل.
3. **التوصيات العملية**: لكل مشكلة قدم حل واضح مع خطوات.
4. **الشمولية**: عند السؤال عن طالب، قدم ملخصاً شاملاً يشمل:
   - المؤشرات الرقمية
   - التحليل السلوكي
   - التوصيات
   - أولوية التدخل
5. **ملخص المحادثات**: إذا سُئلت عن "نفسية" طالب، ارجع لمحادثاته مع البوت.
6. **الإنذارات**: نبه المشرف على:
   - طلاب بمعدل أقل من 2.0
   - طلاب غيابهم أكثر من 20%
   - طلاب لا يكملون مهامهم
   - أنماط سلبية متكررة

📋 التنسيق:
- جداول للمقارنات
- نقاط مرقمة للتوصيات
- 🔴 🟡 🟢 لتصنيف الخطورة
- اختصر قدر الإمكان مع الحفاظ على الدقة"""

SILENT_ANALYSIS_PROMPT = """أنت محلل صامت في منصة "راصد بلس". مهمتك تحليل بيانات الطالب وتوليد إنذارات استباقية ذكية.

📊 بيانات الطالب:
{student_context}

🎯 مهمتك:
1. حلل البيانات وحدد أي إنذارات مطلوبة.
2. لكل إنذار، اكتب رسالة شخصية ودية موجهة للطالب باسمه.
3. حدد نوع الإنذار: danger (خطر), warning (تحذير), info (معلومة إيجابية).

📋 أُرجع JSON فقط بهذا الشكل (بدون أي نص إضافي):
{
  "alerts": [
    {
      "type": "danger|warning|info",
      "title": "عنوان قصير",
      "message": "رسالة شخصية للطالب",
      "metric": "المؤشر المتأثر",
      "value": "القيمة الحالية",
      "suggestion": "اقتراح تحسين محدد"
    }
  ],
  "overall_mood": "positive|neutral|concerned",
  "priority_action": "أهم إجراء يجب اتخاذه الآن"
}

⚠️ قواعد:
- إذا كان الطالب ممتاز (معدل > 4, حضور > 90%)، أعطه رسالة تحفيزية إيجابية فقط.
- إذا كان متوسط، أعطه 1-2 تحذيرات لطيفة مع تشجيع.
- إذا كان في خطر، أعطه 2-3 إنذارات مع حلول فورية.
- الرسائل يجب أن تكون بالعربية وشخصية (استخدم اسمه)."""

ADVISOR_BRIEF_PROMPT = """أنت محلل محادثات في منصة "راصد بلس". مهمتك قراءة محادثات الطالب مع المرشد الذكي وتوليد ملخص للمشرف الأكاديمي.

📊 بيانات الطالب:
{student_context}

💬 محادثات الطالب مع المرشد الذكي:
{chat_history}

🎯 مهمتك:
أُرجع JSON فقط بهذا الشكل:
{
  "emotional_state": "وصف قصير للحالة النفسية للطالب",
  "main_concerns": ["قلق 1", "قلق 2"],
  "topics_discussed": [
    {"topic": "الموضوع", "frequency": عدد المرات, "sentiment": "positive|negative|neutral"}
  ],
  "risk_indicators": ["مؤشر خطر 1", "مؤشر خطر 2"],
  "recommended_actions": ["إجراء 1", "إجراء 2"],
  "conversation_summary": "ملخص شامل في 2-3 جمل",
  "urgency": "high|medium|low"
}

⚠️ قواعد:
- كن موضوعياً ودقيقاً
- لا تبالغ في القلق
- ركز على الأنماط المتكررة
- إذا لم تكن هناك محادثات، أجب بناءً على البيانات الأكاديمية فقط"""


# ═══════════════════════════════════════════════════════════════════════════════
#  FastAPI App
# ═══════════════════════════════════════════════════════════════════════════════

=======
>>>>>>> origin/main
app = FastAPI(
    title="Rassed Plus API",
    version="2.0.0",
    description="Backend production-like API for Rassed Plus",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


def parse_json_list(value: str) -> list[str]:
    try:
        parsed = json.loads(value or "[]")
        return parsed if isinstance(parsed, list) else []
    except json.JSONDecodeError:
        return []


def risk_analyze(student: dict[str, Any]) -> dict[str, Any]:
    factors: list[str] = []
    score = 0.0

    gpa_score = max(0, (2.5 - student["gpa"]) / 2.5) * 25
    score += gpa_score
    if student["gpa"] < 2.0:
        factors.append("معدل تراكمي حرج دون 2.0")
    elif student["gpa"] < 2.5:
        factors.append("معدل تراكمي منخفض دون 2.5")

    attendance_score = max(0, (80 - student["attendance"]) / 80) * 20
    score += attendance_score
    if student["attendance"] < 60:
        factors.append("غياب مفرط يتجاوز 40%")
    elif student["attendance"] < 80:
        factors.append("نسبة حضور دون المتوقع")

    time_score = min(15, max(0, (student["task_time_ratio"] - 1.5) / 1.5) * 15)
    score += time_score
    if student["task_time_ratio"] > 2.0:
        factors.append("يستغرق أكثر من ضعف الوقت المتوقع في المهام")

    task_score = max(0, (70 - student["task_completion"]) / 70) * 25
    score += task_score
    if student["task_completion"] < 50:
        factors.append("أقل من نصف المهام مكتملة")
    elif student["task_completion"] < 70:
        factors.append("معدل إكمال المهام منخفض")

    late_score = min(10, student["late_logins"] * 1.5)
    score += late_score
    if student["late_logins"] >= 5:
        factors.append("نمط دخول متأخر متكرر (مؤشر قلق أو اضطراب نوم)")

    lecture_score = min(5, (student["incomplete_lectures"] / 100) * 5)
    score += lecture_score
    if student["incomplete_lectures"] > 50:
        factors.append("أكثر من نصف المحاضرات لم تكتمل")

    score = round(score, 2)

    if score >= 55:
        risk_level = "red"
        risk_label = "خطر — تدخل فوري"
    elif score >= 30:
        risk_level = "yellow"
        risk_label = "تحذير — يحتاج مراقبة"
    else:
        risk_level = "green"
        risk_label = "مسار سليم"

    combined = " ".join(factors)
    if "متأخر" in combined and score > 50:
        primary_reason = "قلق أكاديمي مزمن واضطراب إدارة الوقت"
    elif "غياب مفرط" in combined:
        primary_reason = "انفصال عاطفي عن البيئة الأكاديمية"
    elif "ضعف الوقت" in combined:
        primary_reason = "فجوة في المفاهيم الأساسية تعيق الفهم"
    elif "نصف المهام" in combined:
        primary_reason = "سوء إدارة المهام والأولويات"
    elif score > 60:
        primary_reason = "تراكم متعدد المصادر يستدعي تدخلاً شاملاً"
    else:
        primary_reason = "ضغط أكاديمي قابل للمعالجة بتوجيه مبكر"

    return {
        **student,
        "riskLevel": risk_level,
        "riskLabel": risk_label,
        "riskScore": score,
        "primaryReason": primary_reason,
        "factors": factors,
    }


<<<<<<< HEAD
# ═══════════════════════════════════════════════════════════════════════════════
#  Helper: Build student context string for AI prompts
# ═══════════════════════════════════════════════════════════════════════════════

def build_student_context(student_row) -> str:
    """Build a rich context string from a student DB row for AI prompts."""
    s = dict(student_row)
    strong = parse_json_list(s.get("strong_skills", "[]"))
    weak = parse_json_list(s.get("weak_skills", "[]"))
    risk = risk_analyze({
        "id": s["id"], "name": s["name"], "major": s["major"], "year": s["year"],
        "gpa": s["gpa"], "attendance": s["attendance"],
        "task_time_ratio": s["task_time_ratio"], "task_completion": s["task_completion"],
        "late_logins": s["late_logins"], "incomplete_lectures": s["incomplete_lectures"],
    })
    return (
        f"الاسم: {s['name']}\n"
        f"الرقم الجامعي: {s['id']}\n"
        f"الجنس: {'ذكر' if s.get('gender', 'male') == 'male' else 'أنثى'}\n"
        f"التخصص: {s['major']}\n"
        f"السنة الدراسية: {s['year']}\n"
        f"المعدل التراكمي: {s['gpa']} / 5.0\n"
        f"نسبة الحضور: {s['attendance']}%\n"
        f"نسبة إكمال المهام: {s['task_completion']}%\n"
        f"نسبة الوقت المستغرق مقارنة بالمتوقع: {s['task_time_ratio']}x\n"
        f"عدد مرات الدخول المتأخر: {s['late_logins']}\n"
        f"نسبة المحاضرات غير المكتملة: {s['incomplete_lectures']}%\n"
        f"المهارات القوية: {', '.join(strong) if strong else 'غير محددة'}\n"
        f"المهارات الضعيفة: {', '.join(weak) if weak else 'غير محددة'}\n"
        f"مستوى الخطورة: {risk['riskLabel']} ({risk['riskScore']}%)\n"
        f"السبب الرئيسي: {risk['primaryReason']}\n"
        f"عوامل الخطر: {', '.join(risk['factors']) if risk['factors'] else 'لا توجد'}"
    )


def call_ai(system_prompt: str, user_message: str, temperature: float = 0.7) -> str:
    """Call DeepSeek AI and return the response text."""
    response = ai_client.chat.completions.create(
        model=AI_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        temperature=temperature,
        max_tokens=2000,
    )
    return response.choices[0].message.content


def call_ai_with_history(system_prompt: str, messages: list[dict], temperature: float = 0.7) -> str:
    """Call DeepSeek AI with full conversation history."""
    all_messages = [{"role": "system", "content": system_prompt}] + messages
    response = ai_client.chat.completions.create(
        model=AI_MODEL,
        messages=all_messages,
        temperature=temperature,
        max_tokens=2000,
    )
    return response.choices[0].message.content


# ═══════════════════════════════════════════════════════════════════════════════
#  Pydantic Models
# ═══════════════════════════════════════════════════════════════════════════════

=======
>>>>>>> origin/main
class LoginRequest(BaseModel):
    role: Literal["student", "advisor"]
    identifier: str
    password: str


class StudentIn(BaseModel):
    id: str
    advisor_id: Optional[str] = None
    name: str
    gender: Literal["male", "female"] = "male"
    email: str
    password: str
    major: str
    year: int = Field(ge=1, le=10)
    gpa: float = Field(ge=0, le=5)
    attendance: float = Field(ge=0, le=100)
    task_time_ratio: float = Field(ge=0)
    task_completion: float = Field(ge=0, le=100)
    late_logins: int = Field(ge=0)
    incomplete_lectures: float = Field(ge=0, le=100)
    strong_skills: list[str] = Field(default_factory=list)
    weak_skills: list[str] = Field(default_factory=list)


class AdvisorIn(BaseModel):
    id: str
    name: str
    email: str
    password: str
    title: str
    department: str


class CourseIn(BaseModel):
    advisor_id: Optional[str] = None
    code: str
    name: str
    instructor: str
    fail_rate: float = Field(ge=0, le=100)
    avg_grade: str
    enroll_count: int = Field(ge=0)
    severity: Literal["red", "yellow", "green"]


class AILogIn(BaseModel):
    actor_role: str
    actor_id: str
    action_type: str
    entity_type: str
    entity_id: Optional[str] = None
    prompt: Optional[str] = None
    response: Optional[str] = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class InterventionRequest(BaseModel):
    student_id: str
    advisor_id: str


class MatchRequest(BaseModel):
    requester_id: str
    weak_skill: str


class FeatureToggleRequest(BaseModel):
    enabled: bool


<<<<<<< HEAD
class ChatMessageRequest(BaseModel):
    student_id: str
    message: str
    session_id: Optional[str] = None


class AdvisorChatRequest(BaseModel):
    advisor_id: str
    message: str
    student_id: Optional[str] = None


class AnalyzedStudentProfileIn(BaseModel):
    student_id: str
    current_gpa: float
    recent_grades: list[str]
    missed_assignments: int
    login_frequency: str
    weak_skills: list[str] = Field(default_factory=list)
    strong_skills: list[str] = Field(default_factory=list)


# ═══════════════════════════════════════════════════════════════════════════════
#  Core API Endpoints (existing)
# ═══════════════════════════════════════════════════════════════════════════════

=======
>>>>>>> origin/main
@app.get("/")
def root():
    return {"status": "ok", "service": "Rassed Plus API", "timestamp": now_iso()}


@app.get("/api/demo-accounts")
def demo_accounts():
    with get_db() as conn:
        students = conn.execute("SELECT id, name, email, password FROM students ORDER BY id LIMIT 3").fetchall()
        advisors = conn.execute("SELECT id, name, email, password FROM advisors ORDER BY id LIMIT 2").fetchall()

    data = [
        {
            "role": "student",
            "name": row["name"],
            "login": row["email"],
            "altLogin": row["id"],
            "password": row["password"],
        }
        for row in students
    ] + [
        {
            "role": "advisor",
            "name": row["name"],
            "login": row["email"],
            "altLogin": row["id"],
            "password": row["password"],
        }
        for row in advisors
    ]
    return data


@app.post("/api/auth/login")
def login(payload: LoginRequest):
    with get_db() as conn:
        table = "students" if payload.role == "student" else "advisors"
        row = conn.execute(
            f"SELECT * FROM {table} WHERE (LOWER(email)=LOWER(?) OR LOWER(id)=LOWER(?)) AND password=?",
            (payload.identifier.strip(), payload.identifier.strip(), payload.password),
        ).fetchone()

    if not row:
        raise HTTPException(status_code=401, detail="بيانات الدخول غير صحيحة")

    user = dict(row)
    user.pop("password", None)
    user["role"] = payload.role
    if payload.role == "student":
        user["strong_skills"] = parse_json_list(user["strong_skills"])
        user["weak_skills"] = parse_json_list(user["weak_skills"])
    return {"ok": True, "user": user}


@app.get("/api/students")
def list_students():
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM students ORDER BY id").fetchall()
    students = []
    for row in rows:
        item = dict(row)
        item["strong_skills"] = parse_json_list(item["strong_skills"])
        item["weak_skills"] = parse_json_list(item["weak_skills"])
        students.append(item)
    return students


@app.get("/api/students/{student_id}")
def get_student(student_id: str):
    with get_db() as conn:
        row = conn.execute("SELECT * FROM students WHERE id=?", (student_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="الطالب غير موجود")
    item = dict(row)
    item["strong_skills"] = parse_json_list(item["strong_skills"])
    item["weak_skills"] = parse_json_list(item["weak_skills"])
    return item


@app.post("/api/students", status_code=201)
def create_student(payload: StudentIn):
    now = now_iso()
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO students (
                id, advisor_id, name, gender, email, password, major, year, gpa, attendance,
                task_time_ratio, task_completion, late_logins, incomplete_lectures,
                strong_skills, weak_skills, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                payload.id,
                payload.advisor_id,
                payload.name,
                payload.gender,
                payload.email,
                payload.password,
                payload.major,
                payload.year,
                payload.gpa,
                payload.attendance,
                payload.task_time_ratio,
                payload.task_completion,
                payload.late_logins,
                payload.incomplete_lectures,
                json.dumps(payload.strong_skills, ensure_ascii=False),
                json.dumps(payload.weak_skills, ensure_ascii=False),
                now,
                now,
            ),
        )
    return {"created": True, "id": payload.id}


@app.put("/api/students/{student_id}")
def update_student(student_id: str, payload: StudentIn):
    now = now_iso()
    with get_db() as conn:
        exists = conn.execute("SELECT id FROM students WHERE id=?", (student_id,)).fetchone()
        if not exists:
            raise HTTPException(status_code=404, detail="الطالب غير موجود")

        conn.execute(
            """
            UPDATE students
            SET id=?, advisor_id=?, name=?, gender=?, email=?, password=?, major=?, year=?, gpa=?, attendance=?,
                task_time_ratio=?, task_completion=?, late_logins=?, incomplete_lectures=?, strong_skills=?, weak_skills=?, updated_at=?
            WHERE id=?
            """,
            (
                payload.id,
                payload.advisor_id,
                payload.name,
                payload.gender,
                payload.email,
                payload.password,
                payload.major,
                payload.year,
                payload.gpa,
                payload.attendance,
                payload.task_time_ratio,
                payload.task_completion,
                payload.late_logins,
                payload.incomplete_lectures,
                json.dumps(payload.strong_skills, ensure_ascii=False),
                json.dumps(payload.weak_skills, ensure_ascii=False),
                now,
                student_id,
            ),
        )
    return {"updated": True, "id": payload.id}


@app.delete("/api/students/{student_id}")
def delete_student(student_id: str):
    with get_db() as conn:
        deleted = conn.execute("DELETE FROM students WHERE id=?", (student_id,)).rowcount
    if not deleted:
        raise HTTPException(status_code=404, detail="الطالب غير موجود")
    return {"deleted": True}


@app.get("/api/advisors")
def list_advisors():
    with get_db() as conn:
        rows = conn.execute("SELECT id, name, email, title, department, created_at, updated_at FROM advisors ORDER BY id").fetchall()
    return [dict(row) for row in rows]


@app.get("/api/advisors/{advisor_id}")
def get_advisor(advisor_id: str):
    with get_db() as conn:
        row = conn.execute(
            "SELECT id, name, email, title, department, created_at, updated_at FROM advisors WHERE id=?",
            (advisor_id,),
        ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="المرشد غير موجود")
    return dict(row)


@app.post("/api/advisors", status_code=201)
def create_advisor(payload: AdvisorIn):
    now = now_iso()
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO advisors (id, name, email, password, title, department, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (payload.id, payload.name, payload.email, payload.password, payload.title, payload.department, now, now),
        )
    return {"created": True, "id": payload.id}


@app.put("/api/advisors/{advisor_id}")
def update_advisor(advisor_id: str, payload: AdvisorIn):
    now = now_iso()
    with get_db() as conn:
        exists = conn.execute("SELECT id FROM advisors WHERE id=?", (advisor_id,)).fetchone()
        if not exists:
            raise HTTPException(status_code=404, detail="المرشد غير موجود")

        conn.execute(
            """
            UPDATE advisors
            SET id=?, name=?, email=?, password=?, title=?, department=?, updated_at=?
            WHERE id=?
            """,
            (payload.id, payload.name, payload.email, payload.password, payload.title, payload.department, now, advisor_id),
        )
    return {"updated": True, "id": payload.id}


@app.delete("/api/advisors/{advisor_id}")
def delete_advisor(advisor_id: str):
    with get_db() as conn:
        deleted = conn.execute("DELETE FROM advisors WHERE id=?", (advisor_id,)).rowcount
    if not deleted:
        raise HTTPException(status_code=404, detail="المرشد غير موجود")
    return {"deleted": True}


@app.get("/api/courses")
def list_courses():
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM courses ORDER BY id").fetchall()
    return [dict(row) for row in rows]


@app.get("/api/courses/{course_id}")
def get_course(course_id: int):
    with get_db() as conn:
        row = conn.execute("SELECT * FROM courses WHERE id=?", (course_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="المقرر غير موجود")
    return dict(row)


@app.post("/api/courses", status_code=201)
def create_course(payload: CourseIn):
    now = now_iso()
    with get_db() as conn:
        cursor = conn.execute(
            """
            INSERT INTO courses (advisor_id, code, name, instructor, fail_rate, avg_grade, enroll_count, severity, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                payload.advisor_id,
                payload.code,
                payload.name,
                payload.instructor,
                payload.fail_rate,
                payload.avg_grade,
                payload.enroll_count,
                payload.severity,
                now,
                now,
            ),
        )
    return {"created": True, "id": cursor.lastrowid}


@app.put("/api/courses/{course_id}")
def update_course(course_id: int, payload: CourseIn):
    now = now_iso()
    with get_db() as conn:
        exists = conn.execute("SELECT id FROM courses WHERE id=?", (course_id,)).fetchone()
        if not exists:
            raise HTTPException(status_code=404, detail="المقرر غير موجود")

        conn.execute(
            """
            UPDATE courses
            SET advisor_id=?, code=?, name=?, instructor=?, fail_rate=?, avg_grade=?, enroll_count=?, severity=?, updated_at=?
            WHERE id=?
            """,
            (
                payload.advisor_id,
                payload.code,
                payload.name,
                payload.instructor,
                payload.fail_rate,
                payload.avg_grade,
                payload.enroll_count,
                payload.severity,
                now,
                course_id,
            ),
        )
    return {"updated": True}


@app.delete("/api/courses/{course_id}")
def delete_course(course_id: int):
    with get_db() as conn:
        deleted = conn.execute("DELETE FROM courses WHERE id=?", (course_id,)).rowcount
    if not deleted:
        raise HTTPException(status_code=404, detail="المقرر غير موجود")
    return {"deleted": True}


@app.get("/api/ai-logs")
def list_ai_logs(limit: int = Query(default=100, ge=1, le=500)):
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM ai_logs ORDER BY id DESC LIMIT ?", (limit,)).fetchall()
    logs = []
    for row in rows:
        item = dict(row)
        item["metadata"] = json.loads(item["metadata"] or "{}")
        logs.append(item)
    return logs


@app.get("/api/ai-logs/{log_id}")
def get_ai_log(log_id: int):
    with get_db() as conn:
        row = conn.execute("SELECT * FROM ai_logs WHERE id=?", (log_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="السجل غير موجود")
    item = dict(row)
    item["metadata"] = json.loads(item["metadata"] or "{}")
    return item


@app.post("/api/ai-logs", status_code=201)
def create_ai_log(payload: AILogIn):
    with get_db() as conn:
        cursor = conn.execute(
            """
            INSERT INTO ai_logs (actor_role, actor_id, action_type, entity_type, entity_id, prompt, response, metadata, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                payload.actor_role,
                payload.actor_id,
                payload.action_type,
                payload.entity_type,
                payload.entity_id,
                payload.prompt,
                payload.response,
                json.dumps(payload.metadata, ensure_ascii=False),
                now_iso(),
            ),
        )
    return {"created": True, "id": cursor.lastrowid}


@app.delete("/api/ai-logs/{log_id}")
def delete_ai_log(log_id: int):
    with get_db() as conn:
        deleted = conn.execute("DELETE FROM ai_logs WHERE id=?", (log_id,)).rowcount
    if not deleted:
        raise HTTPException(status_code=404, detail="السجل غير موجود")
    return {"deleted": True}


@app.get("/api/advisor/overview")
def advisor_overview():
    with get_db() as conn:
        students_rows = conn.execute("SELECT * FROM students").fetchall()
        courses_rows = conn.execute("SELECT * FROM courses ORDER BY fail_rate DESC").fetchall()

    students = []
    for row in students_rows:
        s = dict(row)
        s["strongSkills"] = parse_json_list(s.pop("strong_skills"))
        s["weakSkills"] = parse_json_list(s.pop("weak_skills"))
        transformed = {
            "id": s["id"],
            "name": s["name"],
            "major": s["major"],
            "year": s["year"],
            "gpa": s["gpa"],
            "attendance": s["attendance"],
            "task_time_ratio": s["task_time_ratio"],
            "task_completion": s["task_completion"],
            "late_logins": s["late_logins"],
            "incomplete_lectures": s["incomplete_lectures"],
            "strongSkills": s["strongSkills"],
            "weakSkills": s["weakSkills"],
            "email": s["email"],
        }
        student_result = risk_analyze(
            {
                "id": transformed["id"],
                "name": transformed["name"],
                "major": transformed["major"],
                "year": transformed["year"],
                "gpa": transformed["gpa"],
                "attendance": transformed["attendance"],
                "task_time_ratio": transformed["task_time_ratio"],
                "task_completion": transformed["task_completion"],
                "late_logins": transformed["late_logins"],
                "incomplete_lectures": transformed["incomplete_lectures"],
            }
        )
        student_result["taskTimeRatio"] = transformed["task_time_ratio"]
        student_result["taskCompletion"] = transformed["task_completion"]
        student_result["lateLogins"] = transformed["late_logins"]
        student_result["incompleteLectures"] = transformed["incomplete_lectures"]
        student_result["strongSkills"] = transformed["strongSkills"]
        student_result["weakSkills"] = transformed["weakSkills"]
        students.append(student_result)

    students.sort(key=lambda item: item["riskScore"], reverse=True)

    red_count = len([s for s in students if s["riskLevel"] == "red"])
    yellow_count = len([s for s in students if s["riskLevel"] == "yellow"])
    stats = {
        "totalStudents": len(students),
        "interventionsToday": red_count + yellow_count,
        "redCount": red_count,
        "yellowCount": yellow_count,
        "successfulInterventions": 34,
        "successRate": 88,
    }

    courses = [dict(row) for row in courses_rows]
    return {"students": students, "stats": stats, "courses": courses}


@app.get("/api/interventions")
def list_interventions(limit: int = Query(default=50, ge=1, le=300)):
    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT * FROM ai_logs
            WHERE action_type='intervention_generated'
            ORDER BY id DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()

    items = []
    for row in rows:
        metadata = json.loads(row["metadata"] or "{}")
        items.append(
            {
                "id": row["id"],
                "student": metadata.get("student_name", "غير معروف"),
                "date": row["created_at"][:10],
                "status": metadata.get("status", "sent"),
                "type": metadata.get("channel", "بريد + لقاء"),
                "result": metadata.get("result", "في انتظار الرد"),
            }
        )
    return items


@app.post("/api/interventions/generate")
def generate_intervention(payload: InterventionRequest):
    with get_db() as conn:
        student = conn.execute("SELECT * FROM students WHERE id=?", (payload.student_id,)).fetchone()
        advisor = conn.execute("SELECT * FROM advisors WHERE id=?", (payload.advisor_id,)).fetchone()

    if not student or not advisor:
        raise HTTPException(status_code=404, detail="لم يتم العثور على الطالب أو المرشد")

    student_data = risk_analyze(
        {
            "id": student["id"],
            "name": student["name"],
            "major": student["major"],
            "year": student["year"],
            "gpa": student["gpa"],
            "attendance": student["attendance"],
            "task_time_ratio": student["task_time_ratio"],
            "task_completion": student["task_completion"],
            "late_logins": student["late_logins"],
            "incomplete_lectures": student["incomplete_lectures"],
        }
    )

    urgency = "عاجلة جداً" if student_data["riskLevel"] == "red" else "استباقية"
    subject = f"رسالة دعم أكاديمي {urgency} — {student['name']}"

    factors_text = "\n".join([f"- {f}" for f in student_data["factors"]])
    email_body = (
        f"السلام عليكم {student['name']}\n\n"
        f"أتواصل معك {advisor['name']} لدعمك أكاديميًا.\n\n"
        f"السبب الرئيسي المرصود:\n{student_data['primaryReason']}\n\n"
        f"العوامل المؤثرة:\n{factors_text}\n\n"
        "دعنا نحدد جلسة سريعة ونبني خطة واضحة.\n\n"
        f"مع التحية،\n{advisor['name']}\n"
    )

    steps = [
        {"step": 1, "action": "مقابلة شخصية", "timeline": "خلال 48 ساعة", "owner": "المرشد"},
        {"step": 2, "action": "إعادة هيكلة الجدول", "timeline": "خلال 3 أيام", "owner": "المرشد + الطالب"},
        {"step": 3, "action": "جلسة متابعة", "timeline": "بعد 3 أسابيع", "owner": "المرشد"},
    ]

    follow_up_days = 3 if student_data["riskLevel"] == "red" else 7
    follow_up_date = (datetime.utcnow() + timedelta(days=follow_up_days)).strftime("%Y-%m-%d")

    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO ai_logs (actor_role, actor_id, action_type, entity_type, entity_id, prompt, response, metadata, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "advisor",
                payload.advisor_id,
                "intervention_generated",
                "student",
                payload.student_id,
                "generate intervention",
                subject,
                json.dumps(
                    {
                        "student_name": student["name"],
                        "status": "sent",
                        "channel": "بريد + لقاء",
                        "result": "في انتظار الرد",
                    },
                    ensure_ascii=False,
                ),
                now_iso(),
            ),
        )

    return {
        "emailSubject": subject,
        "emailBody": email_body,
        "actionPlan": steps,
        "followUpDate": follow_up_date,
        "generatedAt": now_iso(),
    }


@app.post("/api/matchmaking/request")
def request_match(payload: MatchRequest):
    with get_db() as conn:
        requester = conn.execute("SELECT * FROM students WHERE id=?", (payload.requester_id,)).fetchone()
        candidates = conn.execute("SELECT * FROM students WHERE id <> ?", (payload.requester_id,)).fetchall()

    if not requester:
        raise HTTPException(status_code=404, detail="الطالب غير موجود")

    requester_strong = parse_json_list(requester["strong_skills"])
    best = None

    for candidate in candidates:
        candidate_strong = parse_json_list(candidate["strong_skills"])
        candidate_weak = parse_json_list(candidate["weak_skills"])
        strong_match = any(payload.weak_skill.lower() in skill.lower() for skill in candidate_strong)
        mutual = any(rs.lower() in " ".join(candidate_weak).lower() for rs in requester_strong)
        if strong_match and mutual:
            best = candidate
            break

    if not best:
        for candidate in candidates:
            candidate_strong = parse_json_list(candidate["strong_skills"])
            if any(payload.weak_skill.lower() in skill.lower() for skill in candidate_strong):
                best = candidate
                break

    if not best:
        raise HTTPException(status_code=404, detail="لا يوجد تطابق حاليًا")

    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO ai_logs (actor_role, actor_id, action_type, entity_type, entity_id, prompt, response, metadata, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "student",
                payload.requester_id,
                "peer_match_requested",
                "student",
                best["id"],
                payload.weak_skill,
                "peer match created",
                json.dumps({"matched_student": best["name"]}, ensure_ascii=False),
                now_iso(),
            ),
        )
        conn.execute(
            "INSERT INTO notifications (role, type, text, created_at, read) VALUES (?, ?, ?, ?, 0)",
            (
                "student",
                "info",
                f"تمت مطابقة {best['name']} لمساعدتك في {payload.weak_skill}",
                now_iso(),
            ),
        )

    return {
        "matchedStudentId": best["id"],
        "matchedStudentName": best["name"],
        "message": f"تم إنشاء توأمة أكاديمية مع {best['name']}",
    }


@app.get("/api/notifications")
def get_notifications(role: Literal["student", "advisor"]):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM notifications WHERE role=? ORDER BY id DESC LIMIT 30",
            (role,),
        ).fetchall()

    result = []
    for row in rows:
        result.append(
            {
                "id": row["id"],
                "type": row["type"],
                "text": row["text"],
                "time": row["created_at"][:16].replace("T", " "),
                "read": bool(row["read"]),
            }
        )
    return result


@app.get("/api/student/dashboard/{student_id}")
def student_dashboard(student_id: str):
    with get_db() as conn:
        row = conn.execute("SELECT * FROM students WHERE id=?", (student_id,)).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="الطالب غير موجود")

    student = risk_analyze(
        {
            "id": row["id"],
            "name": row["name"],
            "major": row["major"],
            "year": row["year"],
            "gpa": row["gpa"],
            "attendance": row["attendance"],
            "task_time_ratio": row["task_time_ratio"],
            "task_completion": row["task_completion"],
            "late_logins": row["late_logins"],
            "incomplete_lectures": row["incomplete_lectures"],
        }
    )

    profile = {
        "id": student["id"],
        "name": student["name"],
        "gender": row["gender"],
        "major": student["major"],
        "year": f"السنة {student['year']}",
        "gpa": student["gpa"],
        "maxGpa": 5,
        "completionRate": int(student["task_completion"]),
        "status": "danger" if student["riskLevel"] == "red" else "warning" if student["riskLevel"] == "yellow" else "success",
        "statusMessage": student["primaryReason"],
        "streak": 5,
    }

    adaptive = [
        {
            "id": 1,
            "course": "الفيزياء 201",
            "courseIcon": "⚛️",
            "issue": "تقضي وقتًا أطول من المتوقع في بعض الوحدات.",
            "alternatives": [
                {"key": "video", "label": "فيديو تفاعلي — 12 دقيقة", "color": "#818CF8", "bg": "rgba(129,140,248,0.1)"},
                {"key": "podcast", "label": "ملخص صوتي للفصل", "color": "#34D399", "bg": "rgba(52,211,153,0.1)"},
                {"key": "map", "label": "خريطة ذهنية تفاعلية", "color": "#F59E0B", "bg": "rgba(245,158,11,0.1)"},
            ],
        }
    ]

    peers = [
        {
            "id": 1,
            "studentId": "44120345",
            "name": "أحمد محمود",
            "initials": "أ",
            "color": "#6366F1",
            "strong": "البرمجة والخوارزميات",
            "weak": "الرياضيات التفاضلية",
            "reason": "تبادل منفعي مثالي بين نقاط القوة.",
            "compatibility": 94,
        }
    ]

    skills = [
        {
            "id": 1,
            "skill": "الرياضيات والتحليل",
            "level": 92,
            "color": "#10B981",
            "course": "Data Analysis with Python",
            "platform": "Coursera",
            "link": "https://www.coursera.org/learn/data-analysis-with-python",
            "boost": 40,
            "reason": "مهاراتك الرياضية مهيأة لمسار تحليل البيانات.",
            "hot": True,
        }
    ]

    tasks = [
        {
            "id": 1,
            "title": "تسليم تقرير هياكل البيانات",
            "deadline": "غداً — 11:59 مساءً",
            "progress": int(student["task_completion"] // 2),
            "urgency": "danger" if student["riskLevel"] == "red" else "warning",
            "aiNote": "قسّم المهمة إلى خطوات قصيرة لزيادة الإنجاز.",
            "canSplit": True,
        }
    ]

    split_steps = [
        {"text": "تحديد المتطلبات", "time": "20 دقيقة", "icon": "📖"},
        {"text": "بناء مخطط الحل", "time": "15 دقيقة", "icon": "✏️"},
        {"text": "تنفيذ الكود", "time": "90 دقيقة", "icon": "💻"},
        {"text": "المراجعة النهائية", "time": "35 دقيقة", "icon": "🔍"},
    ]

    return {
        "student": profile,
        "adaptive": adaptive,
        "peers": peers,
        "skills": skills,
        "tasks": tasks,
        "splitSteps": split_steps,
    }


@app.post("/api/student/tasks/{student_id}/progress")
def update_task_progress(student_id: str, progress: int = Query(ge=0, le=100)):
    with get_db() as conn:
        exists = conn.execute("SELECT id FROM students WHERE id=?", (student_id,)).fetchone()
        if not exists:
            raise HTTPException(status_code=404, detail="الطالب غير موجود")

        conn.execute(
            "UPDATE students SET task_completion=?, updated_at=? WHERE id=?",
            (progress, now_iso(), student_id),
        )
        conn.execute(
            """
            INSERT INTO ai_logs (actor_role, actor_id, action_type, entity_type, entity_id, prompt, response, metadata, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "student",
                student_id,
                "task_progress_updated",
                "student",
                student_id,
                "progress",
                str(progress),
                json.dumps({"progress": progress}, ensure_ascii=False),
                now_iso(),
            ),
        )
    return {"updated": True, "progress": progress}


@app.post("/api/features/{feature_code}/toggle")
def toggle_feature(feature_code: str, payload: FeatureToggleRequest):
    now = now_iso()
    with get_db() as conn:
        exists = conn.execute("SELECT id FROM feature_flags WHERE code=?", (feature_code,)).fetchone()
        if not exists:
            raise HTTPException(status_code=404, detail="الميزة غير موجودة")

        conn.execute(
            "UPDATE feature_flags SET enabled=?, updated_at=? WHERE code=?",
            (1 if payload.enabled else 0, now, feature_code),
        )
        conn.execute(
            """
            INSERT INTO ai_logs (actor_role, actor_id, action_type, entity_type, entity_id, prompt, response, metadata, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "advisor",
                "system",
                "feature_toggled",
                "feature",
                feature_code,
                "toggle",
                "enabled" if payload.enabled else "disabled",
                json.dumps({"feature_code": feature_code, "enabled": payload.enabled}),
                now,
            ),
        )
    return {"updated": True, "code": feature_code, "enabled": payload.enabled}


@app.get("/api/features")
def list_features(category: Optional[str] = None):
    query = "SELECT * FROM feature_flags"
    params: tuple[Any, ...] = ()
    if category:
        query += " WHERE category=?"
        params = (category,)
    query += " ORDER BY id"

    with get_db() as conn:
        rows = conn.execute(query, params).fetchall()

    return [
        {
            "id": row["id"],
            "code": row["code"],
            "name": row["name"],
            "category": row["category"],
            "description": row["description"],
            "enabled": bool(row["enabled"]),
        }
        for row in rows
    ]


<<<<<<< HEAD
# ═══════════════════════════════════════════════════════════════════════════════
#  🤖 AI Chatbot — Student
# ═══════════════════════════════════════════════════════════════════════════════

@app.post("/api/chat/student")
def chat_student(payload: ChatMessageRequest):
    """
    AI Chatbot for students. Receives a message, fetches student data,
    builds context, sends to DeepSeek with conversation history, returns response.
    """
    with get_db() as conn:
        student = conn.execute("SELECT * FROM students WHERE id=?", (payload.student_id,)).fetchone()
        if not student:
            raise HTTPException(status_code=404, detail="الطالب غير موجود")

        # Get recent conversation history (last 20 messages)
        history_rows = conn.execute(
            "SELECT role, content FROM chat_messages WHERE student_id=? ORDER BY id DESC LIMIT 20",
            (payload.student_id,),
        ).fetchall()

    # Build context
    context = build_student_context(student)
    system = STUDENT_SYSTEM_PROMPT.replace("{student_context}", context)

    # Build message history (reverse to chronological order)
    messages = [{"role": row["role"], "content": row["content"]} for row in reversed(history_rows)]
    messages.append({"role": "user", "content": payload.message})

    session_id = payload.session_id or str(uuid.uuid4())

    try:
        ai_response = call_ai_with_history(system, messages, temperature=0.7)
    except Exception as e:
        print(f"AI API Error: {str(e)}")
        # Fallback mechanism when API key has no balance or is invalid
        ai_response = f"أهلاً {student['name']}! (هذا رد تجريبي لأن مفتاح الذكاء الاصطناعي لا يملك رصيد حالياً) بناءً على بياناتك، معدلك الحالي هو {student['gpa']}. أنصحك بالاستمرار في حضور المحاضرات ومراجعة خطة دراستك. هل لديك أي استفسار آخر؟"

    # Save both messages to DB
    with get_db() as conn:
        conn.execute(
            "INSERT INTO chat_messages (student_id, role, content, session_id, created_at) VALUES (?, ?, ?, ?, ?)",
            (payload.student_id, "user", payload.message, session_id, now_iso()),
        )
        conn.execute(
            "INSERT INTO chat_messages (student_id, role, content, session_id, created_at) VALUES (?, ?, ?, ?, ?)",
            (payload.student_id, "assistant", ai_response, session_id, now_iso()),
        )
        # Log to ai_logs for transparency
        conn.execute(
            """
            INSERT INTO ai_logs (actor_role, actor_id, action_type, entity_type, entity_id, prompt, response, metadata, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "student",
                payload.student_id,
                "chatbot_conversation",
                "student",
                payload.student_id,
                payload.message,
                ai_response,
                json.dumps({"session_id": session_id}, ensure_ascii=False),
                now_iso(),
            ),
        )

    return {
        "response": ai_response,
        "session_id": session_id,
        "timestamp": now_iso(),
    }


# ═══════════════════════════════════════════════════════════════════════════════
#  🤖 AI Chatbot — Advisor
# ═══════════════════════════════════════════════════════════════════════════════

@app.post("/api/chat/advisor")
def chat_advisor(payload: AdvisorChatRequest):
    """
    AI Chatbot for advisors. Provides analysis and recommendations.
    """
    with get_db() as conn:
        advisor = conn.execute("SELECT * FROM advisors WHERE id=?", (payload.advisor_id,)).fetchone()
        if not advisor:
            raise HTTPException(status_code=404, detail="المرشد غير موجود")

        # Get all students for this advisor (or all students)
        students_rows = conn.execute(
            "SELECT * FROM students WHERE advisor_id=? OR advisor_id IS NULL ORDER BY id",
            (payload.advisor_id,),
        ).fetchall()

        # If asking about a specific student, get their chat history
        specific_context = ""
        if payload.student_id:
            specific_student = conn.execute("SELECT * FROM students WHERE id=?", (payload.student_id,)).fetchone()
            if specific_student:
                specific_context = f"\n\n📋 بيانات الطالب المحدد:\n{build_student_context(specific_student)}"
                # Get chat history for this student
                chats = conn.execute(
                    "SELECT role, content, created_at FROM chat_messages WHERE student_id=? ORDER BY id DESC LIMIT 30",
                    (payload.student_id,),
                ).fetchall()
                if chats:
                    chat_text = "\n".join([f"{'الطالب' if c['role'] == 'user' else 'المرشد الذكي'}: {c['content']}" for c in reversed(list(chats))])
                    specific_context += f"\n\n💬 محادثات الطالب مع المرشد الذكي:\n{chat_text}"

    # Build advisor context
    advisor_context = f"المشرف: {advisor['name']} — {advisor['title']}\n\n"
    advisor_context += "طلاب المشرف:\n"
    for s in students_rows:
        risk = risk_analyze({
            "id": s["id"], "name": s["name"], "major": s["major"], "year": s["year"],
            "gpa": s["gpa"], "attendance": s["attendance"],
            "task_time_ratio": s["task_time_ratio"], "task_completion": s["task_completion"],
            "late_logins": s["late_logins"], "incomplete_lectures": s["incomplete_lectures"],
        })
        emoji = "🔴" if risk["riskLevel"] == "red" else "🟡" if risk["riskLevel"] == "yellow" else "🟢"
        advisor_context += f"  {emoji} {s['name']} (ID: {s['id']}) — معدل: {s['gpa']} — حضور: {s['attendance']}% — خطورة: {risk['riskScore']}% — {risk['primaryReason']}\n"

    advisor_context += specific_context

    system = ADVISOR_SYSTEM_PROMPT.replace("{advisor_context}", advisor_context)

    try:
        ai_response = call_ai(system, payload.message, temperature=0.5)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"فشل في الاتصال بالذكاء الاصطناعي: {str(e)}")

    # Log
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO ai_logs (actor_role, actor_id, action_type, entity_type, entity_id, prompt, response, metadata, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "advisor",
                payload.advisor_id,
                "advisor_chatbot",
                "advisor",
                payload.advisor_id,
                payload.message,
                ai_response,
                json.dumps({"student_id": payload.student_id}, ensure_ascii=False),
                now_iso(),
            ),
        )

    return {
        "response": ai_response,
        "timestamp": now_iso(),
    }


# ═══════════════════════════════════════════════════════════════════════════════
#  📜 Chat History
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/api/chat/history/{student_id}")
def get_chat_history(student_id: str, limit: int = Query(default=50, ge=1, le=200)):
    """Get chat history for a student."""
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM chat_messages WHERE student_id=? ORDER BY id DESC LIMIT ?",
            (student_id, limit),
        ).fetchall()

    return [
        {
            "id": row["id"],
            "role": row["role"],
            "content": row["content"],
            "session_id": row["session_id"],
            "created_at": row["created_at"],
        }
        for row in reversed(list(rows))
    ]


# ═══════════════════════════════════════════════════════════════════════════════
#  🔕 Silent Analysis (Proactive Alerts)
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/api/student/silent-analysis/{student_id}")
def silent_analysis(student_id: str):
    """
    Runs a silent AI analysis when a student logs in.
    Returns proactive alerts based on their current data.
    """
    with get_db() as conn:
        student = conn.execute("SELECT * FROM students WHERE id=?", (student_id,)).fetchone()

    if not student:
        raise HTTPException(status_code=404, detail="الطالب غير موجود")

    context = build_student_context(student)
    system = SILENT_ANALYSIS_PROMPT.replace("{student_context}", context)

    try:
        ai_response = call_ai(system, "حلل بيانات الطالب وأعطني الإنذارات الاستباقية.", temperature=0.3)

        # Try to parse JSON response
        try:
            # Clean potential markdown code blocks
            cleaned = ai_response.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
                if cleaned.endswith("```"):
                    cleaned = cleaned[:-3]
                cleaned = cleaned.strip()
            result = json.loads(cleaned)
        except json.JSONDecodeError:
            # Fallback: generate alerts from data directly
            result = _generate_fallback_alerts(student)

    except Exception:
        # If AI fails, use rule-based fallback
        result = _generate_fallback_alerts(student)

    # Log
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO ai_logs (actor_role, actor_id, action_type, entity_type, entity_id, prompt, response, metadata, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "system_ai",
                "silent_analyzer",
                "silent_analysis",
                "student",
                student_id,
                "silent analysis triggered",
                json.dumps(result, ensure_ascii=False),
                json.dumps({"trigger": "login"}, ensure_ascii=False),
                now_iso(),
            ),
        )

    return result


def _generate_fallback_alerts(student) -> dict:
    """Rule-based fallback alerts when AI is unavailable."""
    alerts = []
    name = student["name"].split()[0]

    if student["gpa"] < 2.0:
        alerts.append({
            "type": "danger",
            "title": "معدل تراكمي منخفض",
            "message": f"أهلاً {name}، معدلك حالياً {student['gpa']} وهو أقل من الحد الأدنى المطلوب. دعنا نضع خطة لرفعه!",
            "metric": "المعدل التراكمي",
            "value": str(student["gpa"]),
            "suggestion": "ركز على المواد التي تتقن فيها مهاراتك القوية لرفع درجاتك بأقل جهد."
        })
    elif student["gpa"] < 2.5:
        alerts.append({
            "type": "warning",
            "title": "معدل يحتاج تحسين",
            "message": f"أهلاً {name}، معدلك {student['gpa']} — قريب من المنطقة الآمنة! مع قليل من الجهد ستتجاوزها.",
            "metric": "المعدل التراكمي",
            "value": str(student["gpa"]),
            "suggestion": "خصص ساعة يومياً للمراجعة وسترى فرقاً واضحاً."
        })

    if student["attendance"] < 60:
        alerts.append({
            "type": "danger",
            "title": "غياب مفرط",
            "message": f"{name}، نسبة حضورك {student['attendance']}% وهي أقل من الحد المسموح. الحضور مرتبط مباشرة بالدرجات!",
            "metric": "الحضور",
            "value": f"{student['attendance']}%",
            "suggestion": "حاول حضور المحاضرات القادمة بانتظام — كل محاضرة تحضرها تزيد فرصتك بالنجاح."
        })
    elif student["attendance"] < 80:
        alerts.append({
            "type": "warning",
            "title": "حضور أقل من المتوقع",
            "message": f"{name}، حضورك {student['attendance']}% — حاول رفعه فوق 80% لتجنب أي إنذار.",
            "metric": "الحضور",
            "value": f"{student['attendance']}%",
            "suggestion": "ضع تنبيه يومي قبل المحاضرة بـ 30 دقيقة."
        })

    if student["task_completion"] < 50:
        alerts.append({
            "type": "warning",
            "title": "مهام غير مكتملة",
            "message": f"{name}، أكملت فقط {student['task_completion']}% من مهامك. قسّم المهام لخطوات صغيرة وابدأ بالأسهل!",
            "metric": "إكمال المهام",
            "value": f"{student['task_completion']}%",
            "suggestion": "استخدم ميزة 'تقسيم المهام الذكي' في راصد بلس."
        })

    if student["late_logins"] >= 5:
        alerts.append({
            "type": "info",
            "title": "نمط دخول متأخر",
            "message": f"{name}، لاحظت أنك تدخل المنصة في أوقات متأخرة كثيراً. هل تحتاج مساعدة في تنظيم وقتك؟",
            "metric": "الدخول المتأخر",
            "value": f"{student['late_logins']} مرات",
            "suggestion": "نوم منتظم = أداء أفضل. حاول النوم قبل 11 مساءً."
        })

    if not alerts:
        alerts.append({
            "type": "info",
            "title": "أداء ممتاز! 🌟",
            "message": f"أحسنت {name}! مؤشراتك الأكاديمية ممتازة. استمر بهذا المستوى!",
            "metric": "الأداء العام",
            "value": "ممتاز",
            "suggestion": "فكر في مساعدة زملائك من خلال ميزة التوأمة الأكاديمية."
        })

    mood = "concerned" if any(a["type"] == "danger" for a in alerts) else "neutral" if any(a["type"] == "warning" for a in alerts) else "positive"
    priority = alerts[0]["suggestion"] if alerts else "استمر بالتميز!"

    return {
        "alerts": alerts,
        "overall_mood": mood,
        "priority_action": priority,
    }


# ═══════════════════════════════════════════════════════════════════════════════
#  📊 Advisor Brief — Student Conversation Summary
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/api/advisor/student-brief/{student_id}")
def advisor_student_brief(student_id: str):
    """
    Generates an AI brief for advisors about a student's chat patterns,
    emotional state, and areas of concern.
    """
    with get_db() as conn:
        student = conn.execute("SELECT * FROM students WHERE id=?", (student_id,)).fetchone()
        if not student:
            raise HTTPException(status_code=404, detail="الطالب غير موجود")

        chats = conn.execute(
            "SELECT role, content, created_at FROM chat_messages WHERE student_id=? ORDER BY id",
            (student_id,),
        ).fetchall()

    context = build_student_context(student)

    if not chats:
        chat_history = "لا توجد محادثات مسجلة بعد. قم بالتحليل بناءً على البيانات الأكاديمية فقط."
    else:
        chat_lines = []
        for c in chats:
            role_label = "الطالب" if c["role"] == "user" else "المرشد الذكي"
            chat_lines.append(f"[{c['created_at'][:16]}] {role_label}: {c['content'][:300]}")
        chat_history = "\n".join(chat_lines[-40:])  # Last 40 messages

    system = ADVISOR_BRIEF_PROMPT.replace("{student_context}", context).replace("{chat_history}", chat_history)

    try:
        ai_response = call_ai(system, "قدم ملخص شامل عن هذا الطالب للمشرف.", temperature=0.3)

        try:
            cleaned = ai_response.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
                if cleaned.endswith("```"):
                    cleaned = cleaned[:-3]
                cleaned = cleaned.strip()
            result = json.loads(cleaned)
        except json.JSONDecodeError:
            result = {
                "emotional_state": "غير محدد — لم يتح التحليل",
                "main_concerns": [],
                "topics_discussed": [],
                "risk_indicators": [],
                "recommended_actions": ["مقابلة شخصية مع الطالب لتقييم حالته"],
                "conversation_summary": ai_response[:500],
                "urgency": "medium",
            }

    except Exception:
        risk = risk_analyze({
            "id": student["id"], "name": student["name"], "major": student["major"], "year": student["year"],
            "gpa": student["gpa"], "attendance": student["attendance"],
            "task_time_ratio": student["task_time_ratio"], "task_completion": student["task_completion"],
            "late_logins": student["late_logins"], "incomplete_lectures": student["incomplete_lectures"],
        })
        result = {
            "emotional_state": "غير متاح — الذكاء الاصطناعي غير متصل",
            "main_concerns": risk["factors"],
            "topics_discussed": [],
            "risk_indicators": risk["factors"],
            "recommended_actions": ["مقابلة شخصية مع الطالب"],
            "conversation_summary": f"الطالب {student['name']} بمعدل {student['gpa']} وحضور {student['attendance']}%. {risk['primaryReason']}.",
            "urgency": "high" if risk["riskLevel"] == "red" else "medium" if risk["riskLevel"] == "yellow" else "low",
        }

    result["student_name"] = student["name"]
    result["student_id"] = student["id"]
    result["total_messages"] = len(chats)

    return result


# ═══════════════════════════════════════════════════════════════════════════════
#  🔬 AI Analyze Student (updated to use DeepSeek)
# ═══════════════════════════════════════════════════════════════════════════════

@app.post("/api/v1/ai/analyze-student")
def analyze_student(payload: AnalyzedStudentProfileIn):
    """
    AI endpoint to analyze student data and provide an actionable intervention plan.
    Uses DeepSeek API.
    """
    try:
        system_instruction = (
            "You are the core AI Engine for 'Rassed Plus,' a proactive academic advising platform. "
            "Your role is to analyze student data (academic performance, behavioral metrics, and tasks) "
            "and output highly specific, actionable insights. "
            "Act as an expert academic advisor and data analyst.\n\n"
            "Your tasks for each student are:\n"
            "1. Risk Assessment: Determine the probability of failure or dropout (Low, Medium, High).\n"
            "2. Actionable Intervention Plan: Create a 3-step actionable plan for the human advisor.\n"
            "3. Peer Matchmaking: Based on the student's weak skills and strong skills, define the exact profile of another student they should be paired with.\n\n"
            "OUTPUT FORMAT:\n"
            "Respond ONLY in valid JSON format:\n"
            "{\n"
            '  "risk_level": "High/Medium/Low",\n'
            '  "root_cause_analysis": "Short explanation",\n'
            '  "intervention_plan": ["Step 1", "Step 2", "Step 3"],\n'
            '  "matchmaking_recommendation": {\n'
            '    "student_needs_help_with": "Skill name",\n'
            '    "student_can_help_with": "Skill name"\n'
            "  }\n"
            "}"
        )

        ai_response = call_ai(
            system_instruction,
            f"Analyze the following student profile:\n{payload.model_dump_json()}",
            temperature=0.2,
        )

        try:
            cleaned = ai_response.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
                if cleaned.endswith("```"):
                    cleaned = cleaned[:-3]
                cleaned = cleaned.strip()
            result_data = json.loads(cleaned)
        except json.JSONDecodeError:
            result_data = {"raw_response": ai_response}

        # Log AI Decision
        with get_db() as conn:
            conn.execute(
                """
                INSERT INTO ai_logs (actor_role, actor_id, action_type, entity_type, entity_id, prompt, response, metadata, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    "system_ai",
                    "deepseek_analyzer",
                    "analyze_student",
                    "student",
                    payload.student_id,
                    system_instruction + "\n\nProfile: " + payload.model_dump_json(),
                    ai_response,
                    json.dumps({"input_data": payload.model_dump()}, ensure_ascii=False),
                    now_iso(),
                ),
            )

        return result_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Analysis Failed: {str(e)}")


=======
>>>>>>> origin/main
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
