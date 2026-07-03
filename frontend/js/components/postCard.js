import { resolveMediaUrl } from '../api.js';

const formatTimeAgo = (dateStr) => {
  const date = new Date(dateStr);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  return date.toLocaleDateString();
};

const createPostCard = (post, { onLike, onComment, onSave, onDelete, compact = false } = {}) => {
  const card = document.createElement('article');
  card.className = 'post-card';
  card.dataset.postId = post.id;

  const avatarSrc = resolveMediaUrl(post.author.avatarUrl);
  const imageSrc = resolveMediaUrl(post.imageUrl);

  card.innerHTML = `
    <header class="post-header">
      <div class="post-author-group">
        <a href="profile.html?username=${post.author.username}" class="post-author">
          <div class="avatar avatar-sm">
            ${avatarSrc ? `<img src="${avatarSrc}" alt="${post.author.username}">` : `<span class="avatar-placeholder">${post.author.username[0].toUpperCase()}</span>`}
          </div>
          <div class="post-author-info">
            <span class="post-username">
              ${post.author.username}
              ${post.author.isVerified ? '<span class="verified-badge" title="Verified">✓</span>' : ''}
            </span>
            <span class="post-time">${formatTimeAgo(post.createdAt)}</span>
          </div>
        </a>
      </div>
      <div class="post-header-actions">
        ${onDelete ? `
          <button class="action-btn delete-post-btn" aria-label="Delete post">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>
            </svg>
          </button>
        ` : `
          <button class="action-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
            </svg>
          </button>
        `}
      </div>
    </header>
    
    ${imageSrc ? `
      <div class="post-image-container">
        <a href="post.html?id=${post.id}" class="post-image-link">
          <img src="${imageSrc}" alt="Post image" class="post-image">
        </a>
      </div>
    ` : ''}

    <div class="post-footer">
      <div class="post-stats-row">
        <span class="post-likes">
          ${post.likesCount > 0 ? `You & other ${post.likesCount - (post.likedByMe ? 1 : 0)} Likes` : 'No likes yet'}
        </span>
        <span class="post-shares">324 Share</span>
      </div>
      
      <div class="post-actions-bar">
        <div class="actions-left">
          <button class="action-btn like-btn ${post.likedByMe ? 'liked' : ''}" aria-label="Like">
            <svg viewBox="0 0 24 24" fill="${post.likedByMe ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
          <button class="action-btn comment-btn" aria-label="Comment">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
          <button class="action-btn share-btn" aria-label="Share">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
            </svg>
          </button>
        </div>
        <div class="actions-right">
          <button class="action-btn bookmark-btn ${post.savedByMe ? 'bookmarked' : ''}" aria-label="Bookmark">
            <svg viewBox="0 0 24 24" fill="${post.savedByMe ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        </div>
      </div>

      ${post.content ? `
        <div class="post-caption">
          <span class="caption-text">${escapeHtml(post.content)}</span>
        </div>
      ` : ''}
    </div>
  `;

  const likeBtn = card.querySelector('.like-btn');
  const likesEl = card.querySelector('.post-likes');
  const commentBtn = card.querySelector('.comment-btn');
  const bookmarkBtn = card.querySelector('.bookmark-btn');

  likeBtn.addEventListener('click', async () => {
    if (!onLike) return;

    const wasLiked = likeBtn.classList.contains('liked');
    const prevCount = post.likesCount;

    likeBtn.classList.toggle('liked', !wasLiked);
    likeBtn.querySelector('svg').setAttribute('fill', wasLiked ? 'none' : 'currentColor');
    post.likesCount = wasLiked ? prevCount - 1 : prevCount + 1;
    post.likedByMe = !wasLiked;
    likesEl.textContent = `${post.likesCount} ${post.likesCount === 1 ? 'like' : 'likes'}`;

    try {
      const result = await onLike(post.id);
      post.likesCount = result.count;
      post.likedByMe = result.liked;
      likeBtn.classList.toggle('liked', result.liked);
      likeBtn.querySelector('svg').setAttribute('fill', result.liked ? 'currentColor' : 'none');
      likesEl.textContent = `${result.count} ${result.count === 1 ? 'like' : 'likes'}`;
    } catch {
      likeBtn.classList.toggle('liked', wasLiked);
      likeBtn.querySelector('svg').setAttribute('fill', wasLiked ? 'currentColor' : 'none');
      post.likesCount = prevCount;
      post.likedByMe = wasLiked;
      likesEl.textContent = `${prevCount} ${prevCount === 1 ? 'like' : 'likes'}`;
    }
  });

  commentBtn.addEventListener('click', () => {
    if (onComment) {
      onComment(post.id);
    } else {
      window.location.href = `post.html?id=${post.id}`;
    }
  });

  bookmarkBtn.addEventListener('click', async () => {
    if (!onSave) return;

    const wasSaved = bookmarkBtn.classList.contains('bookmarked');
    
    bookmarkBtn.classList.toggle('bookmarked', !wasSaved);
    bookmarkBtn.querySelector('svg').setAttribute('fill', wasSaved ? 'none' : 'currentColor');
    post.savedByMe = !wasSaved;

    try {
      const result = await onSave(post.id);
      post.savedByMe = result.saved;
      bookmarkBtn.classList.toggle('bookmarked', result.saved);
      bookmarkBtn.querySelector('svg').setAttribute('fill', result.saved ? 'currentColor' : 'none');
    } catch {
      bookmarkBtn.classList.toggle('bookmarked', wasSaved);
      bookmarkBtn.querySelector('svg').setAttribute('fill', wasSaved ? 'currentColor' : 'none');
      post.savedByMe = wasSaved;
    }
  });

  const deleteBtn = card.querySelector('.delete-post-btn');
  if (deleteBtn && onDelete) {
    deleteBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to delete this post?')) {
        try {
          await onDelete(post.id);
          card.remove();
        } catch (err) {
          alert('Failed to delete post: ' + err.message);
        }
      }
    });
  }

  return card;
}

const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

export { createPostCard, formatTimeAgo, escapeHtml };
