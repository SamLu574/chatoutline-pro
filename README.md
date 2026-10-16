# ChatOutline Pro 📑

> **Universal Floating Table of Contents & Code Navigator for AI Chats (ChatGPT, Claude, DeepSeek).**  
> *Never scroll endlessly to find past prompts or buried code blocks again.*

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Manifest V3](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/SamLu574/chatoutline-pro/pulls)

---

## ⚡ The Problem

When working with modern LLMs (ChatGPT, Claude 3.7, DeepSeek R1) on large engineering projects:
- Conversations easily reach **30 to 100+ turns** with thousands of lines of code.
- Finding a prompt you asked 45 minutes ago requires **violently scrolling the mouse wheel for dozens of pages**, causing browser tabs to freeze and lag.
- Native web interfaces offer **zero table of contents, zero message jump bookmarks, and zero unified code block views**.

---

## ✨ Features

- **🎯 Instant Teleportation**: Floating minimalist outline tree extracting every user prompt. Click any turn to smoothly jump directly to it with a subtle pulse highlight.
- **💻 Centralized Code Hub**: Automatically extracts all code blocks (`Python`, `C++`, `JavaScript`, etc.) across the conversation into an organized side drawer with 1-click clipboard copying.
- **🔍 Real-Time Fuzzy Filter**: Type a keyword to instantly filter prompt topics and code snippets.
- **🛡️ Anti-Breakage Architecture**: Built with semantic mutation observers instead of fragile CSS classes, ensuring resilience against frequent OpenAI/Anthropic UI changes.
- **🔒 100% Local & Zero API Fees**: Pure client-side JavaScript. No external servers, no tracking, and zero API token costs.

---

## 🚀 Supported Platforms

| Platform | URL Pattern | Status |
| :--- | :--- | :---: |
| **ChatGPT** | `chatgpt.com`, `chat.openai.com` | ✅ Supported |
| **Claude** | `claude.ai` | ✅ Supported |
| **DeepSeek** | `chat.deepseek.com` | ✅ Supported |

---

## 🛠️ Quick Installation (Developer Mode - 1 Minute)

1. Clone or download this repository:
   ```bash
   git clone https://github.com/SamLu574/chatoutline-pro.git
   ```
   *(Or download and extract the ZIP release)*.

2. Open your browser and navigate to:
   * **Chrome**: `chrome://extensions/`
   * **Edge**: `edge://extensions/`
   * **Brave**: `brave://extensions/`

3. Turn on **Developer mode** (toggle switch in the top-right corner).

4. Click **Load unpacked** (加载已解压的扩展程序) in the top-left, and select the `chatoutline-pro` folder.

5. Open [ChatGPT](https://chatgpt.com) or [Claude](https://claude.ai), and you will see the floating **`📑 Outline`** pill button on the right side!

---

## 💎 Pricing & License Options

| Feature | Free (Open Core) | Pro ($3.00 Lifetime License) |
| :--- | :---: | :---: |
| Floating Prompt Outline & Instant Jump | ✅ Unlimited Free | ✅ Unlimited Lifetime |
| Smooth Scroll & Teleportation Highlight | ✅ Unlimited Free | ✅ Unlimited Lifetime |
| Multi-Platform Support (ChatGPT / Gemini / Claude / DeepSeek) | ✅ Unlimited Free | ✅ Unlimited Lifetime |
| Real-time Search Filter | ✅ Unlimited Free | ✅ Unlimited Lifetime |
| **Centralized Code Hub (1-Click Batch Copy)** | 2 Preview Blocks | **✅ Unlimited Lifetime** |
| **Future Feature Updates** | ❌ | **✅ Lifetime Free Updates** |

---

## 🔒 Privacy Guarantee

ChatOutline Pro does **NOT** collect, transmit, or store your prompts, code, or personal data on external servers. All outline parsing and DOM operations happen strictly within your local browser session.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) © 2026 Guoqiang Lu.
