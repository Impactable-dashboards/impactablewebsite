/* Impactable site chat widget */
(function () {
  'use strict';

  if (window.__IMPACTABLE_CHAT_WIDGET) return;
  window.__IMPACTABLE_CHAT_WIDGET = true;

  try {
    var FUNCTION_URL = 'https://lwlwnstqcuoheiwltfnl.supabase.co/functions/v1/prompt';
    var MEETING_URL = window.IMPACTABLE_MEETING_URL || 'https://landbot.online/v3/H-2201411-ZNNL8EM9RF7C2XAC/index.html';
    var BUTTON_SIZE = 60;

    var isOpen = false;
    var container = null;
    var button = null;
    var chatInited = false;
    var viewportListenersBound = false;

    function thisScriptSrc() {
      if (document.currentScript && document.currentScript.src) return document.currentScript.src;
      var scripts = document.getElementsByTagName('script');
      var i, src;
      for (i = 0; i < scripts.length; i++) {
        src = scripts[i].src || '';
        if (src.indexOf('chat-widget.js') !== -1) return src;
      }
      return '';
    }

    function widgetBase() {
      var src = thisScriptSrc();
      if (src) return src.replace(/js\/chat-widget\.js(\?.*)?$/, '');
      return 'assets/';
    }

    function assetUrl(file) {
      return widgetBase() + 'img/' + file;
    }

    function cssUrl() {
      var src = thisScriptSrc();
      if (src) return src.replace(/js\/chat-widget\.js(\?.*)?$/, 'css/chat-widget.css');
      return 'assets/css/chat-widget.css';
    }

    function ensureStyles() {
      if (document.getElementById('impactable-chat-widget-css')) return;
      var link = document.createElement('link');
      link.id = 'impactable-chat-widget-css';
      link.rel = 'stylesheet';
      link.href = cssUrl();
      document.head.appendChild(link);
    }

    function loadMarked(cb) {
      if (typeof window.marked === 'function') {
        cb();
        return;
      }
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
      s.onload = cb;
      document.head.appendChild(s);
    }

    function setOpenState(open) {
      isOpen = !!open;
      document.documentElement.classList.toggle('imp-chat-open', isOpen);
      if (isOpen) {
        openPanel();
        if (button) {
          button.setAttribute('aria-label', 'Close chat');
          button.setAttribute('aria-expanded', 'true');
          button.style.display = 'none';
        }
      } else {
        if (container) container.style.display = 'none';
        if (button) {
          button.setAttribute('aria-label', 'Open chat');
          button.setAttribute('aria-expanded', 'false');
          button.style.display = '';
        }
      }
    }

    function toggle() {
      setOpenState(!isOpen);
    }

    window.openImpactableChat = function () {
      setOpenState(true);
    };

    function initChat() {
      if (chatInited) return;
      chatInited = true;

      var chatEl = document.getElementById('impactable-chat');
      var queryEl = document.getElementById('impactable-query');
      var sendEl = document.getElementById('impactable-send');
      var inputWrap = document.getElementById('impactable-input-wrap');
      if (!chatEl || !queryEl || !sendEl) return;

      var chatState = { messages: [] };
      var isHistoryLoading = true;
      var isPermanentlyDisabled = false;
      var loadingEl = document.getElementById('impactable-loading');
      var quickWrapEl = document.querySelector('.impactable-inline-root .imp-quick-actions');

      function renderCurrentChat() {
        chatEl.innerHTML = '';
        var msgs = chatState.messages;
        if (msgs.length === 0) {
          chatEl.style.display = 'none';
          var welcomeEl = document.getElementById('impactable-welcome-block');
          if (welcomeEl) welcomeEl.style.display = '';
          if (quickWrapEl) quickWrapEl.style.display = '';
          var inputEl = document.getElementById('impactable-input');
          if (inputEl && inputWrap && inputEl.parentElement === inputWrap) {
            inputWrap.removeChild(inputEl);
            var welcomeInputArea = document.querySelector('.imp-welcome-input-area');
            if (welcomeInputArea) welcomeInputArea.appendChild(inputEl);
            inputWrap.style.display = 'none';
          }
          var mainEl = chatEl.closest('.impactable-inline-main');
          if (mainEl) mainEl.classList.remove('has-chat');
          return;
        }
        for (var i = 0; i < msgs.length; i++) {
          addMessage(msgs[i].role, msgs[i].content, { pushToChat: false });
        }
        var welcomeHide = document.getElementById('impactable-welcome-block');
        if (welcomeHide) welcomeHide.style.display = 'none';
        if (quickWrapEl) quickWrapEl.style.display = 'none';
        moveInputToBottom();
        chatEl.style.display = 'flex';
        var mainShow = chatEl.closest('.impactable-inline-main');
        if (mainShow) mainShow.classList.add('has-chat');
        chatEl.scrollTop = chatEl.scrollHeight;
      }

      if (window.marked) window.marked.setOptions({ breaks: true, gfm: true });

      function getToken() {
        var c = document.cookie || '';
        var m = c.match(/(?:^|;\s*)impactable_os_token=([^;]+)/) || c.match(/(?:^|;\s*)impactable_token=([^;]+)/);
        if (m) return decodeURIComponent(m[1].trim());
        return localStorage.getItem('impactable_token') || null;
      }

      function ensureMeetingLink(html) {
        if (!html || typeof html !== 'string') return html;
        var root = document.getElementById('impactable-widget-panel');
        var url = (root && root.getAttribute('data-meeting-url')) || MEETING_URL || '';
        if (!url || html.indexOf('Schedule a meeting with Impactable') === -1) return html;
        if (html.indexOf('>Schedule a meeting with Impactable</a>') !== -1) return html;
        var link = '<a href="' + url.replace(/"/g, '&quot;') + '" target="_blank" rel="noopener noreferrer">Schedule a meeting with Impactable</a>';
        return html.replace(/Schedule a meeting with Impactable/g, link);
      }

      function moveInputToBottom() {
        if (!inputWrap) return;
        var input = document.getElementById('impactable-input');
        if (input && input.parentElement && input.parentElement.classList.contains('imp-welcome-input-area')) {
          input.parentElement.removeChild(input);
          inputWrap.appendChild(input);
          inputWrap.style.display = 'block';
        }
      }

      function keepComposerVisible() {
        if (!inputWrap || window.innerWidth > 768) return;
        window.requestAnimationFrame(function () {
          inputWrap.scrollIntoView({ block: 'end' });
        });
      }

      function disableInput() {
        isPermanentlyDisabled = true;
        queryEl.disabled = true;
        queryEl.setAttribute('aria-disabled', 'true');
        sendEl.disabled = true;
      }

      function setLoadingState(loading) {
        isHistoryLoading = !!loading;
        if (loadingEl) loadingEl.style.display = isHistoryLoading ? 'flex' : 'none';
        if (isHistoryLoading) {
          if (quickWrapEl) quickWrapEl.style.display = 'none';
          var welcomeHide = document.getElementById('impactable-welcome-block');
          if (welcomeHide) welcomeHide.style.display = 'none';
          chatEl.style.display = 'none';
          if (inputWrap) inputWrap.style.display = 'none';
          var mainHide = chatEl.closest('.impactable-inline-main');
          if (mainHide) mainHide.classList.remove('has-chat');
        }
        if (!isPermanentlyDisabled) {
          queryEl.disabled = isHistoryLoading;
          if (isHistoryLoading) {
            queryEl.setAttribute('aria-disabled', 'true');
            queryEl.placeholder = 'Loading previous conversation...';
          } else {
            queryEl.removeAttribute('aria-disabled');
            queryEl.placeholder = 'Type your message...';
          }
          sendEl.disabled = isHistoryLoading;
        }
        var inputEl = document.getElementById('impactable-input');
        if (inputEl) {
          if (isHistoryLoading) inputEl.classList.add('imp-disabled');
          else inputEl.classList.remove('imp-disabled');
        }
        var quickBtnsDisable = document.querySelectorAll('.impactable-inline-root .imp-quick-btn');
        for (var q = 0; q < quickBtnsDisable.length; q++) {
          quickBtnsDisable[q].disabled = isHistoryLoading || isPermanentlyDisabled;
        }
      }

      var rocketIconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3.75065 13.75C2.50065 14.8 2.08398 17.9167 2.08398 17.9167C2.08398 17.9167 5.20065 17.5 6.25065 16.25C6.84232 15.55 6.83398 14.475 6.17565 13.825C5.85174 13.5159 5.42506 13.3372 4.97751 13.3234C4.52995 13.3095 4.09305 13.4615 3.75065 13.75Z" stroke="#0A2245" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 12.5L7.5 10C7.94345 8.84957 8.50184 7.74676 9.16667 6.70838C10.1377 5.15587 11.4897 3.87758 13.0942 2.99512C14.6986 2.11266 16.5022 1.65535 18.3333 1.66671C18.3333 3.93338 17.6833 7.91671 13.3333 10.8334C12.2807 11.499 11.164 12.0573 10 12.5Z" stroke="#0A2245" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.50065 9.99993H3.33398C3.33398 9.99993 3.79232 7.47493 5.00065 6.6666C6.35065 5.7666 9.16732 6.6666 9.16732 6.6666" stroke="#0A2245" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 12.4999V16.6666C10 16.6666 12.525 16.2083 13.3333 14.9999C14.2333 13.6499 13.3333 10.8333 13.3333 10.8333" stroke="#0A2245" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      var personIconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15.8327 17.5V15.8333C15.8327 14.9493 15.4815 14.1014 14.8564 13.4763C14.2312 12.8512 13.3834 12.5 12.4993 12.5H7.49935C6.61529 12.5 5.76745 12.8512 5.14233 13.4763C4.5172 14.1014 4.16602 14.9493 4.16602 15.8333V17.5" stroke="#003973" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.99935 9.16667C11.8403 9.16667 13.3327 7.67428 13.3327 5.83333C13.3327 3.99238 11.8403 2.5 9.99935 2.5C8.1584 2.5 6.66602 3.99238 6.66602 5.83333C6.66602 7.67428 8.1584 9.16667 9.99935 9.16667Z" stroke="#003973" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/></svg>';

      function addMessage(role, text, opts) {
        opts = opts || {};
        if (opts.pushToChat !== false) {
          chatState.messages.push({ role: role, content: text || '' });
        }
        var row = document.createElement('div');
        row.className = 'imp-msg-row ' + role;
        var avatar = document.createElement('div');
        avatar.className = 'imp-msg-avatar';
        avatar.innerHTML = role === 'assistant' ? rocketIconSvg : personIconSvg;
        var wrap = document.createElement('div');
        wrap.className = 'imp-msg ' + role;
        var roleLabel = document.createElement('span');
        roleLabel.className = 'imp-role';
        roleLabel.textContent = role === 'user' ? 'You' : 'Impactable';
        var content = document.createElement('div');
        if (role === 'assistant' && window.marked) {
          content.innerHTML = ensureMeetingLink(window.marked.parse(text || ''));
        } else {
          content.textContent = text || '';
        }
        wrap.appendChild(roleLabel);
        wrap.appendChild(content);
        row.appendChild(avatar);
        row.appendChild(wrap);
        chatEl.appendChild(row);
        var welcome = document.getElementById('impactable-welcome-block');
        if (welcome) welcome.style.display = 'none';
        moveInputToBottom();
        chatEl.style.display = 'flex';
        var mainEl = chatEl.closest('.impactable-inline-main');
        if (mainEl) mainEl.classList.add('has-chat');
        chatEl.scrollTop = chatEl.scrollHeight;
        keepComposerVisible();
        return content;
      }

      function loadHistory() {
        var token = getToken();
        var headers = {};
        if (token) headers['X-Token'] = token;
        fetch(FUNCTION_URL, { method: 'GET', credentials: 'include', headers: headers })
          .then(function (res) {
            if (!res.ok) {
              if (res.status === 429) {
                addMessage('assistant', 'Too many new sessions from your network today. Try again tomorrow or use your usual browser.');
                disableInput();
              }
              return;
            }
            var setCookie = res.headers.get('set-cookie');
            if (setCookie && setCookie.indexOf('impactable_os_token') !== -1) {
              var m = setCookie.match(/impactable_os_token=([^;]+)/);
              if (m) localStorage.setItem('impactable_token', decodeURIComponent(m[1]));
            }
            return res.text();
          })
          .then(function (text) {
            if (!text) return;
            try {
              var data = JSON.parse(text);
              var messages = Array.isArray(data) ? data : (data.messages || []);
              if (data && data.token) {
                localStorage.setItem('impactable_token', data.token);
              }
              var list = [];
              for (var i = 0; i < messages.length; i++) {
                var m = messages[i];
                list.push({ role: m.isUser ? 'user' : 'assistant', content: m.content || '' });
              }
              chatState.messages = list;
              renderCurrentChat();
            } catch (e) { /* ignore parse errors */ }
          })
          .catch(function (e) { console.error('Failed to load history', e); })
          .finally(function () {
            setLoadingState(false);
            renderCurrentChat();
          });
      }

      function sendQuery() {
        if (isHistoryLoading) return;
        var query = queryEl.value.trim();
        if (!query) return;
        addMessage('user', query);
        queryEl.value = '';
        sendEl.disabled = true;
        var assistantContent = addMessage('assistant', '');
        assistantContent.innerHTML = '<span class="impactable-typing"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span>';
        keepComposerVisible();

        var token = getToken();
        var headers = { 'Content-Type': 'application/json' };
        if (token) headers['X-Token'] = token;

        fetch(FUNCTION_URL, {
          method: 'POST',
          headers: headers,
          credentials: 'include',
          body: JSON.stringify({ query: query })
        })
          .then(function (res) {
            if (!res.ok) {
              if (res.status === 429) {
                assistantContent.textContent = 'You have hit your daily chat message limit. Try again later.';
                disableInput();
              } else {
                assistantContent.textContent = 'Error: ' + res.status;
              }
              sendEl.disabled = false;
              return null;
            }
            return res.body;
          })
          .then(function (body) {
            if (!body) return;
            var reader = body.getReader();
            var decoder = new TextDecoder();
            var fullText = '';
            function read() {
              reader.read().then(function (chunk) {
                if (chunk.done) {
                  if (fullText.length > 0 && window.marked) {
                    assistantContent.innerHTML = ensureMeetingLink(window.marked.parse(fullText));
                  }
                  var msgs = chatState.messages;
                  if (msgs.length) msgs[msgs.length - 1].content = fullText;
                  chatEl.scrollTop = chatEl.scrollHeight;
                  sendEl.disabled = false;
                  return;
                }
                fullText += decoder.decode(chunk.value, { stream: true });
                assistantContent.textContent = fullText;
                chatEl.scrollTop = chatEl.scrollHeight;
                read();
              });
            }
            read();
          })
          .catch(function () {
            sendEl.disabled = false;
          });
      }

      sendEl.onclick = sendQuery;
      queryEl.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendQuery();
        }
      });

      var quickBtns = document.querySelectorAll('.impactable-inline-root .imp-quick-btn');
      for (var i = 0; i < quickBtns.length; i++) {
        quickBtns[i].addEventListener('click', function () {
          if (isHistoryLoading) return;
          var text = (this.textContent || '').trim();
          if (text && queryEl) {
            queryEl.value = text;
            sendQuery();
          }
        });
      }

      setLoadingState(true);
      loadHistory();
    }

    function syncPanelViewportHeight() {
      if (!container) return;
      var vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      container.style.height = Math.max(1, Math.round(vh)) + 'px';
    }

    function openPanel() {
      if (!container) {
        container = document.createElement('div');
        container.id = 'impactable-widget-panel';
        container.className = 'impactable-inline-root';
        container.setAttribute('data-meeting-url', MEETING_URL);
        container.setAttribute('role', 'dialog');
        container.setAttribute('aria-modal', 'true');
        container.setAttribute('aria-label', 'Impactable chat');

        var chrome = document.createElement('div');
        chrome.className = 'imp-chrome';
        chrome.innerHTML =
          '<div class="imp-chrome-brand">' +
            '<img src="' + assetUrl('logo-dark.svg') + '" alt="Impactable">' +
            '<span class="imp-chrome-label">Ask Impactable</span>' +
          '</div>';

        var closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'imp-close-btn';
        closeBtn.setAttribute('aria-label', 'Close chat');
        closeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
        closeBtn.onclick = function () { setOpenState(false); };
        chrome.appendChild(closeBtn);
        container.appendChild(chrome);

        var main = document.createElement('div');
        main.className = 'impactable-inline-main';

        var quickWrap = document.createElement('div');
        quickWrap.className = 'imp-quick-actions';
        quickWrap.innerHTML =
          '<button type="button" class="imp-quick-btn">What does Impactable do?</button>' +
          '<button type="button" class="imp-quick-btn">How can I get in touch?</button>' +
          '<button type="button" class="imp-quick-btn">What services do you offer?</button>' +
          '<button type="button" class="imp-quick-btn">Book a call</button>';
        main.appendChild(quickWrap);

        var welcomeBlock = document.createElement('div');
        welcomeBlock.id = 'impactable-welcome-block';
        welcomeBlock.className = 'imp-welcome-card';
        welcomeBlock.innerHTML =
          '<h2>How can we help you today?</h2>' +
          '<p>Ask about LinkedIn ads, pricing, or how we run demand. Instant answers from the playbook we use with clients.</p>';
        var welcomeInputArea = document.createElement('div');
        welcomeInputArea.className = 'imp-welcome-input-area';
        var input = document.createElement('div');
        input.id = 'impactable-input';
        var textarea = document.createElement('textarea');
        textarea.id = 'impactable-query';
        textarea.placeholder = 'Type your message...';
        textarea.setAttribute('rows', '1');
        var sendBtn = document.createElement('button');
        sendBtn.id = 'impactable-send';
        sendBtn.type = 'button';
        sendBtn.setAttribute('aria-label', 'Send');
        sendBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        input.appendChild(textarea);
        input.appendChild(sendBtn);
        welcomeInputArea.appendChild(input);
        welcomeBlock.appendChild(welcomeInputArea);
        main.appendChild(welcomeBlock);

        var loadingBlock = document.createElement('div');
        loadingBlock.id = 'impactable-loading';
        loadingBlock.className = 'imp-loading';
        loadingBlock.style.display = 'none';
        loadingBlock.innerHTML = '<div class="imp-spinner" aria-hidden="true"></div><div>Loading previous conversation...</div>';
        main.appendChild(loadingBlock);

        var chat = document.createElement('div');
        chat.id = 'impactable-chat';
        chat.style.display = 'none';
        main.appendChild(chat);

        var inputWrap = document.createElement('div');
        inputWrap.id = 'impactable-input-wrap';
        inputWrap.style.display = 'none';
        main.appendChild(inputWrap);

        container.appendChild(main);
        document.body.appendChild(container);

        if (!viewportListenersBound) {
          window.addEventListener('resize', syncPanelViewportHeight);
          window.addEventListener('orientationchange', syncPanelViewportHeight);
          if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', syncPanelViewportHeight);
            window.visualViewport.addEventListener('scroll', syncPanelViewportHeight);
          }
          viewportListenersBound = true;
        }

        loadMarked(function () {
          initChat();
        });
      }
      syncPanelViewportHeight();
      container.style.display = 'flex';
    }

    function handleToggle(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      toggle();
    }

    function injectLauncher() {
      ensureStyles();
      button = document.getElementById('impactable-chat-launcher');
      if (button) {
        button.addEventListener('click', handleToggle);
        button.addEventListener('touchend', function (e) {
          e.preventDefault();
          handleToggle(e);
        }, { passive: false });
        return;
      }
      button = document.createElement('button');
      button.type = 'button';
      button.id = 'impactable-chat-launcher';
      button.setAttribute('aria-label', 'Open chat');
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-controls', 'impactable-widget-panel');
      button.setAttribute('style',
        'position:fixed;right:24px;width:60px;height:60px;min-width:60px;min-height:60px;' +
        'padding:0;border:none;cursor:pointer;background:transparent;z-index:2147483646;' +
        'display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:visible;' +
        'pointer-events:auto;touch-action:manipulation;'
      );
      var iconImg = document.createElement('img');
      iconImg.src = assetUrl('widget.svg');
      iconImg.alt = '';
      iconImg.width = BUTTON_SIZE;
      iconImg.height = BUTTON_SIZE;
      iconImg.draggable = false;
      iconImg.setAttribute('style', 'width:100%;height:100%;object-fit:contain;pointer-events:none;user-select:none;');
      iconImg.onerror = function () {
        iconImg.onerror = null;
        iconImg.src = 'assets/img/widget.svg';
      };
      button.appendChild(iconImg);
      button.addEventListener('click', handleToggle);
      button.addEventListener('touchend', function (e) {
        e.preventDefault();
        handleToggle(e);
      }, { passive: false });
      document.body.appendChild(button);
    }

    document.addEventListener('click', function (e) {
      var trigger = e.target.closest && e.target.closest('.open-impactable-chat');
      if (!trigger) return;
      e.preventDefault();
      setOpenState(true);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setOpenState(false);
      }
    });

    function inject() {
      if (document.body) {
        injectLauncher();
        return;
      }
      document.addEventListener('DOMContentLoaded', inject);
    }
    inject();
  } catch (e) {
    console.error('[Impactable Widget] Error:', e);
  }
})();
