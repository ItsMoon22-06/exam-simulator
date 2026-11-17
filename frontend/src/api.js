// Cliente de la API. En producción usa el mismo origen; en desarrollo, el proxy de Vite.
const BASE = import.meta.env.VITE_API_URL || '';

async function request(path, options) {
  const res = await fetch(`${BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'No se pudo completar la solicitud');
  return data;
}

export const api = {
  getExams: () => request('/exams'),
  getExam: (id) => request(`/exams/${id}`),
  submitAttempt: (payload) => request('/attempts', { method: 'POST', body: JSON.stringify(payload) }),
  getUserStats: (username) => request(`/stats/user/${encodeURIComponent(username)}`),
  getRanking: () => request('/stats/ranking'),
  getOverview: () => request('/stats/overview'),
};

export const formatTime = (secs) => {
  const s = Math.max(0, Math.round(secs));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};
