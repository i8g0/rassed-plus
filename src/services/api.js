const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = 'حدث خطأ في الاتصال بالخادم';
    try {
      const data = await response.json();
      message = data.detail || message;
    } catch {
      // noop
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

export async function getDemoAccounts() {
  return request('/api/demo-accounts');
}

export async function login(role, identifier, password) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ role, identifier, password }),
  });
}

export async function getNotifications(role) {
  return request(`/api/notifications?role=${encodeURIComponent(role)}`);
}

export async function getAdvisorOverview() {
  return request('/api/advisor/overview');
}

export async function getInterventions() {
  return request('/api/interventions');
}

export async function generateIntervention(studentId, advisorId) {
  return request('/api/interventions/generate', {
    method: 'POST',
    body: JSON.stringify({ student_id: studentId, advisor_id: advisorId }),
  });
}

export async function requestPeerMatch(requesterId, weakSkill) {
  return request('/api/matchmaking/request', {
    method: 'POST',
    body: JSON.stringify({ requester_id: requesterId, weak_skill: weakSkill }),
  });
}

export async function getStudentDashboard(studentId) {
  return request(`/api/student/dashboard/${encodeURIComponent(studentId)}`);
}

export async function updateStudentTaskProgress(studentId, progress) {
  return request(`/api/student/tasks/${encodeURIComponent(studentId)}/progress?progress=${progress}`, {
    method: 'POST',
  });
}

export async function createAiLog(payload) {
  return request('/api/ai-logs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getFeatures() {
  return request('/api/features');
}

export async function toggleFeature(code, enabled) {
  return request(`/api/features/${encodeURIComponent(code)}/toggle`, {
    method: 'POST',
    body: JSON.stringify({ enabled }),
  });
}
