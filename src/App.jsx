import { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ShieldAlert, 
  BrainCircuit, 
  TrendingUp, 
  Search,
  Bell,
  Mail,
  Zap,
  GraduationCap
} from 'lucide-react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const students = [
    { id: 1, name: 'أحمد محمود', idNumber: '44120345', risk: 'danger', issue: 'انخفاض مفاجئ في الحضور وفشل في تسليم واجبين', gpa: 2.1 },
    { id: 2, name: 'سارة خالد', idNumber: '44210988', risk: 'warning', issue: 'تستغرق 3 أضعاف الوقت المتوقع في مهام البرمجة', gpa: 3.4 },
    { id: 3, name: 'فهد عبدالله', idNumber: '43990122', risk: 'success', issue: 'مسار سليم', gpa: 4.8 },
    { id: 4, name: 'نورة سعد', idNumber: '44112340', risk: 'danger', issue: 'سلوك رقمي مقلق (تسجيل دخول متأخر بشكل يومي)', gpa: 2.5 },
  ];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar glass-panel fade-in">
        <div className="brand">
          <div className="brand-icon">
            <BrainCircuit size={28} color="white" />
          </div>
          <span className="text-gradient">راصد بلس</span>
        </div>

        <nav className="nav-menu">
          <a className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={20} />
            لوحة القيادة
          </a>
          <a className={`nav-item ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>
            <Users size={20} />
            الطلاب
          </a>
          <a className={`nav-item ${activeTab === 'interventions' ? 'active' : ''}`} onClick={() => setActiveTab('interventions')}>
            <ShieldAlert size={20} />
            التدخلات العلاجية
          </a>
          <a className={`nav-item ${activeTab === 'radar' ? 'active' : ''}`} onClick={() => setActiveTab('radar')}>
            <TrendingUp size={20} />
            رادار المناهج
          </a>
        </nav>

        <div className="ai-recommendation mt-auto">
          <div className="ai-title">
            <Zap size={18} />
            <span>توصية Copilot</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#CBD5E1', lineHeight: '1.5' }}>
            لاحظنا انخفاض بنسبة 15% في درجات اختبار الفيزياء النصفي. اقترحنا جدولة مراجعة عامة قبل الاختبار النهائي.
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header fade-in delay-100">
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>مرحباً بك، د. خالد 👋</h1>
            <p style={{ color: '#94A3B8', marginTop: '0.5rem' }}>إليك نظرة عامة على حالة الطلاب اليوم</p>
          </div>
          <div className="user-profile">
            <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Search size={20} color="#94A3B8" />
              <Bell size={20} color="#94A3B8" />
            </div>
            <div className="avatar">خ</div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="stats-grid fade-in delay-200">
          <div className="stat-card glass-panel">
            <div className="stat-header">
              <span>إجمالي الطلاب</span>
              <div className="stat-icon success"><Users size={24} /></div>
            </div>
            <div className="stat-value">1,248</div>
            <div style={{ color: '#10B981', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <TrendingUp size={16} /> +12 هذا الفصل
            </div>
          </div>

          <div className="stat-card glass-panel">
            <div className="stat-header">
              <span>حالات تستدعي التدخل اليوم</span>
              <div className="stat-icon danger"><ShieldAlert size={24} /></div>
            </div>
            <div className="stat-value" style={{ color: '#EF4444' }}>8</div>
            <div style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
              4 أكاديمي • 2 سلوكي • 2 قلق امتحان
            </div>
          </div>

          <div className="stat-card glass-panel">
            <div className="stat-header">
              <span>تدخلات ناجحة (هذا الشهر)</span>
              <div className="stat-icon success"><GraduationCap size={24} /></div>
            </div>
            <div className="stat-value">34</div>
            <div style={{ color: '#10B981', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <TrendingUp size={16} /> نسبة النجاح 88%
            </div>
          </div>
        </div>

        {/* Features / Main Dashboard */}
        <div className="dashboard-features fade-in delay-300">
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div className="panel-header">
              <span>الفرز الذكي (Smart Triage)</span>
              <button className="action-btn secondary" style={{ fontSize: '0.9rem' }}>عرض الكل</button>
            </div>
            <div className="students-list">
              {students.map((student) => (
                <div key={student.id} className="student-row">
                  <div className="student-info">
                    <div className={`indicator ${student.risk}`}></div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{student.name}</div>
                      <div style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        {student.idNumber} | المعدل: {student.gpa}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ flex: 1, margin: '0 2rem', color: '#CBD5E1', fontSize: '0.9rem' }}>
                    {student.issue}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {student.risk === 'danger' && (
                      <button className="action-btn">
                        <Mail size={16} /> خطة تدخل جاهزة
                      </button>
                    )}
                    {student.risk === 'warning' && (
                      <button className="action-btn secondary">
                        <Users size={16} /> توأمة أكاديمية
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div className="panel-header">
              <span>مؤشرات Copilot الذكية</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div className="ai-recommendation" style={{ margin: 0 }}>
                <div className="ai-title">
                  <BrainCircuit size={18} />
                  <span>توجيه تكيفي (Adaptive Routing)</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#CBD5E1' }}>
                  تم تحويل 45 طالب من قراءة المرجع النصي إلى بودكاست ملخص بسبب بطء الاستيعاب الملحوظ هذا الأسبوع.
                </p>
              </div>

              <div className="ai-recommendation" style={{ margin: 0, background: 'rgba(245, 158, 11, 0.05)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
                <div className="ai-title" style={{ color: '#F59E0B' }}>
                  <TrendingUp size={18} />
                  <span>رادار عنق الزجاجة (Curriculum Radar)</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#CBD5E1' }}>
                  تنبيه: مادة الخوارزميات (CS301) تشهد نسبة فشل تزيد عن 60% في مهام الفرز المتوقع. المشكلة قد تكون في طريقة التدريس.
                </p>
              </div>

              <div className="ai-recommendation" style={{ margin: 0, background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                <div className="ai-title" style={{ color: '#10B981' }}>
                  <Zap size={18} />
                  <span>التنبؤ بسوق العمل (Skill-to-Market)</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#CBD5E1' }}>
                  تم اقتراح دورة Node.js متقدمة لـ 12 طالب ذوي أداء ممتاز في برمجة الويب لزيادة فرص الجاهزية الوظيفية.
                </p>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
