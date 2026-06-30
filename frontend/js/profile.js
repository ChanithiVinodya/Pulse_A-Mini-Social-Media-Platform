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

  document.getElementById('logout-btn')?.addEventListener('click', logout);

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
      <div class="profile-info">
        <div class="profile-name-row">
          <h1 class="profile-username">
            ${profile.username}
            ${profile.isVerified ? '<span class="verified-badge">✓</span>' : ''}
          </h1>
          <div class="profile-actions" id="profile-actions"></div>
        </div>
        <div class="profile-stats">
          <span><strong>${profile.postsCount}</strong> posts</span>
          <span><strong>${profile.followersCount}</strong> followers</span>
          <span><strong>${profile.followingCount}</strong> following</span>
          <span><strong>${profile.likesReceived}</strong> likes</span>
        </div>
        ${profile.bio ? `<p class="profile-bio">${escapeHtml(profile.bio)}</p>` : ''}
      </div>
    </section>
    <section class="profile-grid" id="profile-grid"></section>
  `;

  setupProfileActions(profile);

  const grid = document.getElementById('profile-grid');
  if (profile.posts.length === 0) {
    grid.innerHTML = '<div class="empty-state"><p>No posts yet</p></div>';
    return;
  }

  for (const post of profile.posts) {
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
    `;
    document.getElementById('follow-btn').addEventListener('click', () => toggleFollow(profile));
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

document.addEventListener('DOMContentLoaded', initProfile);
