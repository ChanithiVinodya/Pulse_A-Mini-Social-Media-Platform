import { api, getStoredUser } from './api.js';
import { requireAuth, getGreeting, logout } from './auth.js';
import { createPostCard } from './components/postCard.js';
import { renderStories } from './components/story.js';

let currentPage = 1;
let totalPages = 1;
let isLoading = false;

const initFeed = async () => {
  if (!requireAuth()) return;

  setupNav();
  setupCreatePost();
  setupStoryUpload();
  await loadStories();
  await loadFeed(true);
  setupInfiniteScroll();
};

const setupNav = () => {
  const user = getStoredUser();
  const greetingEl = document.getElementById('greeting');
  const navAvatar = document.getElementById('nav-avatar');

  if (greetingEl) {
    greetingEl.textContent = `${getGreeting()}, ${user?.username || 'there'}`;
  }

  if (navAvatar && user) {
    navAvatar.innerHTML = user.avatarUrl
      ? `<img src="http://localhost:5000${user.avatarUrl}" alt="${user.username}">`
      : `<span class="avatar-placeholder">${user.username[0].toUpperCase()}</span>`;
  }

  document.getElementById('logout-btn')?.addEventListener('click', logout);
};

const loadStories = async () => {
  const container = document.getElementById('stories-container');
  if (!container) return;

  try {
    const data = await api.get('/stories');
    renderStories(container, data.storyGroups, getStoredUser(), () => {
      document.getElementById('story-input')?.click();
    });
  } catch (err) {
    console.error('Failed to load stories:', err.message);
  }
};

const loadFeed = async (reset = false) => {
  if (isLoading) return;
  if (!reset && currentPage > totalPages) return;

  isLoading = true;
  const feedEl = document.getElementById('feed-posts');
  const loader = document.getElementById('feed-loader');

  if (reset) {
    currentPage = 1;
    feedEl.innerHTML = '';
  }

  loader?.classList.remove('hidden');

  try {
    const data = await api.get(`/posts?page=${currentPage}&limit=10`);
    totalPages = data.pagination.totalPages;

    if (data.posts.length === 0 && currentPage === 1) {
      feedEl.innerHTML = '<div class="empty-state"><p>Your feed is empty</p><span>Follow people or create your first post!</span></div>';
    }

    for (const post of data.posts) {
      feedEl.appendChild(
        createPostCard(post, {
          onLike: (id) => api.post(`/posts/${id}/like`, {}),
        })
      );
    }

    currentPage++;
  } catch (err) {
    if (currentPage === 1) {
      feedEl.innerHTML = `<div class="empty-state error"><p>${err.message}</p></div>`;
    }
  } finally {
    isLoading = false;
    loader?.classList.add('hidden');
  }
};

const setupInfiniteScroll = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) loadFeed();
    },
    { rootMargin: '200px' }
  );

  const sentinel = document.getElementById('feed-sentinel');
  if (sentinel) observer.observe(sentinel);
};

const setupCreatePost = () => {
  const modal = document.getElementById('create-post-modal');
  const openBtn = document.getElementById('create-post-btn');
  const form = document.getElementById('create-post-form');
  const closeBtn = document.getElementById('close-post-modal');

  openBtn?.addEventListener('click', () => modal?.classList.add('open'));
  closeBtn?.addEventListener('click', () => modal?.classList.remove('open'));
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const submitBtn = form.querySelector('[type="submit"]');

    try {
      submitBtn.disabled = true;
      await api.post('/posts', formData);
      modal.classList.remove('open');
      form.reset();
      await loadFeed(true);
    } catch (err) {
      alert(err.message);
    } finally {
      submitBtn.disabled = false;
    }
  });
};

const setupStoryUpload = () => {
  const input = document.getElementById('story-input');

  input?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('story', file);

    try {
      await api.post('/stories', formData);
      await loadStories();
    } catch (err) {
      alert(err.message);
    } finally {
      input.value = '';
    }
  });
};

document.addEventListener('DOMContentLoaded', initFeed);
