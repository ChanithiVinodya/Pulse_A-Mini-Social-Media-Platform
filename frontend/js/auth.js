import {
  api,
  setToken,
  clearToken,
  getToken,
  setStoredUser,
  clearStoredUser,
} from './api.js';

const requireAuth = () => {
  if (!getToken()) {
    window.location.href = '../pages/login.html';
    return false;
  }
  return true;
};

const redirectIfAuthenticated = () => {
  if (getToken()) {
    window.location.href = '../pages/feed.html';
  }
};

const handleLogin = async (e) => {
  e.preventDefault();
  const form = e.target;
  const errorEl = document.getElementById('auth-error');
  const submitBtn = form.querySelector('[type="submit"]');

  const email = form.email.value;
  const password = form.password.value;

  try {
    submitBtn.disabled = true;
    errorEl.textContent = '';

    const data = await api.post('/auth/login', { email, password }, { skipAuth: true });
    setToken(data.token);
    setStoredUser(data.user);
    window.location.href = '../pages/feed.html';
  } catch (err) {
    errorEl.textContent = err.message;
  } finally {
    submitBtn.disabled = false;
  }
};

const handleRegister = async (e) => {
  e.preventDefault();
  const form = e.target;
  const errorEl = document.getElementById('auth-error');
  const submitBtn = form.querySelector('[type="submit"]');

  const username = form.username.value;
  const email = form.email.value;
  const password = form.password.value;

  try {
    submitBtn.disabled = true;
    errorEl.textContent = '';

    const data = await api.post(
      '/auth/register',
      { username, email, password },
      { skipAuth: true }
    );
    setToken(data.token);
    setStoredUser(data.user);
    window.location.href = '../pages/feed.html';
  } catch (err) {
    errorEl.textContent = err.message;
  } finally {
    submitBtn.disabled = false;
  }
};

const logout = async () => {
  try {
    await api.post('/auth/logout', {});
  } catch {
    // Client-side logout is sufficient for stateless JWT
  }
  clearToken();
  clearStoredUser();
  window.location.href = '../pages/login.html';
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

export {
  requireAuth,
  redirectIfAuthenticated,
  handleLogin,
  handleRegister,
  logout,
  getGreeting,
};
