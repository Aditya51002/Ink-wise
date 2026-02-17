

document.addEventListener('DOMContentLoaded', function () {
 
  const chatHistory     = document.getElementById('chat-history');
  const messageInput    = document.getElementById('message-input');
  const sendButton      = document.getElementById('send-button');
  const newChatButton   = document.getElementById('new-chat-btn');
  const chatsList       = document.getElementById('chats-list');
  const styleSelect     = document.getElementById('style-select');
  const loadingIndicator = document.querySelector('.loading-indicator');
  const sidebarToggle   = document.getElementById('sidebar-toggle');
  const sidebar         = document.getElementById('sidebar');

  let chats       = [];
  let activeChat  = null;
  let currentStyle = 'article';
  let isSending   = false;


  initializeApp();

  async function initializeApp() {
    populateStyleDropdown();
    setupEventListeners();
    await loadChats();
  }


  function populateStyleDropdown() {
    const styles = [
      'poem', 'article', 'academic', 'story', 'comedy',
      'script', 'fairytale', 'letter', 'sonnet', 'haiku'
    ];
    styleSelect.innerHTML = '';
    styles.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = s.charAt(0).toUpperCase() + s.slice(1);
      styleSelect.appendChild(opt);
    });
    styleSelect.value = currentStyle;
  }

  function setupEventListeners() {
    sendButton.addEventListener('click', sendMessage);

    messageInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    newChatButton.addEventListener('click', createNewChat);

    styleSelect.addEventListener('change', function () {
      currentStyle = this.value;
    });

    chatsList.addEventListener('click', handleChatListClick);

  
    document.querySelectorAll('.prompt-suggestion').forEach(btn => {
      btn.addEventListener('click', function () {
        messageInput.value = this.textContent.trim();
        messageInput.focus();
      });
    });

    // Mobile sidebar toggle
    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('-translate-x-full');
        sidebar.classList.toggle('absolute');
        sidebar.classList.toggle('z-50');
        sidebar.classList.toggle('h-full');
      });
    }

    // Auto-resize textarea
    messageInput.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 200) + 'px';
    });
  }

  // ── API Helpers ───────────────────────────────────────────
  async function apiFetch(url, options = {}) {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    if (res.status === 401) {
      window.location.href = '/';
      return null;
    }
    return res;
  }

  async function loadChats() {
    try {
      const res = await apiFetch('/api/chats');
      if (!res) return;
      chats = await res.json();
      renderChatsList();
      if (chats.length > 0) {
        await setActiveChat(chats[0]._id);
      } else {
        await createNewChat();
      }
    } catch (err) {
      console.error('Error loading chats:', err);
      showEmptyState();
    }
  }

  async function createNewChat() {
    try {
      const res = await apiFetch('/api/chats', { method: 'POST' });
      if (!res) return;
      const newChat = await res.json();
      chats.unshift(newChat);
      renderChatsList();
      await setActiveChat(newChat._id);
    } catch (err) {
      console.error('Error creating chat:', err);
    }
  }

  async function setActiveChat(chatId) {
    activeChat = chatId;
    highlightActiveChat(chatId);

    try {
      const res = await apiFetch(`/api/chats/${chatId}/messages`);
      if (!res) return;
      const data = await res.json();
      renderMessages(data.messages);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  }

  function highlightActiveChat(chatId) {
    document.querySelectorAll('.chat-item').forEach(item => {
      const isActive = item.dataset.id === chatId;
      item.classList.toggle('bg-ink-100', isActive);
      item.classList.toggle('border-ink-300', isActive);
      item.classList.toggle('bg-white', !isActive);
      item.classList.toggle('hover:bg-gray-50', !isActive);
    });
  }

 
  function renderChatsList() {
    chatsList.innerHTML = '';
    chats.forEach(chat => {
      const el = document.createElement('div');
      el.className = 'p-2.5 rounded-lg cursor-pointer border-2 border-transparent bg-white hover:bg-gray-50 chat-item transition-all duration-150 group';
      el.dataset.id = chat._id;
      el.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="manga-text text-sm truncate flex-grow">${escapeHtml(chat.title)}</span>
          <div class="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1 shrink-0">
            <button class="edit-chat-btn w-6 h-6 flex items-center justify-center rounded hover:bg-ink-100 text-gray-500 hover:text-ink-700 transition-colors" title="Rename">
              <i class="ri-pencil-line ri-sm"></i>
            </button>
            <button class="delete-chat-btn w-6 h-6 flex items-center justify-center rounded hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors" title="Delete">
              <i class="ri-delete-bin-line ri-sm"></i>
            </button>
          </div>
        </div>
      `;
      chatsList.appendChild(el);
    });
    highlightActiveChat(activeChat);
  }


  function renderMessages(messages) {
    chatHistory.innerHTML = '';
    if (!messages || messages.length === 0) {
      showEmptyState();
      return;
    }
    messages.forEach(msg => {
      chatHistory.appendChild(createMessageElement(msg));
    });
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  function showEmptyState() {
    chatHistory.innerHTML = `
      <div class="flex items-center justify-center h-full">
        <div class="text-center max-w-lg">
          <div class="manga-panel bg-white p-8 inline-block mb-6">
            <div class="text-6xl mb-4">&#x1F58A;</div>
            <h2 class="manga-title text-3xl mb-3 text-ink-700">READY TO WRITE?</h2>
            <p class="manga-text text-gray-500 text-lg">
              Share your creative idea below and let's build something amazing together!
            </p>
          </div>
          <div class="flex flex-wrap justify-center gap-2 mt-4">
            <span class="manga-text text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Stories</span>
            <span class="manga-text text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Poems</span>
            <span class="manga-text text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Scripts</span>
            <span class="manga-text text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Haiku</span>
            <span class="manga-text text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Letters</span>
          </div>
        </div>
      </div>
    `;
  }

  function createMessageElement(message) {
    const isUser = message.role === 'user';
    const container = document.createElement('div');
    container.className = `flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-6 animate-fade-in`;

    const formattedContent = formatContent(message.content);

    container.innerHTML = `
      <div class="flex items-center mb-1.5 ${isUser ? 'flex-row-reverse' : ''} gap-2">
        <div class="w-7 h-7 rounded-full flex items-center justify-center ${isUser ? 'bg-gray-800' : 'bg-ink-600'} text-white text-xs font-bold shrink-0">
          ${isUser ? '&#9997;' : '&#128394;'}
        </div>
        <span class="manga-text text-xs text-gray-400">${isUser ? 'You' : 'InkWise'}</span>
      </div>
      <div class="${isUser
        ? 'bg-ink-50 border-2 border-ink-200 rounded-2xl rounded-tr-sm p-4 max-w-2xl'
        : 'manga-panel bg-white p-4 max-w-2xl'}">
        <div class="manga-text text-sm leading-relaxed prose-content">${formattedContent}</div>
      </div>
    `;
    return container;
  }

  function formatContent(content) {
   
    let html = escapeHtml(content);
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/\n/g, '<br>');
    return html;
  }

 
  async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || !activeChat || isSending) return;
    isSending = true;
    const emptyState = chatHistory.querySelector('.flex.items-center.justify-center');
    if (emptyState) chatHistory.innerHTML = '';

    chatHistory.appendChild(createMessageElement({ role: 'user', content: text }));
    messageInput.value = '';
    messageInput.style.height = 'auto';
    showLoading();
    scrollToBottom();

    sendButton.disabled = true;
    sendButton.classList.add('opacity-60');

    try {
      const res = await apiFetch(`/api/chats/${activeChat}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message: text, style: currentStyle }),
      });
      if (!res) return;

      const data = await res.json();
      if (data.error) {
        chatHistory.appendChild(createMessageElement({
          role: 'assistant', content: `Error: ${data.error}`
        }));
      } else {
        chatHistory.appendChild(createMessageElement(data.assistant_message));

        if (data.title) {
          const chat = chats.find(c => c._id === activeChat);
          if (chat && chat.title !== data.title) {
            chat.title = data.title;
            renderChatsList();
          }
        }
      }
    } catch (err) {
      chatHistory.appendChild(createMessageElement({
        role: 'assistant',
        content: 'Connection error. Please check your internet and try again.'
      }));
    } finally {
      hideLoading();
      scrollToBottom();
      isSending = false;
      sendButton.disabled = false;
      sendButton.classList.remove('opacity-60');
    }
  }

  function handleChatListClick(e) {
    const target = e.target;

    if (target.closest('.edit-chat-btn')) {
      const chatItem = target.closest('.chat-item');
      if (chatItem) startEditingTitle(chatItem.dataset.id);
      e.stopPropagation();
      return;
    }

    // Delete button
    if (target.closest('.delete-chat-btn')) {
      const chatItem = target.closest('.chat-item');
      if (chatItem) deleteChat(chatItem.dataset.id);
      e.stopPropagation();
      return;
    }

    // Click on chat item
    const chatItem = target.closest('.chat-item');
    if (chatItem) {
      setActiveChat(chatItem.dataset.id);
    }
  }

  function startEditingTitle(chatId) {
    const chat = chats.find(c => c._id === chatId);
    if (!chat) return;

    const chatItem = document.querySelector(`.chat-item[data-id="${chatId}"]`);
    const titleSpan = chatItem.querySelector('.manga-text');

    const input = document.createElement('input');
    input.type = 'text';
    input.value = chat.title;
    input.className = 'w-full p-1 border-2 border-ink-400 rounded manga-text text-sm focus:outline-none';
    titleSpan.replaceWith(input);
    input.focus();
    input.select();

    const save = async () => {
      const newTitle = input.value.trim() || 'Untitled';
      try {
        await apiFetch(`/api/chats/${chatId}`, {
          method: 'PUT',
          body: JSON.stringify({ title: newTitle }),
        });
        chat.title = newTitle;
      } catch (err) {
        console.error('Error updating title:', err);
      }
      renderChatsList();
    };

    let saved = false;
    input.addEventListener('blur', () => { if (!saved) { saved = true; save(); } });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { saved = true; save(); }
      if (e.key === 'Escape') { saved = true; renderChatsList(); }
    });
  }

  async function deleteChat(chatId) {
    if (!confirm('Delete this chat?')) return;
    try {
      await apiFetch(`/api/chats/${chatId}`, { method: 'DELETE' });
      chats = chats.filter(c => c._id !== chatId);
      renderChatsList();
      if (chats.length > 0) {
        await setActiveChat(chats[0]._id);
      } else {
        await createNewChat();
      }
    } catch (err) {
      console.error('Error deleting chat:', err);
    }
  }

  // ── UI Helpers ────────────────────────────────────────────
  function showLoading() {
    if (loadingIndicator) {
      loadingIndicator.classList.remove('hidden');
      chatHistory.appendChild(loadingIndicator);
    }
  }

  function hideLoading() {
    if (loadingIndicator) {
      loadingIndicator.classList.add('hidden');
    }
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      chatHistory.scrollTop = chatHistory.scrollHeight;
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
});
