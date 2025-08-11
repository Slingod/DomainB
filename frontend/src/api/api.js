import axios from 'axios';

// ---- Helper cookies (sans regex) ----
function getCookie(name) {
  const raw = document.cookie || '';
  if (!raw) return '';
  const parts = raw.split('; ');
  for (const part of parts) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const k = part.slice(0, eq);
    const v = part.slice(eq + 1);
    if (k === name) return decodeURIComponent(v);
  }
  return '';
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true
});

// ---- Fonction d'amorçage/récup CSRF (réessaie si cookie absent) ----
async function ensureCsrf() {
  const has = !!getCookie('csrf_token');
  if (has) return;
  try {
    await api.get('/auth/csrf'); // pose le cookie
  } catch {
    // silencieux; on réessaiera à la prochaine requête mutante si besoin
  }
}

// ---- Interceptor requêtes : ajoute X-CSRF-Token sur méthodes mutantes ----
api.interceptors.request.use(
  async (config) => {
    const method = (config.method || 'get').toLowerCase();
    if (['post', 'put', 'patch', 'delete'].includes(method)) {
      await ensureCsrf(); // s'assure que le cookie existe
      const csrf = getCookie('csrf_token');
      if (csrf) {
        if (!config.headers) config.headers = {};
        config.headers['X-CSRF-Token'] = csrf;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Interceptor réponses : refresh UNIQUEMENT si token expiré ----
let refreshing = null;
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const { config, response } = error || {};
    const code = response?.data?.error;

    const shouldTryRefresh =
      response?.status === 401 &&
      !config.__isRetry &&
      code === 'token_expired';

    if (shouldTryRefresh) {
      try {
        refreshing = refreshing || api.post('/auth/refresh');
        await refreshing;
        refreshing = null;
        config.__isRetry = true;
        return api(config);
      } catch {
        refreshing = null;
      }
    }
    return Promise.reject(error);
  }
);

export default api;