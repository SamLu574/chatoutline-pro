/**
 * ChatOutline - Universal AI Long Conversation Navigator & Markdown Exporter
 * Supports: ChatGPT, Claude, Gemini, DeepSeek
 * Freemium: Outline 100% Free Forever | Markdown Export & Code Hub Pro $3.00 Lifetime
 * Version: 1.1.0
 */

(function () {
  'use strict';

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
    const miniTags = document.querySelectorAll('.co-pro-mini');
    miniTags.forEach(tag => {
      tag.style.background = isPro ? '#10a37f' : '#f59e0b';
      tag.innerText = isPro ? '✓' : 'PRO';
    });
  }

  // Toast notification
  function showToast(msg) {
    let toast = document.getElementById('co-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'co-toast';
      toast.className = 'co-toast';
      document.body.appendChild(toast);
    }
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  // Open / Close High-Converting Pro Modal
  function toggleProModal(open) {
    const modal = document.getElementById('co-pro-modal');
    if (!modal) return;
    if (open) {
      modal.classList.remove('co-hidden');
    } else {
      modal.classList.add('co-hidden');
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
          <button class="co-icon-btn" id="co-refresh-btn" title="刷新大纲">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
          </button>
          <button class="co-icon-btn" id="co-close-btn" title="关闭面板">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>

      <div class="co-tabs">
        <div class="co-tab active" data-tab="outline" id="co-tab-outline">📑 大纲目录</div>
        <div class="co-tab" data-tab="code" id="co-tab-code">💻 Code Hub (<span id="co-code-count">0</span>)</div>
      </div>

      <div class="co-search-box">
        <input type="text" class="co-search-input" id="co-search-input" placeholder="搜索提问与代码..." />
      </div>

      <div class="co-content-body" id="co-content-body">
        <div class="co-empty-hint">正在扫描对话...</div>
      </div>

      <!-- In-Page Sticky Conversion Toolbar -->
      <div class="co-footer-bar">
        <button class="co-footer-btn" id="co-export-md-btn" title="一键导出整篇对话为 Markdown (Obsidian / Notion 格式)">
          <span class="co-btn-icon">📥</span>
          <span>导出 Markdown</span>
          <span class="co-pro-mini">PRO</span>
        </button>
        <button class="co-footer-btn" id="co-copy-all-btn" title="一键批量提取当前对话所有代码">
          <span class="co-btn-icon">📋</span>
          <span>提取全部代码</span>
          <span class="co-pro-mini">PRO</span>
        </button>
      </div>
    `;
    document.body.appendChild(panel);

    // 3. High-Converting Pro Upgrade In-Page Modal
    const modal = document.createElement('div');
    modal.id = 'co-pro-modal';
    modal.className = 'co-modal-overlay co-hidden';
    modal.innerHTML = `
      <div class="co-modal-box">
        <div class="co-modal-close" id="co-modal-close">&times;</div>
        <div class="co-modal-badge">💎 CHATOUTLINE PRO</div>
        <div class="co-modal-title">解锁终身专业版 (Lifetime Access)</div>
        <div class="co-modal-subtitle">长对话深度浏览、高质量 Markdown 导出与代码集中管理必备工具</div>
        
        <div class="co-modal-features">
          <div class="co-mf-item">
            <div class="co-mf-icon">⚡</div>
            <div class="co-mf-text">
              <div class="co-mf-title">全对话一键导出 Markdown</div>
              <div class="co-mf-desc">结构化保留问答层级、代码高亮与公式，无缝导入 Obsidian / Notion。</div>
            </div>
          </div>
          <div class="co-mf-item">
            <div class="co-mf-icon">💻</div>
            <div class="co-mf-text">
              <div class="co-mf-title">Code Hub 全局代码提取</div>
              <div class="co-mf-desc">长对话中所有代码块一键批量提取、按语言过滤、一键批量复制。</div>
            </div>
          </div>
          <div class="co-mf-item">
            <div class="co-mf-icon">🔒</div>
            <div class="co-mf-text">
              <div class="co-mf-title">100% 本地隐私安全</div>
              <div class="co-mf-desc">纯本地前端运行，零外部网络请求，企业与敏感代码安全绝不离网。</div>
            </div>
          </div>
        </div>

        <div class="co-modal-pricing">
          <div class="co-pricing-tag">仅需 <span class="co-price">$3.00</span> 美元 · 终身买断</div>
          <a href="https://lusam.gumroad.com/l/chatoutline" target="_blank" class="co-modal-buy-btn" id="co-modal-buy-link">
            <span>立即获取 Pro 授权 (Gumroad 极速结账)</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
          <div class="co-modal-license-area">
            <span style="font-size: 11px; color: var(--co-muted);">已有授权码？</span>
            <input type="text" class="co-modal-license-input" id="co-modal-license-input" placeholder="输入 License Key 激活..." />
            <button class="co-modal-activate-btn" id="co-modal-activate-btn">激活</button>
          </div>
          <div class="co-modal-feedback" id="co-modal-feedback"></div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

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

    // In-Page Toolbar Buttons
    document.getElementById('co-export-md-btn').addEventListener('click', handleExportMarkdown);
    document.getElementById('co-copy-all-btn').addEventListener('click', handleCopyAllCode);

    // Modal Close
    document.getElementById('co-modal-close').addEventListener('click', () => toggleProModal(false));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) toggleProModal(false);
    });

    // Modal License Activation
    const actBtn = document.getElementById('co-modal-activate-btn');
    const actInput = document.getElementById('co-modal-license-input');
    const actMsg = document.getElementById('co-modal-feedback');
    if (actBtn && actInput) {
      actBtn.addEventListener('click', () => {
        const key = actInput.value.trim();
        if (!key) {
          actMsg.style.color = '#ef4444';
          actMsg.innerText = '请输入有效的授权码';
          return;
        }
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ '__chatoutline_is_pro__': true }, () => {
            actMsg.style.color = '#10a37f';
            actMsg.innerText = '✓ 激活成功！已解锁终身 Pro';
            setTimeout(() => {
              isPro = true;
              updateProBadge();
              renderContent();
              toggleProModal(false);
              showToast('🎉 欢迎使用 ChatOutline Pro！');
            }, 600);
          });
        }
      });
      actInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') actBtn.click();
      });
    }

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
          // Find closest next model-response
          const parent = node.closest('.conversation-container, .chat-history, main') || document.body;
          const respNode = node.nextElementSibling || null;
          const respText = respNode ? respNode.innerText.trim() : '';
          turns.push({ id: turns.length + 1, text, el: node, response: respText });
        }
      });

      const codeNodes = document.querySelectorAll('pre code, code-block, .code-container pre, [class*="code-block"]');
      codeNodes.forEach((node, idx) => {
        codes.push({ id: idx + 1, lang: 'code', text: node.innerText, el: node });
      });
    }
    // 2. ChatGPT (chatgpt.com / openai.com)
    else if (host.includes('openai.com') || host.includes('chatgpt.com')) {
      const userNodes = Array.from(document.querySelectorAll('[data-message-author-role="user"]'));

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
        // Try finding next assistant response
        let respText = '';
        const turnContainer = node.closest('[data-testid^="conversation-turn-"]') || node.parentElement;
        if (turnContainer && turnContainer.nextElementSibling) {
          const asstNode = turnContainer.nextElementSibling.querySelector('[data-message-author-role="assistant"]') || 
                           turnContainer.nextElementSibling.querySelector('.markdown');
          if (asstNode) respText = asstNode.innerText.trim();
        }
        turns.push({ id: idx + 1, text: node.innerText.trim(), el: node, response: respText });
      });

      const codeNodes = document.querySelectorAll('pre code');
      codeNodes.forEach((node, idx) => {
        const langClass = Array.from(node.classList).find(c => c.startsWith('language-'));
        const lang = langClass ? langClass.replace('language-', '') : 'code';
        codes.push({ id: idx + 1, lang, text: node.innerText, el: node });
      });
    }
    // 3. Claude.ai
    else if (host.includes('claude.ai')) {
      const userNodes = document.querySelectorAll('.font-user-message, [data-testid="user-message"], div[class*="font-user"]');
      userNodes.forEach((node, idx) => {
        const text = node.innerText.trim();
        if (text) {
          let respText = '';
          const container = node.closest('[data-testid^="chat-turn-"]') || node.parentElement;
          if (container && container.nextElementSibling) {
            const asstNode = container.nextElementSibling.querySelector('.font-claude-message, [data-testid="assistant-message"]');
            if (asstNode) respText = asstNode.innerText.trim();
          }
          turns.push({ id: idx + 1, text, el: node, response: respText });
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
          turns.push({ id: idx + 1, text, el: node, response: '' });
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

  // Export to Markdown Execution
  function handleExportMarkdown() {
    if (!isPro) {
      toggleProModal(true);
      return;
    }
    if (cachedTurns.length === 0) {
      showToast('⚠️ 当前页面暂无提问对话可导出');
      return;
    }

    const title = (document.title || 'AI_Conversation')
      .replace(/\s*[-–|].*$/, '')
      .trim() || 'AI_Conversation';

    let md = `# ${title}\n\n`;
    md += `> 📅 导出时间: ${new Date().toLocaleString()}\n`;
    md += `> 🚀 工具引擎: [ChatOutline Pro](https://lusam.gumroad.com/l/chatoutline) (Freemium)\n\n---\n\n`;

    cachedTurns.forEach((turn, idx) => {
      md += `### 👤 提问 #${idx + 1}\n\n${turn.text}\n\n`;
      if (turn.response) {
        md += `### 🤖 回答 #${idx + 1}\n\n${turn.response}\n\n---\n\n`;
      }
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[/\\?%*:|"<>]/g, '_')}_export.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('✓ 已成功导出为 Markdown 文件！');
  }

  // Batch Copy All Code Execution
  function handleCopyAllCode() {
    if (!isPro) {
      toggleProModal(true);
      return;
    }
    if (cachedCodes.length === 0) {
      showToast('⚠️ 当前对话暂未提取到代码块');
      return;
    }

    const allCode = cachedCodes.map((c, i) => `// ================================\n// Code Block #${i+1} [${c.lang}]\n// ================================\n${c.text}`).join('\n\n\n');
    navigator.clipboard.writeText(allCode).then(() => {
      showToast(`✓ 已成功复制全部 ${cachedCodes.length} 处代码到剪贴板！`);
    });
  }

  // Render UI Content
  function renderContent(query = '') {
    const container = document.getElementById('co-content-body');
    if (!container) return;

    // Outline Tab: 100% Free Forever
    if (currentTab === 'outline') {
      const filtered = query ? cachedTurns.filter(t => t.text.toLowerCase().includes(query)) : cachedTurns;
      if (filtered.length === 0) {
        container.innerHTML = `<div class="co-empty-hint">${cachedTurns.length === 0 ? '暂未检测到对话。开始发送消息吧！' : '未找到匹配的提问内容。'}</div>`;
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
              <button class="co-copy-btn" data-code="${encodeURIComponent(item.text)}">复制</button>
            </div>
            <div class="co-code-preview">${escapeHtml(item.text.split('\n')[0] || '// Empty')}</div>
          </div>
        `).join('');
      }

      // If not Pro, display Pro banner in Code Hub
      if (!isPro && filtered.length > 0) {
        html += `
          <div class="co-pro-card">
            <div class="co-pro-card-title">💎 解锁 Code Hub 完整提取</div>
            <div class="co-pro-card-desc">当前对话共有 <strong>${cachedCodes.length}</strong> 处代码块。升级 Pro 即可一键批量导出或合并复制全部代码。</div>
            <button class="co-pro-buy-btn" id="co-trigger-modal-btn">获取 Pro 终身授权 ($3.00)</button>
          </div>
        `;
      }

      container.innerHTML = html;

      // Bind trigger modal button
      const trigBtn = document.getElementById('co-trigger-modal-btn');
      if (trigBtn) {
        trigBtn.addEventListener('click', () => toggleProModal(true));
      }

      // Bind copy buttons
      container.querySelectorAll('.co-copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const code = decodeURIComponent(btn.getAttribute('data-code'));
          navigator.clipboard.writeText(code).then(() => {
            const original = btn.innerText;
            btn.innerText = '已复制!';
            btn.style.borderColor = '#10a37f';
            setTimeout(() => {
              btn.innerText = original;
              btn.style.borderColor = '';
            }, 1500);
          });
        });
      });
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
