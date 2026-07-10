import { api, resolveMediaUrl } from '../api.js';

const renderStories = (container, storyGroups, currentUser, onAddStory, onUpdate) => {
  container.innerHTML = '';

  const viewedIds = JSON.parse(localStorage.getItem('viewed_stories') || '[]');

  // Find if there is a group for current user
  const myGroup = storyGroups.find(group => group.author.id === currentUser?.id);
  const otherGroups = storyGroups.filter(group => group.author.id !== currentUser?.id);

  // Check if myGroup has unviewed stories
  const myStories = myGroup ? myGroup.stories : [];
  const myHasUnviewed = myStories.some(story => !viewedIds.includes(story.id));
  const hasMyStories = myStories.length > 0;

  // Add/View button for currentUser's own story
  const addBtn = document.createElement('button');
  addBtn.className = 'story-item story-add';
  
  // Decide ring class based on whether user has unviewed stories
  const ringClass = hasMyStories ? `story-ring ${myHasUnviewed ? 'active' : ''}` : 'story-ring';

  addBtn.innerHTML = `
    <div class="${ringClass}">
      <div class="story-avatar">
        ${currentUser?.avatarUrl
          ? `<img src="${resolveMediaUrl(currentUser.avatarUrl)}" alt="Your story">`
          : `<span class="avatar-placeholder">${currentUser?.username?.[0]?.toUpperCase() || '+'}</span>`}
        <span class="story-add-icon" id="add-story-plus">+</span>
      </div>
    </div>
    <span class="story-label">Your story</span>
  `;

  // Main button click: view story if exists, otherwise add story
  addBtn.addEventListener('click', (e) => {
    if (e.target.id === 'add-story-plus') {
      e.stopPropagation();
      onAddStory();
    } else {
      if (hasMyStories) {
        openStoryViewer(myGroup, currentUser, onUpdate);
      } else {
        onAddStory();
      }
    }
  });

  container.appendChild(addBtn);

  // Render other users' stories
  for (const group of otherGroups) {
    const item = document.createElement('button');
    item.className = 'story-item';
    item.dataset.authorId = group.author.id;

    const avatarSrc = resolveMediaUrl(group.author.avatarUrl);
    const hasUnviewed = group.stories.some(story => !viewedIds.includes(story.id));

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

    item.addEventListener('click', () => openStoryViewer(group, currentUser, onUpdate));
    container.appendChild(item);
  }
};

const openStoryViewer = (group, currentUser, onUpdate) => {
  const overlay = document.createElement('div');
  overlay.className = 'story-viewer';
  overlay.tabIndex = 0; // make overlay focusable for keyboard navigation

  let index = 0;
  const stories = group.stories;
  const isOwnStory = group.author.id === currentUser?.id;
  const viewedIds = JSON.parse(localStorage.getItem('viewed_stories') || '[]');

  const closeViewer = () => {
    overlay.remove();
    if (onUpdate) onUpdate();
  };

  const render = () => {
    const story = stories[index];
    if (!story) {
      closeViewer();
      return;
    }

    // Mark current story as viewed immediately
    if (!viewedIds.includes(story.id)) {
      viewedIds.push(story.id);
      localStorage.setItem('viewed_stories', JSON.stringify(viewedIds));
    }

    overlay.innerHTML = `
      <div class="story-viewer-content">
        <div class="story-viewer-header">
          <div class="story-viewer-author-info">
            <span>${group.author.username}</span>
          </div>
          <div class="story-header-actions">
            ${isOwnStory ? `
              <button class="story-delete-btn" aria-label="Delete Story" title="Delete Story">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            ` : ''}
            <button class="story-close" aria-label="Close">&times;</button>
          </div>
        </div>
        <div class="story-viewer-nav-container">
          <button class="story-nav-btn prev-btn" ${index === 0 ? 'style="visibility: hidden;"' : ''}>&lsaquo;</button>
          <img src="${resolveMediaUrl(story.imageUrl)}" alt="Story">
          <button class="story-nav-btn next-btn" ${index === stories.length - 1 ? 'style="visibility: hidden;"' : ''}>&rsaquo;</button>
        </div>
        <div class="story-progress">
          ${stories.map((_, i) => `<span class="story-progress-bar ${i <= index ? 'filled' : ''}"></span>`).join('')}
        </div>
      </div>
    `;

    // Wire up events
    overlay.querySelector('.story-close').addEventListener('click', closeViewer);

    const prevBtn = overlay.querySelector('.prev-btn');
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (index > 0) {
          index--;
          render();
        }
      });
    }

    const nextBtn = overlay.querySelector('.next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (index < stories.length - 1) {
          index++;
          render();
        }
      });
    }

    if (isOwnStory) {
      const deleteBtn = overlay.querySelector('.story-delete-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          if (!confirm('Are you sure you want to delete this story?')) return;
          try {
            await api.delete(`/stories/${story.id}`);
            // Remove from the local array
            stories.splice(index, 1);
            if (stories.length === 0) {
              closeViewer();
            } else {
              if (index >= stories.length) {
                index = stories.length - 1;
              }
              render();
            }
          } catch (err) {
            alert('Failed to delete story: ' + err.message);
          }
        });
      }
    }
  };

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeViewer();
  });

  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' && index < stories.length - 1) {
      index++;
      render();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      index--;
      render();
    } else if (e.key === 'Escape') {
      closeViewer();
    }
  });

  document.body.appendChild(overlay);
  render();
  overlay.focus();
};

export { renderStories };
