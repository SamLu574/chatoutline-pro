/**
 * ChatOutline - Universal AI Long Conversation Navigator
 * Supports: ChatGPT, Claude, Gemini, DeepSeek
 * Freemium Model: Outline 100% Free Forever | Code Hub Pro $3.00 Lifetime
 */

(function () {
  'use strict';

  // Prevent multiple injections
  if (window.__chatoutline_initialized__) return;
  window.__chatoutline_initialized__ = true;

  let currentTab = 'outline'; // 'outline' | 'code'
  let cachedTurns = [];
  let cachedCodes = [];
  let isPanelOpen = false;
  let isPro = false;

  // Load Pro Status from Chrome Storage
  function loadProStatus() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['__chatoutline_is_pro__'], (res) => {
        isPro = res.__chatoutline_is_pro__ === true;
        updateProBadge();
        if (currentTab === 'code') renderContent();
      });
    }
  }

  // Listen to cross-extension storage updates
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.__chatoutline_is_pro__) {
        isPro = changes.__chatoutline_is_pro__.newValue === true;
        updateProBadge();
        renderContent();
      }
    });
  }

  function updateProBadge() {
    const badge = document.querySelector('.co-pro-tag');
    if (badge) {
      badge.innerText = isPro ? 'PRO' : 'FREE';
      badge.style.background = isPro 
        ? 'linear-gradient(135deg, #10a37f, #0284c7)'
        : 'rgba(100, 116, 139, 0.4)';
    }
  }

  // Initialize UI Elements
  function createUI() {
    // 1. Floating Pill Toggle Button
    const toggleBtn = document.createElement('div');
    toggleBtn.id = 'chatoutline-toggle-btn';
    toggleBtn.innerHTML = `
      <span>📑 Outline</span>
      <span class="co-badge" id="co-badge-count">0</span>
    `;
    toggleBtn.addEventListener('click', togglePanel);
    document.body.appendChild(toggleBtn);

    // 2. Floating Panel
    const panel = document.createElement('div');
    panel.id = 'chatoutline-panel';
    panel.className = 'co-hidden';
    panel.innerHTML = `
      <div class="co-header">
        <div class="co-title-box">
          <span class="co-title">ChatOutline</span>
          <span class="co-pro-tag">${isPro ? 'PRO' : 'FREE'}</span>
        </div>
        <div class="co-actions">
          <button class="co-icon-btn" id="co-refresh-btn" title="Refresh Outline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
          </button>
          <button class="co-icon-btn" id="co-close-btn" title="Close Panel">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>

      <div class="co-tabs">
        <div class="co-tab active" data-tab="outline" id="co-tab-outline">📑 Outline</div>
        <div class="co-tab" data-tab="code" id="co-tab-code">💻 Code Hub (<span id="co-code-count">0</span>)</div>
      </div>

      <div class="co-search-box">
        <input type="text" class="co-search-input" id="co-search-input" placeholder="Search prompts & code..." />
      </div>

      <div class="co-content-body" id="co-content-body">
        <div class="co-empty-hint">Scanning conversation...</div>
      </div>
    `;
    document.body.appendChild(panel);

    // Bind Event Handlers
    document.getElementById('co-close-btn').addEventListener('click', () => togglePanel(false));
    document.getElementById('co-refresh-btn').addEventListener('click', scanChat);
    
    document.querySelectorAll('.co-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        document.querySelectorAll('.co-tab').forEach(t => t.classList.remove('active'));
        e.currentTarget.classList.add('active');
        currentTab = e.currentTarget.getAttribute('data-tab');
        renderContent();
      });
    });

    document.getElementById('co-search-input').addEventListener('input', (e) => {
      renderContent(e.target.value.trim().toLowerCase());
    });

    // Check stored open state
    if (localStorage.getItem('__chatoutline_open__') === 'true') {
      togglePanel(true);
    }

    updateProBadge();
  }

  function togglePanel(forcedState) {
    const panel = document.getElementById('chatoutline-panel');
    if (!panel) return;
    
    isPanelOpen = typeof forcedState === 'boolean' ? forcedState : !isPanelOpen;
    if (isPanelOpen) {
      panel.classList.remove('co-hidden');
      localStorage.setItem('__chatoutline_open__', 'true');
      scanChat();
    } else {
      panel.classList.add('co-hidden');
      localStorage.setItem('__chatoutline_open__', 'false');
    }
  }

  // Multi-Platform Robust Message & Code Scanner
  function scanChat() {
    const host = window.location.hostname;
    const turns = [];
    const codes = [];

    // 1. Google Gemini (gemini.google.com)
    if (host.includes('gemini.google.com')) {
      const userNodes = document.querySelectorAll('user-query, .query-content, .query-text, [data-test-id="user-query"], .user-query-container, div[class*="user-query"], div[class*="query-content"]');
      const seen = new Set();
      userNodes.forEach((node) => {
        const text = node.innerText.trim();
        if (text && !seen.has(text)) {
          seen.add(text);
          turns.push({ id: turns.length + 1, text, el: node });
        }
      });

      const codeNodes = document.querySelectorAll('pre code, code-block, .code-container pre, [class*="code-block"]');
      codeNodes.forEach((node, idx) => {
        const codeText = node.innerText;
        codes.push({ id: idx + 1, lang: 'code', text: codeText, el: node });
      });
    }
    // 2. ChatGPT (chatgpt.com / openai.com)
    else if (host.includes('openai.com') || host.includes('chatgpt.com')) {
      let userNodes = Array.from(document.querySelectorAll('[data-message-author-role="user"]'));

      if (userNodes.length === 0) {
        const turnContainers = document.querySelectorAll('[data-testid^="conversation-turn-"], article');
        turnContainers.forEach(container => {
          const isAssistant = container.querySelector('[data-message-author-role="assistant"]') || 
                              container.querySelector('.markdown') || 
                              container.querySelector('[data-testid*="assistant"]');
          if (!isAssistant) {
            const textNode = container.querySelector('.whitespace-pre-wrap') || 
                             container.querySelector('[class*="user"]') || 
                             container;
            if (textNode && textNode.innerText.trim()) {
              userNodes.push(textNode);
            }
          }
        });
      }

      if (userNodes.length === 0) {
        const bubbles = document.querySelectorAll('.whitespace-pre-wrap');
        bubbles.forEach(bubble => {
          if (!bubble.closest('.markdown') && !bubble.closest('[data-message-author-role="assistant"]')) {
            if (bubble.innerText.trim()) {
              userNodes.push(bubble);
            }
          }
        });
      }

      const seen = new Set();
      const uniqueUserNodes = [];
      userNodes.forEach(node => {
        const txt = node.innerText.trim();
        if (txt && !seen.has(txt)) {
          seen.add(txt);
          uniqueUserNodes.push(node);
        }
      });

      uniqueUserNodes.forEach((node, idx) => {
        turns.push({ id: idx + 1, text: node.innerText.trim(), el: node });
      });

      const codeNodes = document.querySelectorAll('pre code');
      codeNodes.forEach((node, idx) => {
        const langClass = Array.from(node.classList).find(c => c.startsWith('language-'));
        const lang = langClass ? langClass.replace('language-', '') : 'code';
        const codeText = node.innerText;
        codes.push({ id: idx + 1, lang, text: codeText, el: node });
      });
    }
    // 3. Claude.ai
    else if (host.includes('claude.ai')) {
      const userNodes = document.querySelectorAll('.font-user-message, [data-testid="user-message"], div[class*="font-user"]');
      userNodes.forEach((node, idx) => {
        const text = node.innerText.trim();
        if (text) {
          turns.push({ id: idx + 1, text, el: node });
        }
      });

      const codeNodes = document.querySelectorAll('pre code, .code-block code');
      codeNodes.forEach((node, idx) => {
        const lang = node.getAttribute('data-language') || 'code';
        codes.push({ id: idx + 1, lang, text: node.innerText, el: node });
      });
    }
    // 4. DeepSeek & Generic Fallback
    else {
      const possibleUsers = document.querySelectorAll('.chat-message-user, div[class*="user-message"], [data-role="user"]');
      possibleUsers.forEach((node, idx) => {
        const text = node.innerText.trim();
        if (text) {
          turns.push({ id: idx + 1, text, el: node });
        }
      });

      const codeNodes = document.querySelectorAll('pre code');
      codeNodes.forEach((node, idx) => {
        codes.push({ id: idx + 1, lang: 'code', text: node.innerText, el: node });
      });
    }

    cachedTurns = turns;
    cachedCodes = codes;

    // Update Badges
    const badge = document.getElementById('co-badge-count');
    if (badge) badge.innerText = turns.length;
    
    const codeCount = document.getElementById('co-code-count');
    if (codeCount) codeCount.innerText = codes.length;

    renderContent();
  }

  // Render UI Content
  function renderContent(query = '') {
    const container = document.getElementById('co-content-body');
    if (!container) return;

    // Outline Tab: 100% Free Forever
    if (currentTab === 'outline') {
      const filtered = query ? cachedTurns.filter(t => t.text.toLowerCase().includes(query)) : cachedTurns;
      if (filtered.length === 0) {
        container.innerHTML = `<div class="co-empty-hint">${cachedTurns.length === 0 ? 'No user turns found yet. Start chatting!' : 'No matching prompts found.'}</div>`;
        return;
      }

      container.innerHTML = filtered.map(item => `
        <div class="co-item" data-id="${item.id}">
          <span class="co-item-idx">#${item.id}</span>
          <span class="co-item-text">${escapeHtml(item.text)}</span>
        </div>
      `).join('');

      container.querySelectorAll('.co-item').forEach(el => {
        el.addEventListener('click', () => {
          const id = parseInt(el.getAttribute('data-id'), 10);
          const target = cachedTurns.find(t => t.id === id);
          if (target && target.el) {
            teleportToElement(target.el);
          }
        });
      });
    } else {
      // Code Hub Tab: Pro Feature ($3.00 Lifetime, with 2 free preview blocks)
      const filtered = query ? cachedCodes.filter(c => c.text.toLowerCase().includes(query) || c.lang.toLowerCase().includes(query)) : cachedCodes;
      
      let html = '';
      if (filtered.length === 0) {
        html += `<div class="co-empty-hint">当前对话暂未发现代码块。</div>`;
      } else {
        const displayList = isPro ? filtered : filtered.slice(0, 2);
        html += displayList.map(item => `
          <div class="co-code-card">
            <div class="co-code-header">
              <span class="co-code-lang">${escapeHtml(item.lang)}</span>
              <button class="co-copy-btn" data-code="${encodeURIComponent(item.text)}">Copy</button>
            </div>
            <div class="co-code-preview">${escapeHtml(item.text.split('\n')[0] || '// Empty')}</div>
          </div>
        `).join('');
      }

      // If not unlocked, display Pro upgrade card below preview
      if (!isPro) {
        html += `
          <div class="co-pro-card">
            <div class="co-pro-card-title">💎 解锁 Code Hub Pro</div>
            <div class="co-pro-card-desc">检测到当前对话共 ${cachedCodes.length} 处代码。仅需 $3.00 美元买断，终身无限提取与一键复制代码。</div>
            <a href="https://lusam.gumroad.com/l/chatoutline" target="_blank" class="co-pro-buy-btn">获取 Pro 授权 ($3.00)</a>
            <div class="co-license-row">
              <input type="text" class="co-license-input" id="co-in-license" placeholder="输入授权码..." />
              <button class="co-license-btn" id="co-in-activate">激活</button>
            </div>
            <div class="co-license-msg" id="co-in-msg"></div>
          </div>
        `;
      }

      container.innerHTML = html;

      // Bind copy buttons
      container.querySelectorAll('.co-copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const code = decodeURIComponent(btn.getAttribute('data-code'));
          navigator.clipboard.writeText(code).then(() => {
            const original = btn.innerText;
            btn.innerText = 'Copied!';
            btn.style.borderColor = '#10a37f';
            setTimeout(() => {
              btn.innerText = original;
              btn.style.borderColor = '';
            }, 1500);
          });
        });
      });

      // Bind inline Pro activation
      const inBtn = document.getElementById('co-in-activate');
      const inInput = document.getElementById('co-in-license');
      const inMsg = document.getElementById('co-in-msg');
      if (inBtn && inInput) {
        inBtn.addEventListener('click', () => {
          const key = inInput.value.trim();
          if (!key) {
            if (inMsg) {
              inMsg.style.color = '#ef4444';
              inMsg.innerText = '请输入授权码';
            }
            return;
          }
          if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ '__chatoutline_is_pro__': true }, () => {
              if (inMsg) {
                inMsg.style.color = '#10a37f';
                inMsg.innerText = '✓ 激活成功！已解锁终身 Pro';
              }
              setTimeout(() => {
                isPro = true;
                updateProBadge();
                renderContent();
              }, 500);
            });
          }
        });

        inInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            inBtn.click();
          }
        });
      }
    }
  }

  // Smooth Teleportation & Visual Pulse Highlight
  function teleportToElement(element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element.classList.remove('chatoutline-target-highlight');
    void element.offsetWidth; // Force reflow
    element.classList.add('chatoutline-target-highlight');
    setTimeout(() => {
      element.classList.remove('chatoutline-target-highlight');
    }, 2200);
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Debounced DOM Observer
  let debounceTimer = null;
  const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (isPanelOpen || document.getElementById('chatoutline-toggle-btn')) {
        scanChat();
      }
    }, 400);
  });

  // Start initialization
  function init() {
    loadProStatus();
    createUI();
    scanChat();
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
