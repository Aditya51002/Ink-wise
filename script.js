document.addEventListener('DOMContentLoaded', function () {
  // DOM elements
  const chatHistory = document.getElementById('chat-history');
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');
  const newChatButton = document.getElementById('new-chat-btn');
  const chatsList = document.getElementById('chats-list');
  const styleSelect = document.getElementById('style-select');
  const loadingIndicator = document.querySelector('.loading-indicator');

  // State
  let chats = JSON.parse(localStorage.getItem('manga-chats') || '[]');
  let activeChat = null;
  let currentStyle = 'article'; // Default style matching the Python app
  
  // Get API key from .env file (using a different approach that works with plain HTML/JS)
  const API_KEY = getApiKey();

  // Initialize
  initializeApp();
  
  // Function to get API key from a .env file
  function getApiKey() {
    // Try to get from sessionStorage first (it might have been set already)
    const storedKey = sessionStorage.getItem('API_KEY');
    if (storedKey) return storedKey;
    
    // If not in sessionStorage, we'll need to load it from .env
    console.log('Loading API key from .env file');
    return ''; // Default empty value, will be populated by .env-config.js
  }

  function initializeApp() {
    if (chats.length === 0) {
      createNewChat();
    } else {
      renderChatsList();
      setActiveChat(chats[0].id);
    }
    setupEventListeners();
    
    // Populate style select dropdown with available styles from the Python app
    populateStyleDropdown();
    
    // Check if API key is available
    if (!window.ENV || !window.ENV.API_KEY) {
      console.warn('API key not found. Please make sure your .env file is set up correctly.');
    }
  }

  function populateStyleDropdown() {
    // These styles should match the WRITING_STYLES in the Python app
    const styles = [
      'poem', 'article', 'academic', 'story', 'comedy',
      'script', 'fairytale', 'letter', 'sonnet', 'haiku'
    ];
    
    styleSelect.innerHTML = '';
    styles.forEach(style => {
      const option = document.createElement('option');
      option.value = style;
      option.textContent = style.charAt(0).toUpperCase() + style.slice(1);
      styleSelect.appendChild(option);
    });
    
    // Set default style
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
  }

  function handleChatListClick(e) {
    const target = e.target;
    if (target.classList.contains('edit-chat-btn') || target.closest('.edit-chat-btn')) {
      const chatItem = target.closest('.chat-item');
      const chatId = chatItem.dataset.id;
      startEditingTitle(chatId);
      e.stopPropagation();
      return;
    }
    if (target.classList.contains('delete-chat-btn') || target.closest('.delete-chat-btn')) {
      const chatItem = target.closest('.chat-item');
      const chatId = chatItem.dataset.id;
      deleteChat(chatId);
      e.stopPropagation();
      return;
    }
    const chatItem = target.closest('.chat-item');
    if (chatItem) {
      setActiveChat(chatItem.dataset.id);
    }
  }

  function startEditingTitle(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;

    const chatItem = document.querySelector(`.chat-item[data-id="${chatId}"]`);
    const titleSpan = chatItem.querySelector('.manga-text');
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = chat.title;
    input.className = 'w-full p-1 border rounded manga-text';
    
    titleSpan.replaceWith(input);
    input.focus();
    
    input.addEventListener('blur', function() {
      saveTitle(chatId, input.value);
    });
    
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        saveTitle(chatId, input.value);
      }
    });
  }

  function saveTitle(chatId, newTitle) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;
    
    chat.title = newTitle || 'Untitled Chat';
    saveChats();
    renderChatsList();
    setActiveChat(chatId);
  }

  function deleteChat(chatId) {
    if (confirm('Are you sure you want to delete this chat?')) {
      chats = chats.filter(chat => chat.id !== chatId);
      saveChats();
      renderChatsList();
      
      if (chats.length > 0) {
        setActiveChat(chats[0].id);
      } else {
        createNewChat();
      }
    }
  }

  function createNewChat() {
    const newChat = {
      id: 'chat-' + Date.now(),
      title: 'New Chat',
      messages: []
    };
    chats.unshift(newChat);
    saveChats();
    renderChatsList();
    setActiveChat(newChat.id);
  }

  function setActiveChat(chatId) {
    activeChat = chatId;
    const chatItems = document.querySelectorAll('.chat-item');
    chatItems.forEach(item => {
      if (item.dataset.id === chatId) {
        item.classList.add('bg-indigo-100');
        item.classList.remove('bg-white', 'hover:bg-gray-50');
      } else {
        item.classList.remove('bg-indigo-100');
        item.classList.add('bg-white', 'hover:bg-gray-50');
      }
    });
    renderMessages();
  }

  function renderChatsList() {
    chatsList.innerHTML = '';
    chats.forEach(chat => {
      const chatItem = document.createElement('div');
      chatItem.className = 'p-3 rounded-lg cursor-pointer manga-panel transform hover:-rotate-1 bg-white hover:bg-gray-50 mb-2 chat-item';
      chatItem.dataset.id = chat.id;
      chatItem.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="manga-text truncate flex-grow">${chat.title}</span>
          <div class="flex space-x-1">
            <button class="opacity-70 hover:opacity-100 edit-chat-btn">✎</button>
            <button class="text-red-500 opacity-70 hover:opacity-100 delete-chat-btn">✕</button>
          </div>
        </div>
      `;
      chatsList.appendChild(chatItem);
    });
  }

  function renderMessages() {
    chatHistory.innerHTML = '';
    const currentChat = chats.find(chat => chat.id === activeChat);
    if (!currentChat) return;
    currentChat.messages.forEach(message => {
      const messageEl = createMessageElement(message);
      chatHistory.appendChild(messageEl);
    });
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  function createMessageElement(message) {
    const isUser = message.role === 'user';
    const container = document.createElement('div');
    container.className = `flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-6`;
    
    // Convert line breaks to <br> for proper display
    const formattedContent = message.content.replace(/\n/g, '<br>');
    
    container.innerHTML = `
      <div class="${isUser ? 'speech-bubble max-w-2xl transform rotate-1' : 'manga-panel bg-white p-4 transform -rotate-1 max-w-2xl'}">
        <p class="manga-text">${formattedContent}</p>
      </div>
    `;
    return container;
  }

  async function sendMessage() {
    const messageText = messageInput.value.trim();
    if (!messageText) return;

    addMessage('user', messageText);
    messageInput.value = '';
    showLoading();

    try {
      // Call the Gemini API with the user's message
      const response = await callGeminiAPI(messageText);
      addMessage('assistant', response);

      // If this is the first message, update the chat title
      const currentChat = chats.find(chat => chat.id === activeChat);
      if (currentChat && currentChat.messages.length <= 2 && currentChat.title === 'New Chat') {
        const shortTitle = messageText.split(' ').slice(0, 3).join(' ') + '...';
        currentChat.title = shortTitle;
        saveChats();
        renderChatsList();
      }
    } catch (error) {
      console.error('Error fetching response:', error);
      addMessage('assistant', `Error: ${error.message || 'There was an error processing your request. Please check the console for details.'}`);
    } finally {
      hideLoading();
    }
  }

  async function callGeminiAPI(prompt) {
    // Get API key from window.ENV
    const apiKey = window.ENV?.API_KEY;
    
    // Check if API key is available
    if (!apiKey) {
      throw new Error('API key not found. Please check your .env file and make sure it contains API_KEY.');
    }
    
    // Update this URL to the correct Gemini endpoint
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

    try {
      // Log the request for debugging      
      console.log(`Sending prompt to API with style: ${currentStyle}`);

      // Prepare the request payload according to Gemini API docs
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: `${prompt}\n\nRespond in the style of: ${currentStyle}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000
        }
      };

      // Make the API request with proper URL and API key param
      const response = await fetch(`${apiUrl}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      // Check if the response is successful
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Response:', errorData);
        throw new Error(`API error (${response.status}): ${errorData.error?.message || response.statusText}`);
      }

      // Parse the response JSON
      const data = await response.json();
      console.log('API Response:', data);

      // Extract the text from the Gemini API response format
      if (data.candidates && data.candidates[0]?.content?.parts && data.candidates[0].content.parts[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Unexpected API response format');
      }
    } catch (error) {
      console.error('Error calling API:', error);
      throw error;
    }
  }

  function addMessage(role, content) {
    const currentChat = chats.find(chat => chat.id === activeChat);
    if (!currentChat) return;
    
    const message = {
      id: role + '-' + Date.now(),
      role,
      content
    };
    
    currentChat.messages.push(message);
    saveChats();
    
    const messageEl = createMessageElement(message);
    chatHistory.appendChild(messageEl);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  function showLoading() {
    if (!loadingIndicator) return;
    loadingIndicator.classList.remove('hidden');
    chatHistory.appendChild(loadingIndicator);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  function hideLoading() {
    if (!loadingIndicator) return;
    loadingIndicator.classList.add('hidden');
  }

  function saveChats() {
    localStorage.setItem('manga-chats', JSON.stringify(chats));
  }
});