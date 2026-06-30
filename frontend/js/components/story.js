import { resolveMediaUrl } from '../api.js';

const renderStories = (container, storyGroups, currentUser, onAddStory) => {
  container.innerHTML = '';

  const addBtn = document.createElement('button');
  addBtn.className = 'story-item story-add';
  addBtn.innerHTML = `
    <div class="story-ring">
      <div class="story-avatar">
        ${currentUser?.avatarUrl
          ? `<img src="${resolveMediaUrl(currentUser.avatarUrl)}" alt="Your story">`
          : `<span class="avatar-placeholder">${currentUser?.username?.[0]?.toUpperCase() || '+'}</span>`}
        <span class="story-add-icon">+</span>
      </div>
    </div>
    <span class="story-label">Your story</span>
  `;
  addBtn.addEventListener('click', onAddStory);
  container.appendChild(addBtn);

  for (const group of storyGroups) {
    const item = document.createElement('button');
    item.className = 'story-item';
    item.dataset.authorId = group.author.id;

    const avatarSrc = resolveMediaUrl(group.author.avatarUrl);
    const hasUnviewed = true;

    item.innerHTML = `
      <div class="story-ring ${hasUnviewed ? 'active' : ''}">
        <div class="story-avatar">
          ${avatarSrc
            ? `<img src="${avatarSrc}" alt="${group.author.username}">`
            : `<span class="avatar-placeholder">${group.author.username[0].toUpperCase()}</span>`}
        </div>
      </div>
      <span class="story-label">${group.author.username}</span>
    `;

    item.addEventListener('click', () => openStoryViewer(group));
    container.appendChild(item);
  }
};

const openStoryViewer = (group) => {
  const overlay = document.createElement('div');
  overlay.className = 'story-viewer';

  let index = 0;
  const stories = group.stories;

  const render = () => {
    const story = stories[index];
    overlay.innerHTML = `
      <div class="story-viewer-content">
        <div class="story-viewer-header">
          <span>${group.author.username}</span>
          <button class="story-close" aria-label="Close">&times;</button>
        </div>
        <img src="${resolveMediaUrl(story.imageUrl)}" alt="Story">
        <div class="story-progress">
          ${stories.map((_, i) => `<span class="story-progress-bar ${i <= index ? 'filled' : ''}"></span>`).join('')}
        </div>
      </div>
    `;

    overlay.querySelector('.story-close').addEventListener('click', () => overlay.remove());
  };

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' && index < stories.length - 1) {
      index++;
      render();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      index--;
      render();
    } else if (e.key === 'Escape') {
      overlay.remove();
    }
  });

  document.body.appendChild(overlay);
  render();
  overlay.focus();
};

export { renderStories };
