import json
from datetime import datetime, timedelta
from typing import Any, Literal, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from database import get_db, init_db, now_iso

init_db()

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


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
