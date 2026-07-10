import { api, getStoredUser, resolveMediaUrl } from "./api.js";
import { requireAuth, logout } from "./auth.js";

let activeConversationUserId = null;
let conversations = [];

const initMessages = async () => {
  if (!requireAuth()) return;

  setupSearch();
  setupEventListeners();
  document.getElementById("logout-btn")?.addEventListener("click", logout);
  document.getElementById("sidebar-logout-btn")?.addEventListener("click", logout);
  document.getElementById("bottom-logout-btn")?.addEventListener("click", logout);

  await loadConversations();

  // Check for userId in URL to start a specific chat
  const urlParams = new URLSearchParams(window.location.search);
  const startUserId = urlParams.get("userId");
  if (startUserId) {
    activeConversationUserId = startUserId;
    await openConversation(startUserId);
  }
};

const setupEventListeners = () => {
  const chatForm = document.getElementById("chat-form");
  chatForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = document.getElementById("chat-input");
    const content = input.value.trim();

    if (!content || !activeConversationUserId) return;

    try {
      const message = await api.post("/messages", {
        receiverId: activeConversationUserId,
        content,
      });
      input.value = "";
      appendMessage(message);
      scrollToBottom();
      loadConversations(); // refresh last message in list
    } catch (err) {
      alert(err.message);
    }
  });

  document.getElementById("chat-back-btn")?.addEventListener("click", () => {
    document.getElementById("chat-view").classList.add("hidden");
    document.getElementById("chat-empty").classList.remove("hidden");
    activeConversationUserId = null;
  });

  document.getElementById("start-chat-btn")?.addEventListener("click", () => {
    document.getElementById("sidebar-search-btn")?.click() ||
      document.getElementById("bottom-search-btn")?.click();
  });

  document.getElementById("new-chat-btn")?.addEventListener("click", () => {
    document.getElementById("sidebar-search-btn")?.click() ||
      document.getElementById("bottom-search-btn")?.click();
  });
};

const loadConversations = async () => {
  const listEl = document.getElementById("conversations-list");
  try {
    conversations = await api.get("/messages/conversations");
    renderConversations();
  } catch (err) {
    listEl.innerHTML = `<div class="error">${err.message}</div>`;
  }
};

const renderConversations = () => {
  const listEl = document.getElementById("conversations-list");
  if (conversations.length === 0) {
    listEl.innerHTML = '<div class="search-empty">No messages yet.</div>';
    return;
  }

  listEl.innerHTML = conversations
    .map(
      (conv) => `
    <div class="conversation-item ${activeConversationUserId === conv.user.id ? "active" : ""}" data-user-id="${conv.user.id}">
      <div class="avatar avatar-md">
        ${
          conv.user.avatarUrl
            ? `<img src="${resolveMediaUrl(conv.user.avatarUrl)}" alt="${conv.user.username}">`
            : `<span class="avatar-placeholder">${conv.user.username[0].toUpperCase()}</span>`
        }
      </div>
      <div class="conversation-info">
        <div class="conversation-header">
          <span class="conversation-username">${conv.user.username}</span>
          <span class="conversation-time">${formatTime(conv.lastMessage.createdAt)}</span>
        </div>
        <div class="conversation-last-msg">
          ${conv.lastMessage.senderId === getStoredUser().id ? "You: " : ""}${conv.lastMessage.content}
        </div>
      </div>
      ${conv.unreadCount > 0 ? `<span class="unread-badge">${conv.unreadCount}</span>` : ""}
    </div>
  `,
    )
    .join("");

  // Add click listeners
  listEl.querySelectorAll(".conversation-item").forEach((item) => {
    item.addEventListener("click", () => {
      const userId = item.dataset.userId;
      openConversation(userId);
    });
  });
};

const openConversation = async (userId) => {
  activeConversationUserId = userId;
  const chatView = document.getElementById("chat-view");
  const chatEmpty = document.getElementById("chat-empty");
  const messagesEl = document.getElementById("chat-messages");

  chatView.classList.remove("hidden");
  chatEmpty.classList.add("hidden");
  messagesEl.innerHTML = '<div class="loader">Loading messages...</div>';

  // Highlight active conversation in list
  renderConversations();

  try {
    const messages = await api.get(`/messages/${userId}`);

    // Set header info
    const user =
      conversations.find((c) => c.user.id === userId)?.user ||
      (await fetchUserInfo(userId));
    document.getElementById("chat-username").textContent = user.username;
    const avatarEl = document.getElementById("chat-user-avatar");
    avatarEl.innerHTML = user.avatarUrl
      ? `<img src="${resolveMediaUrl(user.avatarUrl)}" alt="${user.username}">`
      : `<span class="avatar-placeholder">${user.username[0].toUpperCase()}</span>`;

    renderMessages(messages);
    scrollToBottom();

    // Clear unread in list locally
    const convIdx = conversations.findIndex((c) => c.user.id === userId);
    if (convIdx !== -1) conversations[convIdx].unreadCount = 0;
    renderConversations();
  } catch (err) {
    messagesEl.innerHTML = `<div class="error">${err.message}</div>`;
  }
};

