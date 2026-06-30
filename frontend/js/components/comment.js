import { resolveMediaUrl } from '../api.js';
import { formatTimeAgo, escapeHtml } from './postCard.js';

const renderComments = (container, comments, currentUserId) => {
  container.innerHTML = '';

  if (comments.length === 0) {
    container.innerHTML = '<p class="no-comments">No comments yet. Be the first!</p>';
    return;
  }

  for (const comment of comments) {
    container.appendChild(createCommentElement(comment, currentUserId));
  }
};

const createCommentElement = (comment, currentUserId) => {
  const el = document.createElement('div');
  el.className = 'comment';
  el.dataset.commentId = comment.id;

  const avatarSrc = resolveMediaUrl(comment.author.avatarUrl);
  const canDelete = currentUserId === comment.author.id;

  el.innerHTML = `
    <div class="avatar avatar-xs">
      ${avatarSrc
        ? `<img src="${avatarSrc}" alt="${comment.author.username}">`
        : `<span class="avatar-placeholder">${comment.author.username[0].toUpperCase()}</span>`}
    </div>
    <div class="comment-body">
      <p class="comment-text">
        <a href="profile.html?username=${comment.author.username}" class="comment-username">${comment.author.username}</a>
        ${escapeHtml(comment.content)}
      </p>
      <span class="comment-time">${formatTimeAgo(comment.createdAt)}</span>
    </div>
    ${canDelete ? '<button class="comment-delete" aria-label="Delete comment">&times;</button>' : ''}
  `;

  return el;
};

const setupCommentForm = (form, postId, onSubmit) => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = form.querySelector('input, textarea');
    const content = input.value.trim();
    if (!content) return;

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;

    try {
      await onSubmit(postId, content);
      input.value = '';
    } finally {
      submitBtn.disabled = false;
    }
  });
};

export { renderComments, createCommentElement, setupCommentForm };
