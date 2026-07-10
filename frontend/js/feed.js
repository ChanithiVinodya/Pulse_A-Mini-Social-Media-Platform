import { api, getStoredUser, resolveMediaUrl } from './api.js';
import { requireAuth, getGreeting, logout } from './auth.js';
import { createPostCard } from './components/postCard.js';
import { renderStories } from './components/story.js';
import { renderComments, createCommentElement, setupCommentForm } from './components/comment.js';

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
  setupSearch();
};

const setupNav = () => {
  const user = getStoredUser();
  const usernameEl = document.getElementById('greeting-username');
  const navAvatar = document.getElementById('nav-avatar');

  if (usernameEl) {
    usernameEl.textContent = user?.username || 'Guest';
  }

  if (navAvatar && user) {
    navAvatar.innerHTML = user.avatarUrl
      ? `<img src="http://localhost:5000${user.avatarUrl}" alt="${user.username}">`
      : `<span class="avatar-placeholder">${user.username[0].toUpperCase()}</span>`;
  }

  document.getElementById('logout-btn')?.addEventListener('click', logout);
  document.getElementById('sidebar-logout-btn')?.addEventListener('click', logout);

};

const loadStories = async () => {
  const container = document.getElementById('stories-container');
  if (!container) return;

  try {
    const data = await api.get('/stories');
    renderStories(container, data.storyGroups, getStoredUser(), () => {
      document.getElementById('story-input')?.click();
    }, loadStories);
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
          onSave: (id) => api.post(`/posts/${id}/save`, {}),
          onDelete: post.author.id === getStoredUser()?.id 
            ? (id) => api.delete(`/posts/${id}`) 
            : null,
          onComment: (id) => openCommentModal(id),
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

const setupSearch = () => {
  const modal = document.getElementById('search-modal');
  const navBtn = document.getElementById('nav-search-btn');
  const sidebarBtn = document.getElementById('sidebar-search-btn');
  const bottomBtn = document.getElementById('bottom-search-btn');
  const closeBtn = document.getElementById('close-search-modal');
  const input = document.getElementById('user-search-input');
  const resultsEl = document.getElementById('search-results');

  const openSearch = () => {
    modal?.classList.add('open');
    input?.focus();
  };

  const closeSearch = () => {
    modal?.classList.remove('open');
    input.value = '';
    resultsEl.innerHTML = '<div class="search-empty">Type to search for people</div>';
  };

  navBtn?.addEventListener('click', openSearch);
  sidebarBtn?.addEventListener('click', openSearch);
  bottomBtn?.addEventListener('click', openSearch);
  closeBtn?.addEventListener('click', closeSearch);
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeSearch();
  });

  let debounceTimer;
  input?.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    const query = e.target.value.trim();

    if (!query) {
      resultsEl.innerHTML = '<div class="search-empty">Type to search for people</div>';
      return;
    }

    debounceTimer = setTimeout(async () => {
      try {
        const users = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
        renderSearchResults(users);
      } catch (err) {
        console.error('Search failed:', err.message);
      }
    }, 300);
  });
};

const renderSearchResults = (users) => {
  const resultsEl = document.getElementById('search-results');
  if (!resultsEl) return;

  if (users.length === 0) {
    resultsEl.innerHTML = '<div class="search-empty">No users found</div>';
    return;
  }

  resultsEl.innerHTML = users
    .map(
      (user) => `
    <a href="profile?username=${user.username}" class="search-result-item">
      <div class="avatar avatar-sm">
        ${user.avatarUrl
          ? `<img src="${resolveMediaUrl(user.avatarUrl)}" alt="${user.username}">`
          : `<span class="avatar-placeholder">${user.username[0].toUpperCase()}</span>`
        }
      </div>
      <div class="search-result-info">
        <span class="search-result-username">${user.username} ${user.isVerified ? '<span class="verified-badge">✓</span>' : ''
        }</span>
      </div>
    </a>
  `
    )
    .join('');
};

const openCommentModal = async (postId) => {
  const modal = document.getElementById('comment-modal');
  const listEl = document.getElementById('modal-comments-list');
  const form = document.getElementById('modal-comment-form');
  const closeBtn = document.getElementById('close-comment-modal');

  listEl.innerHTML = '<div class="loader">Loading comments...</div>';
  modal.classList.add('open');

  const closeHandler = () => {
    modal.classList.remove('open');
    closeBtn.removeEventListener('click', closeHandler);
  };
  closeBtn.addEventListener('click', closeHandler);

  try {
    const { comments } = await api.get(`/posts/${postId}/comments`);
    renderComments(listEl, comments, getStoredUser()?.id);

    // Setup form
    setupCommentForm(form, postId, async (id, content) => {
      const comment = await api.post(`/posts/${id}/comments`, { content });
      listEl.querySelector('.no-comments')?.remove();
      listEl.appendChild(createCommentElement(comment, getStoredUser()?.id));
    });
  } catch (err) {
    listEl.innerHTML = `<div class="empty-state error"><p>${err.message}</p></div>`;
  }
};

document.addEventListener('DOMContentLoaded', initFeed);
