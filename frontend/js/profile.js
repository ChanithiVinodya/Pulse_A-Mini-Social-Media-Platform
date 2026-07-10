import { api, getStoredUser, resolveMediaUrl } from './api.js';
import { requireAuth, logout } from './auth.js';

const initProfile = async () => {
  if (!requireAuth()) return;

  const params = new URLSearchParams(window.location.search);
  const username = params.get('username') || getStoredUser()?.username;

  if (!username) {
    window.location.href = 'feed.html';
    return;
  }

  setupSearch();

  document.getElementById('logout-btn')?.addEventListener('click', logout);
  document.getElementById('sidebar-logout-btn')?.addEventListener('click', logout);
  document.getElementById('bottom-logout-btn')?.addEventListener('click', logout);


  try {
    const profile = await api.get(`/users/${username}`);
    renderProfile(profile);
  } catch (err) {
    document.getElementById('profile-content').innerHTML =
      `<div class="empty-state error"><p>${err.message}</p></div>`;
  }
};

const renderProfile = (profile) => {
  const content = document.getElementById('profile-content');
  const avatarSrc = resolveMediaUrl(profile.avatarUrl);

  content.innerHTML = `
    <section class="profile-header">
      <div class="profile-avatar-wrap">
        <div class="avatar avatar-lg">
          ${avatarSrc
      ? `<img src="${avatarSrc}" alt="${profile.username}">`
      : `<span class="avatar-placeholder">${profile.username[0].toUpperCase()}</span>`}
        </div>
      </div>
      
      <div class="profile-name-row">
        <h1 class="profile-username">
          ${profile.username}
          ${profile.isVerified ? '<span class="verified-badge">✓</span>' : ''}
        </h1>
        <span class="profile-handle">@${profile.username.toLowerCase()}</span>
      </div>

      <div class="profile-stats">
        <div class="stat-item" id="following-stats">
          <span class="stat-value">${profile.followingCount}</span>
          <span class="stat-label">Following</span>
        </div>
        <div class="stat-item" id="followers-stats">
          <span class="stat-value">${profile.followersCount}</span>
          <span class="stat-label">Followers</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">${profile.likesReceived}</span>
          <span class="stat-label">Likes</span>
        </div>
      </div>

      <div class="profile-actions" id="profile-actions"></div>

      ${profile.bio ? `<p class="profile-bio" style="margin-top: 20px; max-width: 400px; font-size: 0.9375rem; color: var(--text-dim);">${escapeHtml(profile.bio)}</p>` : ''}
    </section>

    <div class="profile-tabs">
      <button class="profile-tab active" id="tab-posts">Post</button>
      <button class="profile-tab" id="tab-tags">Tags</button>
      ${profile.isOwnProfile ? `
      <button class="profile-tab" id="tab-private">Private</button>
      <button class="profile-tab" id="tab-saved">Save</button>
      ` : ''}
    </div>

    <section class="profile-grid" id="profile-grid"></section>
  `;

  setupProfileActions(profile);
  setupFollowStatsListeners(profile);
  if (profile.isOwnProfile) setupTabListeners(profile);

  renderPosts(profile.posts);
};

const setupTabListeners = (profile) => {
  const postsTab = document.getElementById('tab-posts');
  const savedTab = document.getElementById('tab-saved');

  postsTab?.addEventListener('click', () => {
    postsTab.classList.add('active');
    savedTab.classList.remove('active');
    renderPosts(profile.posts);
  });

  savedTab?.addEventListener('click', async () => {
    savedTab.classList.add('active');
    postsTab.classList.remove('active');
    document.getElementById('profile-grid').innerHTML = '<div class="loader">Loading saved posts...</div>';
    try {
      const savedPosts = await api.get('/users/me/saved');
      renderPosts(savedPosts, 'saved');
    } catch (err) {
      document.getElementById('profile-grid').innerHTML = `<div class="empty-state error"><p>${err.message}</p></div>`;
    }
  });
};

const renderPosts = (posts, type = 'posts') => {
  const grid = document.getElementById('profile-grid');
  if (!grid) return;

  if (posts.length === 0) {
    grid.innerHTML = `<div class="empty-state"><p>${type === 'posts' ? 'No posts yet' : 'No saved posts yet'}</p></div>`;
    return;
  }

  grid.innerHTML = '';
  for (const post of posts) {
    const item = document.createElement('a');
    item.href = `post.html?id=${post.id}`;
    item.className = 'grid-item';

    const imgSrc = resolveMediaUrl(post.imageUrl);
    if (imgSrc) {
      item.innerHTML = `<img src="${imgSrc}" alt="Post">`;
    } else {
      item.innerHTML = `<div class="grid-text">${escapeHtml(post.content.slice(0, 80))}</div>`;
    }
    grid.appendChild(item);
  }
};

