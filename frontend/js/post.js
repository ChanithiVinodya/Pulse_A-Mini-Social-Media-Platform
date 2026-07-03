import { api, getStoredUser } from './api.js';
import { requireAuth } from './auth.js';
import { createPostCard } from './components/postCard.js';
import { renderComments, createCommentElement, setupCommentForm } from './components/comment.js';

const initPost = async () => {
  if (!requireAuth()) return;

  const params = new URLSearchParams(window.location.search);
  const postId = params.get('id');

  if (!postId) {
    window.location.href = 'feed.html';
    return;
  }

  const postContainer = document.getElementById('post-detail');
  const commentsContainer = document.getElementById('comments-list');
  const commentForm = document.getElementById('comment-form');

  try {
    const post = await api.get(`/posts/${postId}`);
    postContainer.innerHTML = '';
    postContainer.appendChild(
      createPostCard(post, {
        onLike: (id) => api.post(`/posts/${id}/like`, {}),
        onSave: (id) => api.post(`/posts/${id}/save`, {}),
        onDelete: post.author.id === getStoredUser()?.id 
          ? async (id) => {
              await api.delete(`/posts/${id}`);
              window.location.href = 'feed.html';
            } 
          : null,
        compact: true,
      })
    );

    await loadComments(postId, commentsContainer);

    setupCommentForm(commentForm, postId, async (id, content) => {
      const comment = await api.post(`/posts/${id}/comments`, { content });
      commentsContainer.querySelector('.no-comments')?.remove();
      commentsContainer.appendChild(createCommentElement(comment, getStoredUser()?.id));
    });
  } catch (err) {
    postContainer.innerHTML = `<div class="empty-state error"><p>${err.message}</p></div>`;
  }
};

const loadComments = async (postId, container) => {
  const data = await api.get(`/posts/${postId}/comments`);
  renderComments(container, data.comments, getStoredUser()?.id);

  container.querySelectorAll('.comment-delete').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const commentEl = btn.closest('.comment');
      const commentId = commentEl.dataset.commentId;

      try {
        await api.delete(`/comments/${commentId}`);
        commentEl.remove();
        if (container.children.length === 0) {
          container.innerHTML = '<p class="no-comments">No comments yet. Be the first!</p>';
        }
      } catch (err) {
        alert(err.message);
      }
    });
  });
};

document.addEventListener('DOMContentLoaded', initPost);
