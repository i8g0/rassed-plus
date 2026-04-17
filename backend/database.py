import json
import sqlite3
from contextlib import contextmanager
from datetime import datetime
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "rassed_plus.db"


@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def now_iso() -> str:
    return datetime.utcnow().isoformat()


def _table_has_rows(conn: sqlite3.Connection, table_name: str) -> bool:
    row = conn.execute(f"SELECT COUNT(*) AS count FROM {table_name}").fetchone()
    return bool(row and row["count"] > 0)


def _ensure_column(conn: sqlite3.Connection, table_name: str, column_name: str, definition: str) -> None:
    columns = conn.execute(f"PRAGMA table_info({table_name})").fetchall()
    names = {col["name"] for col in columns}
    if column_name not in names:
        conn.execute(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {definition}")


def init_db() -> None:
    with get_db() as conn:
        conn.executescript(
            """
            PRAGMA foreign_keys = ON;

            CREATE TABLE IF NOT EXISTS advisors (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                title TEXT NOT NULL,
                department TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS students (
                id TEXT PRIMARY KEY,
                advisor_id TEXT,
                name TEXT NOT NULL,
                gender TEXT NOT NULL DEFAULT 'male',
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                major TEXT NOT NULL,
                year INTEGER NOT NULL,
                gpa REAL NOT NULL,
                attendance REAL NOT NULL,
                task_time_ratio REAL NOT NULL,
                task_completion REAL NOT NULL,
                late_logins INTEGER NOT NULL,
                incomplete_lectures REAL NOT NULL,
                strong_skills TEXT NOT NULL,
                weak_skills TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY(advisor_id) REFERENCES advisors(id) ON DELETE SET NULL
            );

            CREATE TABLE IF NOT EXISTS courses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                advisor_id TEXT,
                code TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                instructor TEXT NOT NULL,
                fail_rate REAL NOT NULL,
                avg_grade TEXT NOT NULL,
                enroll_count INTEGER NOT NULL,
                severity TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY(advisor_id) REFERENCES advisors(id) ON DELETE SET NULL
            );

            CREATE TABLE IF NOT EXISTS ai_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                actor_role TEXT NOT NULL,
                actor_id TEXT NOT NULL,
                action_type TEXT NOT NULL,
                entity_type TEXT NOT NULL,
                entity_id TEXT,
                prompt TEXT,
                response TEXT,
                metadata TEXT,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                role TEXT NOT NULL,
                type TEXT NOT NULL,
                text TEXT NOT NULL,
                created_at TEXT NOT NULL,
                read INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS feature_flags (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                code TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                description TEXT NOT NULL,
                enabled INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS chat_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                session_id TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
            );
            """
        )
        _ensure_column(conn, "students", "gender", "TEXT NOT NULL DEFAULT 'male'")
        seed_data(conn)


def _seed_features(conn: sqlite3.Connection) -> None:
    if _table_has_rows(conn, "feature_flags"):
        return

    features: list[tuple[str, str, str, str]] = []

    students_features = [
        "التنبؤ بالدرجات النهائية", "منبه الإرهاق الرقمي", "خريطة طريق مهنية 2030", "ربط منصات التطوع", "محفظة إنجازات تلقائية",
        "مساعد AR للتنقل الجامعي", "مخطط مذاكرة ذكي يومي", "مراقب جودة النوم الأكاديمي", "مستشار منح وفرص", "مولد CV أكاديمي",
        "تحليل نمط المذاكرة", "تذكير مخصص للواجبات", "جدولة طوارئ الامتحانات", "تتبع إنتاجية أسبوعي", "لوحة نقاط تحفيزية",
        "توصية محتوى حسب الفهم", "تحليل وقت الشاشة", "اكتشاف فجوات المناهج", "متابعة أهداف الفصل", "تقييم جاهزية الاختبار",
        "مساعد كتابة التقارير", "تصحيح واجبات أولي", "مساعد العروض التقديمية", "توصية مجموعات دراسية", "مدرب مهارات العرض",
        "بوصلة التخصصات الدقيقة", "كشف ضغط الجدول", "خطة تعويض التعثر", "تحديات تعلم جماعي", "سجل تعلم مستمر",
        "مؤشر الثقة الأكاديمية", "توصية دورات قصيرة", "مخطط مراجعة نهائية", "تحليل سلوك الحضور", "مساعد المراجع العلمية",
        "تخطيط تدريب صيفي", "ربط فرص هاكاثون", "قياس تقدم أسبوعي", "لوحة إنجازات AI", "وكيل تعلم شخصي"
    ]
    advisors_features = [
        "رادار التسرب المبكر", "تحليل مشاعر الاستبيانات", "تحسين توزيع الجداول", "ربط سوق العمل وسدايا", "مؤشر خطورة فوري",
        "خطة تدخل آلية", "متابعة نتائج التدخل", "خريطة الضغط الأكاديمي", "تنبيهات غياب لحظية", "تحليل عبء المقررات",
        "تتبع جودة التدريس", "لوحة أداء الأقسام", "تحليل تعثر حسب شعبة", "توصية إعادة تصميم مقرر", "تنبيهات حالات حرجة",
        "إدارة جلسات الإرشاد", "نظام ملاحظات المرشد", "تقييم أثر الخطط", "تقارير مجلس القسم", "قياس رضا الطلاب",
        "اكتشاف مقررات عالية المخاطر", "تحليل أسباب الانسحاب", "مساعد اتخاذ قرار", "تتبع مهارات الخريجين", "توصية مبادرات دعم",
        "محرك عدالة التوزيع", "تحليل كفاءة المرشدين", "لوحة متابعة يومية", "توقع ضغط الاختبارات", "تقارير تشغيل ذكية"
    ]
    ai_features = [
        "نظام توأمة أكاديمية عالمي", "تحليل لغة الجسد الافتراضي", "مولد ملخصات فيديو", "اكتشاف المواهب المخفية", "وكيل إرشاد ذاتي",
        "تحليل سياق التعثر", "نمذجة نجاح الخريجين", "محرك توصيات تخصص", "توقع احتمالية الانسحاب", "تصنيف سلوك التعلم",
        "تحليل تفاعل LMS", "توليد خطط تعلم مخصصة", "كشف أنماط الغش", "تحليل جودة الأسئلة", "تفسير قرارات AI",
        "مساعد إداري صوتي", "توليد محتوى تفاعلي", "محاكاة سيناريوهات النجاح", "منصة توصية مشاريع", "تحليل فجوات المهارات",
        "بناء رحلة تعلم تكيفية", "اكتشاف الروابط بين المقررات", "تقييم كفاءة التدخل", "تحليل أثر الأنشطة", "محرك تنبؤ أداء الكليات",
        "مساعد خطط الاعتماد", "تحليل تنافسية البرامج", "ذكاء اصطناعي للمراجعة الذاتية", "توليد مؤشرات جودة", "مختبر ابتكار تعليمي"
    ]

    for idx, name in enumerate(students_features, start=1):
        features.append((f"student-{idx:03d}", name, "student", f"ميزة طلابية رقم {idx}"))
    for idx, name in enumerate(advisors_features, start=1):
        features.append((f"advisor-{idx:03d}", name, "advisor", f"ميزة مرشد/جامعة رقم {idx}"))
    for idx, name in enumerate(ai_features, start=1):
        features.append((f"ai-{idx:03d}", name, "ai", f"ميزة ذكاء اصطناعي رقم {idx}"))

    now = now_iso()
    conn.executemany(
        """
        INSERT INTO feature_flags (code, name, category, description, enabled, created_at, updated_at)
        VALUES (?, ?, ?, ?, 0, ?, ?)
        """,
        [(code, name, category, description, now, now) for code, name, category, description in features],
    )


def seed_data(conn: sqlite3.Connection) -> None:
    now = now_iso()

    if not _table_has_rows(conn, "advisors"):
        conn.executemany(
            """
            INSERT INTO advisors (id, name, email, password, title, department, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                ("AD-1001", "د. خالد القحطاني", "khaled.advisor@university.edu", "Advisor@2026", "مرشد أكاديمي", "عمادة شؤون الطلاب", now, now),
                ("AD-1002", "د. أمل السبيعي", "amal.advisor@university.edu", "Advisor@2026", "مرشدة أكاديمية", "عمادة شؤون الطلاب", now, now),
            ],
        )

    if not _table_has_rows(conn, "students"):
        students = [
            ("44120345", "AD-1001", "أحمد محمود", "male", "ahmed.m@university.edu", "Ahmed@2026", "علوم الحاسب", 3, 1.3, 40, 3.0, 25, 6, 75, ["خوارزميات", "رياضيات"], ["قواعد بيانات", "شبكات"]),
            ("44210988", "AD-1001", "أحمد عمار", "male", "ahmad.ammar@university.edu", "Ahmad@2026", "علوم الحاسب", 2, 3.4, 82, 2.1, 72, 3, 40, ["رياضيات", "إحصاء"], ["برمجة متقدمة", "هياكل بيانات"]),
            ("43990122", "AD-1001", "فهد عبدالله", "male", "fahad.a@university.edu", "Fahad@2026", "هندسة البرمجيات", 4, 4.8, 97, 0.9, 98, 0, 2, ["برمجة متقدمة", "هياكل بيانات", "خوارزميات"], []),
            ("44112340", "AD-1002", "نورة سعد", "female", "noura.s@university.edu", "Noura@2026", "علوم الحاسب", 2, 1.6, 42, 2.5, 30, 7, 70, ["تصميم واجهات"], ["خوارزميات", "شبكات"]),
            ("44315200", "AD-1002", "عمر الشمري", "male", "omar.sh@university.edu", "Omar@2026", "نظم المعلومات", 3, 3.8, 90, 1.1, 91, 1, 10, ["قواعد بيانات", "شبكات", "إحصاء"], ["رياضيات"]),
            ("44520101", "AD-1002", "لين الحربي", "female", "leen.h@university.edu", "Leen@2026", "الذكاء الاصطناعي", 1, 4.2, 93, 1.3, 85, 2, 15, ["رياضيات", "برمجة متقدمة"], ["إحصاء"]),
        ]

        conn.executemany(
            """
            INSERT INTO students (
                id, advisor_id, name, gender, email, password, major, year, gpa, attendance, task_time_ratio,
                task_completion, late_logins, incomplete_lectures, strong_skills, weak_skills, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                (
                    sid, advisor_id, name, gender, email, password, major, year, gpa, attendance, task_time_ratio,
                    task_completion, late_logins, incomplete_lectures,
                    json.dumps(strong_skills, ensure_ascii=False),
                    json.dumps(weak_skills, ensure_ascii=False),
                    now,
                    now,
                )
                for (
                    sid, advisor_id, name, gender, email, password, major, year, gpa, attendance, task_time_ratio,
                    task_completion, late_logins, incomplete_lectures, strong_skills, weak_skills
                ) in students
            ],
        )

    # توحيد ملف المستخدم الأساسي حتى لو كانت القاعدة موجودة من تشغيل سابق.
    conn.execute(
        """
        UPDATE students
        SET name=?, gender=?, email=?, password=?, updated_at=?
        WHERE id=?
        """,
        ("أحمد عمار", "male", "ahmad.ammar@university.edu", "Ahmad@2026", now, "44210988"),
    )

    if not _table_has_rows(conn, "courses"):
        conn.executemany(
            """
            INSERT INTO courses (advisor_id, code, name, instructor, fail_rate, avg_grade, enroll_count, severity, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                ("AD-1001", "CS301", "هياكل البيانات", "د. أحمد العمري", 62, "C", 45, "red", now, now),
                ("AD-1001", "PHYS201", "الفيزياء العامة 2", "د. سارة المطيري", 38, "C+", 60, "yellow", now, now),
                ("AD-1002", "STAT101", "الإحصاء التطبيقي", "د. خالد الشهري", 15, "B+", 80, "green", now, now),
            ],
        )

    if not _table_has_rows(conn, "notifications"):
        conn.executemany(
            """
            INSERT INTO notifications (role, type, text, created_at, read)
            VALUES (?, ?, ?, ?, ?)
            """,
            [
                ("advisor", "danger", "أحمد محمود: لم يحضر 3 محاضرات متتالية", now, 0),
                ("advisor", "warning", "نورة سعد: تسجيل دخول في 3:00 فجراً", now, 0),
                ("advisor", "info", "CS301: 60% فشل في الاختبار النصفي (رادار)", now, 0),
                ("student", "danger", "تذكير: تسليم تقرير هياكل البيانات غداً!", now, 0),
                ("student", "info", "تمت مطابقة زميل مناسب لجلسة التوأمة.", now, 0),
            ],
        )

    _seed_features(conn)
