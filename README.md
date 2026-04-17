# راصد بلس - Full Stack Edition

تم تحويل المشروع إلى نظام متكامل يعمل بقاعدة بيانات حقيقية وسيرفر FastAPI وربط فعلي مع React.

## المعمارية

- Frontend: React + Vite
- Backend: FastAPI (Python)
- Database: SQLite (ملف محلي `backend/rassed_plus.db`)
- API Integration: Fetch عبر `src/services/api.js`

## ما تم تنفيذه

- Schema SQL حقيقية تضم:
  - `students`
  - `courses`
  - `advisors`
  - `ai_logs`
  - جداول تشغيل إضافية: `notifications`, `feature_flags`
- CRUD كامل لـ Students / Courses / Advisors / AI Logs.
- Login حقيقي عبر API.
- ربط أزرار رئيسية بطلبات حقيقية:
  - `خطة تدخل` -> `POST /api/interventions/generate`
  - `توأمة` -> `POST /api/matchmaking/request`
  - تحديث تقدم المهام -> `POST /api/student/tasks/{student_id}/progress`
- إضافة واجهة `Features Hub` تضم 100 ميزة (40 طالب + 30 مرشد/جامعة + 30 AI) مع تفعيل/تعطيل مباشر وتخزين في قاعدة البيانات.

<<<<<<< HEAD
=======

>>>>>>> origin/main
## تشغيل الباك إند

من داخل مجلد `backend`:

```bash
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

> يمكنك أيضا استخدام الأمر المختصر بعد إضافة Scripts للـ PATH:

```bash
uvicorn main:app --host 127.0.0.1 --port 8000
```

## تشغيل الفرونت إند

من جذر المشروع:

```bash
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

إذا كان المنفذ 5173 مستخدمًا سيختار Vite منفذًا آخر تلقائيًا.

## بيانات دخول جاهزة

### مرشد
- البريد: `khaled.advisor@university.edu`
- رقم المرشد: `AD-1001`
- كلمة المرور: `Advisor@2026`

### طالب
- البريد: `ahmad.ammar@university.edu`
- الرقم الجامعي: `44210988`
- كلمة المرور: `Ahmad@2026`

## ملفات أساسية

- `backend/database.py`: تهيئة قاعدة البيانات + Schema + Seed Data
- `backend/main.py`: FastAPI + CRUD + Integration Endpoints
- `src/services/api.js`: طبقة API للفرونت
- `src/components/FeaturesHub.jsx`: مركز الميزات الأسطورية (100 ميزة)
- `src/components/AdvisorDashboard.jsx`: لوحة المرشد مرتبطة بالـ API
- `src/components/StudentDashboard.jsx`: لوحة الطالب مرتبطة بالـ API
- `src/components/LoginScreen.jsx`: تسجيل دخول فعلي من السيرفر
- `src/components/InterventionModal.jsx`: توليد خطة تدخل من الخادم
- `src/components/NotificationsPanel.jsx`: إشعارات حقيقية من قاعدة البيانات
