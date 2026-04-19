(function () {
  'use strict';

  const STORAGE_KEY = '18k_chat_history_v1';
  const MAX_HISTORY = 20;
  const API_URL = '/api/chat';

  function loadHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.slice(-MAX_HISTORY) : [];
    } catch { return []; }
  }

  function saveHistory(history) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-MAX_HISTORY)));
    } catch { /* ignore quota errors */ }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function linkify(text) {
    const escaped = escapeHtml(text);
    return escaped
      .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
      .replace(/(\b(?:booking\.)?18knailboutique\.com[^\s<]*)/g, '<a href="https://$1" target="_blank" rel="noopener">$1</a>')
      .replace(/\((\d{3})\)\s?(\d{3})-(\d{4})/g, '<a href="tel:+1$1$2$3">($1) $2-$3</a>');
  }

  const styles = `
    .k18-chat-btn{position:fixed;bottom:24px;right:24px;width:60px;height:60px;border-radius:50%;background:#B8964E;color:#1A1714;border:none;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,0.25);z-index:9998;display:flex;align-items:center;justify-content:center;transition:transform 0.2s, background 0.2s;font-family:'Outfit',sans-serif;}
    .k18-chat-btn:hover{background:#C9A96E;transform:scale(1.05);}
    .k18-chat-btn svg{width:26px;height:26px;}
    .k18-chat-btn.k18-hidden{display:none;}
    .k18-chat-panel{position:fixed;bottom:24px;right:24px;width:360px;max-width:calc(100vw - 32px);height:540px;max-height:calc(100vh - 48px);background:#FDFBF8;border:1px solid rgba(184,150,78,0.3);border-radius:8px;box-shadow:0 12px 48px rgba(0,0,0,0.25);z-index:9999;display:flex;flex-direction:column;overflow:hidden;font-family:'Outfit',sans-serif;color:#1A1714;}
    .k18-chat-panel.k18-hidden{display:none;}
    .k18-chat-header{background:#1A1714;color:#F5F0EB;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(184,150,78,0.2);}
    .k18-chat-title{font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:400;letter-spacing:0.1em;color:#C9A96E;}
    .k18-chat-subtitle{font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(245,240,235,0.5);margin-top:2px;}
    .k18-chat-close{background:none;border:none;color:rgba(245,240,235,0.6);cursor:pointer;font-size:22px;padding:0;line-height:1;width:24px;height:24px;display:flex;align-items:center;justify-content:center;}
    .k18-chat-close:hover{color:#C9A96E;}
    .k18-chat-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;background:#FDFBF8;}
    .k18-msg{max-width:85%;padding:10px 14px;border-radius:14px;font-size:14px;line-height:1.5;word-wrap:break-word;}
    .k18-msg.k18-user{background:#B8964E;color:#FDFBF8;align-self:flex-end;border-bottom-right-radius:4px;}
    .k18-msg.k18-bot{background:#F0E6DC;color:#1A1714;align-self:flex-start;border-bottom-left-radius:4px;}
    .k18-msg a{color:inherit;text-decoration:underline;}
    .k18-msg.k18-bot a{color:#B8964E;}
    .k18-typing{display:flex;gap:4px;padding:12px 14px;background:#F0E6DC;border-radius:14px;border-bottom-left-radius:4px;align-self:flex-start;}
    .k18-typing span{width:7px;height:7px;background:#B8964E;border-radius:50%;animation:k18bounce 1.2s infinite ease-in-out;}
    .k18-typing span:nth-child(2){animation-delay:0.15s;}
    .k18-typing span:nth-child(3){animation-delay:0.3s;}
    @keyframes k18bounce{0%,80%,100%{transform:scale(0.6);opacity:0.5;}40%{transform:scale(1);opacity:1;}}
    .k18-chat-input-row{display:flex;border-top:1px solid rgba(184,150,78,0.2);background:#FAF7F4;padding:10px;gap:8px;}
    .k18-chat-input{flex:1;border:1px solid rgba(184,150,78,0.3);border-radius:20px;padding:10px 16px;font-size:14px;font-family:inherit;color:#1A1714;background:#fff;outline:none;resize:none;max-height:80px;line-height:1.4;}
    .k18-chat-input:focus{border-color:#B8964E;}
    .k18-chat-send{background:#B8964E;color:#FDFBF8;border:none;border-radius:50%;width:38px;height:38px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background 0.2s;}
    .k18-chat-send:hover{background:#C9A96E;}
    .k18-chat-send:disabled{opacity:0.4;cursor:not-allowed;}
    .k18-chat-send svg{width:18px;height:18px;}
    .k18-chat-footer{padding:8px 14px;font-size:10px;color:#8C7B6B;text-align:center;background:#FAF7F4;border-top:1px solid rgba(184,150,78,0.1);letter-spacing:0.05em;}
    @media(max-width:480px){.k18-chat-panel{bottom:0;right:0;width:100vw;max-width:100vw;height:100vh;max-height:100vh;border-radius:0;}}
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  const chatBtn = document.createElement('button');
  chatBtn.className = 'k18-chat-btn';
  chatBtn.setAttribute('aria-label', 'Open chat');
  chatBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>';

  const panel = document.createElement('div');
  panel.className = 'k18-chat-panel k18-hidden';
  panel.innerHTML = `
    <div class="k18-chat-header">
      <div>
        <div class="k18-chat-title">18K ASSISTANT</div>
        <div class="k18-chat-subtitle">Ask us anything</div>
      </div>
      <button class="k18-chat-close" aria-label="Close chat">&times;</button>
    </div>
    <div class="k18-chat-messages" id="k18-messages"></div>
    <div class="k18-chat-input-row">
      <textarea class="k18-chat-input" id="k18-input" placeholder="Type your message..." rows="1"></textarea>
      <button class="k18-chat-send" id="k18-send" aria-label="Send message">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
      </button>
    </div>
    <div class="k18-chat-footer">AI assistant — for booking, call (424) 238-5500</div>
  `;

  document.body.appendChild(chatBtn);
  document.body.appendChild(panel);

  const messagesEl = panel.querySelector('#k18-messages');
  const inputEl = panel.querySelector('#k18-input');
  const sendBtn = panel.querySelector('#k18-send');
  const closeBtn = panel.querySelector('.k18-chat-close');

  let history = loadHistory();
  let busy = false;

  function renderMessages() {
    messagesEl.innerHTML = '';
    if (history.length === 0) {
      const greeting = document.createElement('div');
      greeting.className = 'k18-msg k18-bot';
      greeting.innerHTML = "Hi! I'm the 18K assistant. Ask me about our services, prices, hours, or anything else about the boutique.";
      messagesEl.appendChild(greeting);
    } else {
      history.forEach(m => {
        const div = document.createElement('div');
        div.className = 'k18-msg ' + (m.role === 'user' ? 'k18-user' : 'k18-bot');
        div.innerHTML = linkify(m.content);
        messagesEl.appendChild(div);
      });
    }
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    const t = document.createElement('div');
    t.className = 'k18-typing';
    t.id = 'k18-typing';
    t.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(t);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTyping() {
    const t = document.getElementById('k18-typing');
    if (t) t.remove();
  }

  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text || busy) return;

    busy = true;
    sendBtn.disabled = true;
    inputEl.value = '';

    history.push({ role: 'user', content: text });
    saveHistory(history);
    renderMessages();
    showTyping();

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      hideTyping();

      const reply = (data && data.reply) ? data.reply : "Sorry, I couldn't reach the assistant right now. Please call (424) 238-5500.";
      history.push({ role: 'assistant', content: reply });
      saveHistory(history);
      renderMessages();
    } catch (e) {
      hideTyping();
      history.push({ role: 'assistant', content: "Sorry, I'm having trouble connecting. Please call us at (424) 238-5500." });
      saveHistory(history);
      renderMessages();
    } finally {
      busy = false;
      sendBtn.disabled = false;
      inputEl.focus();
    }
  }

  function openChat() {
    panel.classList.remove('k18-hidden');
    chatBtn.classList.add('k18-hidden');
    renderMessages();
    setTimeout(() => inputEl.focus(), 100);
  }

  function closeChat() {
    panel.classList.add('k18-hidden');
    chatBtn.classList.remove('k18-hidden');
  }

  chatBtn.addEventListener('click', openChat);
  closeBtn.addEventListener('click', closeChat);
  sendBtn.addEventListener('click', sendMessage);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
})();
