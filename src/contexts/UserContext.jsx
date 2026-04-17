/* eslint-disable react-refresh/only-export-components */
/**
 * contexts/UserContext.jsx — سياق المستخدم العالمي
 *
 * يدير بيانات المستخدم المسجل (الاسم، الجنس، الدور، الـ ID)
 * ويوفر دالة byGender ديناميكية في كل الواجهات.
 *
 * الطالب الأساسي: محمد عمار (ذكر)
 */

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { byGender as _byGender, verbByGender as _verbByGender } from '../utils/localization';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const gender = user?.gender || 'male';
  const role = user?.role || 'student';
  const name = user?.name || (role === 'advisor' ? 'د. خالد' : 'محمد عمار');
  const displayName = name.split(' ')[0];

  const genderText = useCallback((maleText, femaleText) => {
    return _byGender(gender, maleText, femaleText);
  }, [gender]);

  const genderVerb = useCallback((maleVerb, femaleVerb) => {
    return _verbByGender(gender, maleVerb, femaleVerb);
  }, [gender]);

  const ctx = useMemo(() => ({
    user,
    role,
    gender,
    name,
    displayName,
    isLoggedIn: !!user,
    login,
    logout,
    genderText,
    genderVerb,
  }), [user, role, gender, name, displayName, login, logout, genderText, genderVerb]);

  return (
    <UserContext.Provider value={ctx}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}

export default UserContext;