const setupProfileActions = (profile) => {
  const actionsEl = document.getElementById('profile-actions');

  if (profile.isOwnProfile) {
    actionsEl.innerHTML = `<button class="btn btn-outline" id="edit-profile-btn">Edit Profile</button>`;
    document.getElementById('edit-profile-btn').addEventListener('click', () => openEditModal(profile));
  } else {
    actionsEl.innerHTML = `
      <button class="btn ${profile.isFollowing ? 'btn-outline' : 'btn-primary'}" id="follow-btn">
        ${profile.isFollowing ? 'Unfollow' : 'Follow'}
      </button>
      <button class="btn btn-outline" id="message-btn">Message</button>
    `;
    document.getElementById('follow-btn').addEventListener('click', () => toggleFollow(profile));
    document.getElementById('message-btn').addEventListener('click', () => {
      window.location.href = `messages.html?userId=${profile.id}`;
    });
  }
};

const toggleFollow = async (profile) => {
  const btn = document.getElementById('follow-btn');
  btn.disabled = true;

  try {
    const result = await api.post(`/users/${profile.id}/follow`, {});
    profile.isFollowing = result.following;
    btn.textContent = result.following ? 'Unfollow' : 'Follow';
    btn.className = `btn ${result.following ? 'btn-outline' : 'btn-primary'}`;

    const statsEl = document.querySelector('.profile-stats');
    if (statsEl) {
      const spans = statsEl.querySelectorAll('span');
      spans[1].innerHTML = `<strong>${result.followersCount}</strong> followers`;
    }
  } catch (err) {
    alert(err.message);
  } finally {
    btn.disabled = false;
  }
};

const openEditModal = (profile) => {
  let modal = document.getElementById('edit-profile-modal');

  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'edit-profile-modal';
    modal.className = 'modal';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Edit Profile</h2>
        <button class="modal-close" id="close-edit-modal">&times;</button>
      </div>
      <form id="edit-profile-form" enctype="multipart/form-data">
        <div class="form-group">
          <label for="edit-username">Username</label>
          <input type="text" id="edit-username" name="username" value="${profile.username}" required>
        </div>
        <div class="form-group">
          <label for="edit-bio">Bio</label>
          <textarea id="edit-bio" name="bio" rows="3" maxlength="500">${profile.bio || ''}</textarea>
        </div>
        <div class="form-group">
          <label for="edit-avatar">Avatar</label>
          <input type="file" id="edit-avatar" name="avatar" accept="image/*">
        </div>
        <button type="submit" class="btn btn-primary btn-full">Save Changes</button>
      </form>
    </div>
  `;

  modal.classList.add('open');

  modal.querySelector('#close-edit-modal').addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });

  modal.querySelector('#edit-profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData();
    formData.append('username', form.username.value);
    formData.append('bio', form.bio.value);
    if (form.avatar.files[0]) {
      formData.append('avatar', form.avatar.files[0]);
    }

    try {
      const updated = await api.put('/users/me', formData);
      const stored = getStoredUser();
      if (stored) {
        localStorage.setItem('pulse_user', JSON.stringify({ ...stored, ...updated }));
      }
      modal.classList.remove('open');
      window.location.reload();
    } catch (err) {
      alert(err.message);
    }
  });
};

const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

const setupSearch = () => {
  const modal = document.getElementById('search-modal');
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

const setupFollowStatsListeners = (profile) => {
  const followersBtn = document.getElementById('followers-stats');
  const followingBtn = document.getElementById('following-stats');
  const modal = document.getElementById('follow-modal');
  const closeBtn = document.getElementById('close-follow-modal');

  followersBtn?.addEventListener('click', () => openFollowModal(profile, 'followers'));
  followingBtn?.addEventListener('click', () => openFollowModal(profile, 'following'));

  closeBtn?.addEventListener('click', () => modal.classList.remove('open'));
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });
};

const openFollowModal = async (profile, type) => {
  const modal = document.getElementById('follow-modal');
  const title = document.getElementById('follow-modal-title');
  const listEl = document.getElementById('follow-modal-list');

  title.textContent = type === 'followers' ? 'Followers' : 'Following';
  listEl.innerHTML = '<div class="loader">Loading...</div>';
  modal.classList.add('open');

  try {
    const users = await api.get(`/users/${profile.id}/${type}`);
    renderFollowList(users);
  } catch (err) {
    listEl.innerHTML = `<div class="empty-state error"><p>${err.message}</p></div>`;
  }
};

const renderFollowList = (users) => {
  const listEl = document.getElementById('follow-modal-list');
  if (users.length === 0) {
    listEl.innerHTML = '<div class="empty-state"><p>No users to show</p></div>';
    return;
  }

  listEl.innerHTML = users
    .map(
      (user) => `
    <a href="profile?username=${user.username}" class="follow-item">
      <div class="avatar avatar-sm">
        ${
          user.avatarUrl
            ? `<img src="${resolveMediaUrl(user.avatarUrl)}" alt="${user.username}">`
            : `<span class="avatar-placeholder">${user.username[0].toUpperCase()}</span>`
        }
      </div>
      <div class="follow-info">
        <span class="follow-username">${user.username} ${
        user.isVerified ? '<span class="verified-badge">✓</span>' : ''
      }</span>
      </div>
    </a>
  `
    )
    .join('');
};

document.addEventListener('DOMContentLoaded', initProfile);
