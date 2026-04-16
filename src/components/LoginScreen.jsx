import { useMemo, useState } from 'react';
import { GraduationCap, UserCircle2, LockKeyhole, AtSign, IdCard, LogIn } from 'lucide-react';
import logo from '../assets/logo.png';
import { authenticateUser, getLoginDemoAccounts } from '../services/mockEngine';

export default function LoginScreen({ onLogin }) {
  const [role, setRole] = useState('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const demoAccounts = useMemo(() => getLoginDemoAccounts(), []);
  const accountsByRole = demoAccounts.filter((item) => item.role === role);

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = authenticateUser(role, identifier, password);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setError('');
    onLogin(result.user);
  };

  const fillDemoAccount = (account) => {
    setRole(account.role);
    setIdentifier(account.login);
    setPassword(account.password);
    setError('');
  };

  return (
    <div className="login-shell">
      <div className="login-bg-orb orb-a" />
      <div className="login-bg-orb orb-b" />

      <div className="login-container glass animate-scale-in">
        <div className="login-brand">
          <img src={logo} alt="راصد بلس" />
          <h1>تسجيل الدخول</h1>
          <p>اختر الدور أولاً ثم سجّل الدخول كطالب أو مرشد</p>
        </div>

        <div className="login-role-switcher">
          <button
            type="button"
            className={`role-btn ${role === 'student' ? 'active' : 'inactive'}`}
            onClick={() => {
              setRole('student');
              setError('');
            }}
          >
            <UserCircle2 size={16} /> طالب
          </button>
          <button
            type="button"
            className={`role-btn ${role === 'advisor' ? 'active' : 'inactive'}`}
            onClick={() => {
              setRole('advisor');
              setError('');
            }}
          >
            <GraduationCap size={16} /> مرشد
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            <span>{role === 'advisor' ? 'البريد أو رقم المرشد' : 'البريد أو الرقم الجامعي'}</span>
            <div className="login-input-wrap">
              {role === 'advisor' ? <AtSign size={16} /> : <IdCard size={16} />}
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={role === 'advisor' ? 'khaled.advisor@university.edu أو AD-1001' : 'sara.k@university.edu أو 44210988'}
              />
            </div>
          </label>

          <label>
            <span>كلمة المرور</span>
            <div className="login-input-wrap">
              <LockKeyhole size={16} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ادخل كلمة المرور"
              />
            </div>
          </label>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="btn btn-primary login-submit">
            <LogIn size={16} /> دخول إلى النظام
          </button>
        </form>

        <div className="demo-box">
          <h3>بيانات دخول جاهزة</h3>
          <p>يمكنك الضغط على أي حساب لتعبئة الحقول تلقائياً:</p>
          <div className="demo-list">
            {accountsByRole.map((account) => (
              <button
                key={`${account.role}-${account.login}`}
                type="button"
                className="demo-account"
                onClick={() => fillDemoAccount(account)}
              >
                <strong>{account.name}</strong>
                <span>{account.login}</span>
                <span>{account.altLogin}</span>
                <span>كلمة المرور: {account.password}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
