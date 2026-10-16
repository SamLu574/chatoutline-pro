// ChatOutline Pro - Popup Controller
document.addEventListener('DOMContentLoaded', () => {
  const badge = document.getElementById('header-badge');
  const proBox = document.getElementById('pro-box');
  const activateBtn = document.getElementById('activate-btn');
  const licenseInput = document.getElementById('license-input');
  const feedbackMsg = document.getElementById('feedback-msg');
  const codehubItem = document.getElementById('codehub-status-item');

  function renderStatus(isPro) {
    if (isPro) {
      if (badge) {
        badge.innerText = 'PRO';
        badge.className = 'badge';
      }
      if (codehubItem) {
        codehubItem.innerText = '✅ Code Hub 代码块归类提取 (已解锁)';
      }
      if (proBox) {
        proBox.innerHTML = `
          <div style="color: #10a37f; font-weight: 700; font-size: 13px; margin-bottom: 4px;">🎉 终身 Pro 授权已生效</div>
          <div style="color: #94a3b8; font-size: 11px; line-height: 1.4;">您已解锁全量代码集中提取、复制与全部高级特性。</div>
        `;
      }
    } else {
      if (badge) {
        badge.innerText = 'FREE';
        badge.className = 'badge free';
      }
    }
  }

  // Load existing license state
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['__chatoutline_is_pro__'], (res) => {
      const isPro = res.__chatoutline_is_pro__ === true;
      renderStatus(isPro);
    });
  }

  // Activate handler - NO alerts, 100% inline feedback
  if (activateBtn && licenseInput) {
    activateBtn.addEventListener('click', () => {
      const key = licenseInput.value.trim();
      if (!key) {
        if (feedbackMsg) {
          feedbackMsg.style.color = '#ef4444';
          feedbackMsg.innerText = '请输入有效的授权码';
        }
        return;
      }

      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ '__chatoutline_is_pro__': true }, () => {
          if (feedbackMsg) {
            feedbackMsg.style.color = '#10a37f';
            feedbackMsg.innerText = '✓ 激活成功！已解锁终身 Pro';
          }
          setTimeout(() => {
            renderStatus(true);
          }, 600);
        });
      }
    });

    licenseInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        activateBtn.click();
      }
    });
  }
});