const fetchUserInfo = async (userId) => {
  // We can use search or profile info here. For simplicity, assume we have it or fetch profile.
  try {
    return await api.get(`/users/profile/${userId}`);
  } catch (err) {
    return { username: "User", avatarUrl: null };
  }
};

const renderMessages = (messages) => {
  const messagesEl = document.getElementById("chat-messages");
  if (messages.length === 0) {
    messagesEl.innerHTML =
      '<div class="chat-start-msg">This is the start of your conversation.</div>';
    return;
  }

  messagesEl.innerHTML = messages
    .map(
      (msg) => `
    <div class="message-wrapper ${msg.senderId === getStoredUser().id ? "sent" : "received"}">
      <div class="message-content">
        ${msg.content}
      </div>
      <div class="message-time">${formatTime(msg.createdAt)}</div>
    </div>
  `,
    )
    .join("");
};

const appendMessage = (msg) => {
  const messagesEl = document.getElementById("chat-messages");
  const startMsg = messagesEl.querySelector(".chat-start-msg");
  if (startMsg) startMsg.remove();

  const msgHtml = `
    <div class="message-wrapper ${msg.senderId === getStoredUser().id ? "sent" : "received"}">
      <div class="message-content">
        ${msg.content}
      </div>
      <div class="message-time">${formatTime(msg.createdAt)}</div>
    </div>
  `;
  messagesEl.insertAdjacentHTML("beforeend", msgHtml);
};

const scrollToBottom = () => {
  const messagesEl = document.getElementById("chat-messages");
  messagesEl.scrollTop = messagesEl.scrollHeight;
};

const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;

  if (diff < 86400000) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (diff < 604800000) {
    return date.toLocaleDateString([], { weekday: "short" });
  } else {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
};

const setupSearch = () => {
  const modal = document.getElementById("search-modal");
  const sidebarBtn = document.getElementById("sidebar-search-btn");
  const bottomBtn = document.getElementById("bottom-search-btn");
  const closeBtn = document.getElementById("close-search-modal");
  const input = document.getElementById("user-search-input");
  const resultsEl = document.getElementById("search-results");

  const openSearch = () => {
    modal?.classList.add("open");
    input?.focus();
  };

  const closeSearch = () => {
    modal?.classList.remove("open");
    input.value = "";
    resultsEl.innerHTML =
      '<div class="search-empty">Type to search for people</div>';
  };

  sidebarBtn?.addEventListener("click", openSearch);
  bottomBtn?.addEventListener("click", openSearch);
  closeBtn?.addEventListener("click", closeSearch);
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeSearch();
  });

  let debounceTimer;
  input?.addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    const query = e.target.value.trim();

    if (!query) {
      resultsEl.innerHTML =
        '<div class="search-empty">Type to search for people</div>';
      return;
    }

    debounceTimer = setTimeout(async () => {
      try {
        const users = await api.get(
          `/users/search?q=${encodeURIComponent(query)}`,
        );
        renderSearchResults(users);
      } catch (err) {
        console.error("Search failed:", err.message);
      }
    }, 300);
  });
};

const renderSearchResults = (users) => {
  const resultsEl = document.getElementById("search-results");
  if (!resultsEl) return;

  if (users.length === 0) {
    resultsEl.innerHTML = '<div class="search-empty">No users found</div>';
    return;
  }

  resultsEl.innerHTML = users
    .map(
      (user) => `
    <div class="search-result-item" data-user-id="${user.id}">
      <div class="avatar avatar-sm">
        ${user.avatarUrl ? `<img src="${resolveMediaUrl(user.avatarUrl)}" alt="${user.username}">` : `<span class="avatar-placeholder">${user.username[0].toUpperCase()}</span>`}
      </div>
      <div class="search-result-info">
        <span class="search-result-username">${user.username}</span>
      </div>
    </div>
  `,
    )
    .join("");

  resultsEl.querySelectorAll(".search-result-item").forEach((item) => {
    item.addEventListener("click", () => {
      const userId = item.dataset.userId;
      document.getElementById("close-search-modal").click();
      openConversation(userId);
    });
  });
};

document.addEventListener("DOMContentLoaded", initMessages);
