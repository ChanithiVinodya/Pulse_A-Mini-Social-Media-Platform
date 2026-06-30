const API_BASE = 'http://localhost:5000/api';
const UPLOAD_BASE = 'http://localhost:5000';

const getToken = () => localStorage.getItem('pulse_token');
const setToken = (token) => localStorage.setItem('pulse_token', token);
const clearToken = () => localStorage.removeItem('pulse_token');

const getStoredUser = () => {
  const raw = localStorage.getItem('pulse_user');
  return raw ? JSON.parse(raw) : null;
};

const setStoredUser = (user) => {
  localStorage.setItem('pulse_user', JSON.stringify(user));
};

const clearStoredUser = () => localStorage.removeItem('pulse_user');

const resolveMediaUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${UPLOAD_BASE}${url}`;
};

const request = async (endpoint, options = {}) => {
  const headers = { ...(options.headers || {}) };
  const token = getToken();

  if (token && !options.skipAuth) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
};

const api = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) =>
    request(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: (endpoint, body, options) =>
    request(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
};

export {
  API_BASE,
  UPLOAD_BASE,
  api,
  getToken,
  setToken,
  clearToken,
  getStoredUser,
  setStoredUser,
  clearStoredUser,
  resolveMediaUrl,
};
