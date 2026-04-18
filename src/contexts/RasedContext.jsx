/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getStudentDashboard,
  getAdvisorOverview,
  requestPeerMatch,
  updateStudentTaskProgress,
  getAdaptiveTaskContent,
  getInterventions,
  generateIntervention
} from '../services/api';
import { executeMagicAutomation, runAICoreLogic } from '../services/AI-Core-Logic';
import { useUser } from './UserContext';

const RasedContext = createContext();

export function RasedProvider({ children }) {
  const { user, role } = useUser();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Workflows states
  const [matchLoading, setMatchLoading] = useState({});
  const [adaptiveLoading, setAdaptiveLoading] = useState({});
  const [automation, setAutomation] = useState({
    loading: false,
    lastScanAt: null,
    triageTop3: [],
    proactiveAlerts: [],
    twinningSuggestions: [],
    criticalReports: [],
    actionCommands: [],
    uiState: { highlightStudentIds: [], alertCourseCodes: [] },
    aiOverlay: null,
    dispatchedCommands: [],
  });

  // 1. جلب البيانات المركزية للطالب
  const fetchDashboard = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (role === 'student') {
        const data = await getStudentDashboard(user.id);
        setDashboardData(data);
      } else if (role === 'advisor') {
        const overview = await getAdvisorOverview(user.id);
        const invs = await getInterventions(user.id);
        setDashboardData({ overview, interventions: invs });
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('تعذر تحميل البيانات. الملقم قد يكون غير متصل.');
    } finally {
      setLoading(false);
    }
  }, [user, role]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // 2. مسار عمل التوأمة (Peer Matchmaking Workflow)
  const triggerPeerMatch = async (requesterId, weakSkill, preferredPeerId = null) => {
    const targetId = requesterId || user?.id;
    if (!targetId) {
      return { ok: false, message: 'تعذر بدء التوأمة: معرف الطالب غير متوفر.' };
    }

    setMatchLoading(prev => ({ ...prev, [targetId]: true }));
    try {
      const result = await requestPeerMatch(targetId, weakSkill, preferredPeerId);

      setDashboardData(prev => {
        if (!prev) return prev;

        if (Array.isArray(prev.peers)) {
          return {
            ...prev,
            peers: prev.peers.map((p) =>
              p.id === result?.match?.id ? { ...p, requested: true } : p
            ),
          };
        }

        if (prev.overview?.students) {
          return {
            ...prev,
            overview: {
              ...prev.overview,
              students: prev.overview.students.map((s) =>
                s.id === targetId
                  ? {
                      ...s,
                      peerMatchStatus: result?.match ? 'matched' : 'pending',
                      peerMatchName: result?.match?.name || null,
                    }
                  : s
              ),
            },
          };
        }

        return prev;
      });
      return result;
    } catch (err) {
      console.error('فشل طلب التوأمة:', err);
      return { message: 'عذراً، تعذر إتمام طلب التوأمة حالياً.' };
    } finally {
      setMatchLoading(prev => ({ ...prev, [targetId]: false }));
    }
  };

  // 3. مسار التوجيه التكيفي (Adaptive Routing Workflow)
  const triggerAdaptiveRouting = async (taskId, taskTitle, type) => {
    setAdaptiveLoading(prev => ({ ...prev, [taskId]: true }));
    try {
      // Real AI Generation via Gemini
      const aiContent = await getAdaptiveTaskContent(taskTitle, type);
      return aiContent;
    } catch (err) {
      console.error('فشل توليد التوجيه التكيفي:', err);
      return 'عذراً، تعذر توليد المحتوى التكيفي. يرجى المحاولة لاحقاً.';
    } finally {
      setAdaptiveLoading(prev => ({ ...prev, [taskId]: false }));
    }
  };

  // 4. مسار تحديث المهام (Task Progress Workflow)
  const updateTask = async (taskId, newProgress) => {
    try {
      await updateStudentTaskProgress(user?.id, newProgress);
      // Optimistic Update
      setDashboardData(prev => {
        if (!prev) return prev;
        const nextCompletion = Math.min(100, (prev?.student?.completionRate || 0) + 5);
        return {
          ...prev,
          student: {
            ...prev?.student,
            completionRate: nextCompletion,
            taskCompletion: nextCompletion,
          }
        };
      });
    } catch(err) {
      console.error(err);
    }
  };

  const runSystemDiagnostic = useCallback(async () => {
    if (!user) return false;

    try {
      const diagnosticStudentId = 'SCS25001';

      const workflow1 = await getStudentDashboard(diagnosticStudentId);
      const workflow2 = await requestPeerMatch(diagnosticStudentId, 'Data Structures');
      const workflow3 = await generateIntervention(diagnosticStudentId, user?.id || 'sys');

      const isHealthy = Boolean(workflow1?.student)
        && Boolean(workflow2?.ok)
        && Boolean(workflow3?.actionPlan?.length);

      if (isHealthy) {
        console.info('✅ System Workflows are 100% Operational');
      } else {
        console.warn('⚠️ System diagnostic returned partial results.');
      }

      return isHealthy;
    } catch (err) {
      console.error('System diagnostic failed:', err);
      return false;
    }
  }, [user]);

  const runAutonomousScan = useCallback(async (visibleState = {}) => {
    if (role !== 'advisor') return null;

    const sourceStudents = dashboardData?.overview?.students;
    if (!Array.isArray(sourceStudents) || sourceStudents.length === 0) {
      return null;
    }

    setAutomation((prev) => ({ ...prev, loading: true }));
    try {
      // Thinking delay to visualize deep analysis in the dashboard.
      await new Promise((resolve) => setTimeout(resolve, 900));
      const result = await runAICoreLogic({ students: sourceStudents, visibleState });
      setAutomation((prev) => ({
        ...prev,
        loading: false,
        lastScanAt: new Date().toISOString(),
        triageTop3: result?.triageTop3 || [],
        proactiveAlerts: result?.proactiveAlerts || [],
        twinningSuggestions: result?.twinningSuggestions || [],
        criticalReports: result?.criticalReports || [],
        actionCommands: result?.actionCommands || [],
        uiState: result?.uiState || { highlightStudentIds: [], alertCourseCodes: [] },
        aiOverlay: result?.aiOverlay || null,
      }));
      return result;
    } catch (err) {
      console.error('Autonomous scan failed:', err);
      setAutomation((prev) => ({ ...prev, loading: false }));
      return null;
    }
  }, [dashboardData, role]);

  const runMagicAutomation = useCallback(() => {
    const selected = executeMagicAutomation(automation);
    setAutomation((prev) => ({ ...prev, dispatchedCommands: selected }));
    return selected;
  }, [automation]);

  useEffect(() => {
    if (role !== 'advisor') return;
    if (!dashboardData?.overview?.students?.length) return;
    runAutonomousScan({ activeView: 'dashboard' });
  }, [dashboardData, role, runAutonomousScan]);

  // 5. مسار التدخل الأكاديمي (Intervention Generation Workflow)
  const triggerGenerateIntervention = async (studentId) => {
    try {
      // Generate actual plan connected to Gemini AI via api.js fallback
      const plan = await generateIntervention(studentId, user?.id || 'sys');
      
      // Update local state optimistic
      setDashboardData(prev => {
        if (!prev || role !== 'advisor') return prev;
        const newInvs = prev.interventions ? [plan, ...prev.interventions] : [plan];
        return { ...prev, interventions: newInvs };
      });
      return plan;
    } catch(err) {
      console.error('فشل توليد خطة التدخل:', err);
      return {
        id: `INV-fallback`,
        emailSubject: 'خطة دعم أكاديمي',
        emailBody: 'عذراً، تعذر توليد الخطة تلقائياً. يرجى المحاولة لاحقاً أو كتابة الخطة يدوياً.',
        actionPlan: [{ step: '01', action: 'إعادة المحاولة', timeline: 'الآن', owner: 'المرشد' }],
        followUpDate: 'غير محدد',
        status: 'draft'
      };
    }
  };

  return (
    <RasedContext.Provider
      value={{
        dashboardData,
        loading,
        error,
        refreshDashboard: fetchDashboard,
        
        // Workflows
        triggerPeerMatch,
        triggerAdaptiveRouting,
        updateTask,
        triggerGenerateIntervention,
        runSystemDiagnostic,
        runAutonomousScan,
        runMagicAutomation,
        
        // Loading States
        matchLoading,
        adaptiveLoading,
        automation,
      }}
    >
      {children}
    </RasedContext.Provider>
  );
}

export const useRased = () => useContext(RasedContext);
