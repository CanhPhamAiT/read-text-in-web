// PWA Main Application Logic
const setupSection = document.getElementById('setupSection');
const controlSection = document.getElementById('controlSection');
const statusText = document.getElementById('statusText');
const chapterName = document.getElementById('chapterName');
const engineSelect = document.getElementById('engineSelect');
const voiceSelect = document.getElementById('voiceSelect');
const rateInput = document.getElementById('rate');
const pitchInput = document.getElementById('pitch');
const rateValue = document.getElementById('rateValue');
const pitchValue = document.getElementById('pitchValue');
const sanitizeInput = document.getElementById('sanitize');
const autoNextInput = document.getElementById('autoNext');
const errorBox = document.getElementById('error');
const bookmarkletLink = document.getElementById('bookmarkletLink');
const copyBookmarkletBtn = document.getElementById('copyBookmarkletBtn');
const bookmarkletAlert = document.getElementById('bookmarkletAlert');

// TTS Engine option containers
const browserOptions = document.getElementById('browserOptions');
const coquiOptions = document.getElementById('coquiOptions');
const coquiUrlInput = document.getElementById('coquiUrl');
const coquiStatus = document.getElementById('coquiStatus');
const checkCoquiBtn = document.getElementById('checkCoquiBtn');
const coquiVoiceSelect = document.getElementById('coquiVoiceSelect');
const coquiRateInput = document.getElementById('coquiRate');
const coquiRateValue = document.getElementById('coquiRateValue');

const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const stopBtn = document.getElementById('stopBtn');

let currentState = null;
let injectedWindow = null;

// Generate bookmarklet URL
const generateBookmarklet = () => {
  // Get base URL, handling trailing slashes
  let pathname = window.location.pathname;
  // Remove trailing slash if present
  if (pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }
  // Remove filename if present (e.g., index.html)
  pathname = pathname.replace(/\/[^\/]*$/, '');
  // Ensure we have at least a slash
  if (!pathname || pathname === '/') {
    pathname = '';
  }
  const pwaUrl = window.location.origin + pathname;
  const injectUrl = `${pwaUrl}/inject.js`;
  
  const bookmarkletCode = `javascript:(function(){const injectUrl='${injectUrl}';const scriptId='chapter-reader-inject-script';let existingScript=document.getElementById(scriptId);if(existingScript){existingScript.remove();}if(window.__chapter_reader_injected__){delete window.__chapter_reader_injected__;}const script=document.createElement('script');script.id=scriptId;script.src=injectUrl;script.onerror=function(){alert('Không thể tải script. Kiểm tra URL: '+injectUrl);};script.onload=function(){window.__chapter_reader_injected__=true;};document.head.appendChild(script);let panel=document.getElementById('chapter-reader-panel');if(panel){panel.remove();}panel=document.createElement('div');panel.id='chapter-reader-panel';panel.innerHTML='<div style="position:fixed;bottom:20px;right:20px;z-index:99999;background:#0f172a;color:white;padding:15px;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.3);max-width:300px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;"><strong>📖 Chapter Reader</strong><button id="close-panel" style="background:#dc2626;color:white;border:none;border-radius:4px;padding:4px 8px;cursor:pointer;">✕</button></div><div id="reader-status" style="font-size:12px;margin-bottom:10px;">Đang tải...</div><div style="display:flex;gap:5px;flex-wrap:wrap;"><button id="reader-start" style="flex:1;padding:8px;background:#2563eb;color:white;border:none;border-radius:4px;cursor:pointer;">Bắt đầu</button><button id="reader-pause" style="flex:1;padding:8px;background:#475569;color:white;border:none;border-radius:4px;cursor:pointer;display:none;">Tạm dừng</button><button id="reader-stop" style="padding:8px;background:#dc2626;color:white;border:none;border-radius:4px;cursor:pointer;">Dừng</button></div></div>';document.body.appendChild(panel);document.getElementById('close-panel').onclick=function(){panel.remove();};window.addEventListener('message',function(e){if(e.data.type==='chapter-reader-status'){const status=document.getElementById('reader-status');if(status)status.textContent='Trạng thái: '+e.data.status+' | Chương: '+(e.data.chapter||'-');}});document.getElementById('reader-start').onclick=function(){window.postMessage({type:'chapter-reader-command',command:'start',settings:{engine:'browser',rate:1,pitch:1,autoNext:true,sanitize:true}},'*');};document.getElementById('reader-pause').onclick=function(){window.postMessage({type:'chapter-reader-command',command:'pause'},'*');};document.getElementById('reader-stop').onclick=function(){window.postMessage({type:'chapter-reader-command',command:'stop'},'*');};setTimeout(function(){const status=document.getElementById('reader-status');if(status)status.textContent='Đã cài đặt';},1000);})();`;
  
  return bookmarkletCode;
};

// Setup bookmarklet
const setupBookmarklet = () => {
  const bookmarklet = generateBookmarklet();
  bookmarkletLink.href = bookmarklet;
  
  copyBookmarkletBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(bookmarklet).then(() => {
      bookmarkletAlert.hidden = false;
      setTimeout(() => {
        bookmarkletAlert.hidden = true;
      }, 3000);
    }).catch(() => {
      alert('Không thể copy. Hãy kéo nút bookmarklet vào thanh bookmark.');
    });
  });
};

const showError = (message) => {
  if (!message) {
    errorBox.hidden = true;
    return;
  }
  errorBox.hidden = false;
  errorBox.textContent = message;
};

const updateControls = () => {
  const status = currentState?.status || 'idle';
  statusText.textContent = status === 'idle' ? 'Chưa kết nối' : status;
  chapterName.textContent = currentState?.chapter || '-';

  pauseBtn.disabled = status !== 'reading';
  resumeBtn.disabled = status !== 'paused';
  stopBtn.disabled = status === 'idle';
};

// Try to connect to injected script
const connectToPage = () => {
  // Check if we can access opener (if opened from bookmarklet)
  if (window.opener && !window.opener.closed) {
    injectedWindow = window.opener;
  }
  
  // Try to find injected script by sending message
  window.postMessage({ type: 'chapter-reader-command', command: 'getState' }, '*');
  
  // Show control section if we detect injected script
  setTimeout(() => {
    if (currentState) {
      setupSection.style.display = 'none';
      controlSection.classList.add('active');
    }
  }, 1000);
};

const sendCommand = (command, data = {}) => {
  const message = { type: 'chapter-reader-command', command, ...data };
  
  if (injectedWindow && !injectedWindow.closed) {
    injectedWindow.postMessage(message, '*');
  } else {
    // Broadcast to all windows (for same-origin)
    window.postMessage(message, '*');
  }
};

const refreshState = async () => {
  sendCommand('getState');
};

const loadVoices = async () => {
  sendCommand('listVoices');
};

const toggleEngineOptions = (engine) => {
  if (engine === 'coqui') {
    browserOptions.style.display = 'none';
    coquiOptions.style.display = 'block';
  } else {
    browserOptions.style.display = 'block';
    coquiOptions.style.display = 'none';
  }
};

const checkCoquiServer = async () => {
  const url = coquiUrlInput.value.trim();
  coquiStatus.textContent = 'Đang kiểm tra...';
  coquiStatus.className = '';
  
  try {
    const response = await fetch(`${url}/health`);
    if (response.ok) {
      coquiStatus.textContent = 'Online ✓';
      coquiStatus.className = 'online';
    } else {
      coquiStatus.textContent = 'Lỗi kết nối';
      coquiStatus.className = 'offline';
    }
  } catch (error) {
    coquiStatus.textContent = 'Offline ✗';
    coquiStatus.className = 'offline';
  }
};

const getSettingsFromForm = () => {
  const engine = engineSelect.value;
  const rate = engine === 'coqui' 
    ? Number(coquiRateInput.value) 
    : Number(rateInput.value);
  
  return {
    engine,
    voiceURI: voiceSelect.value || null,
    coquiVoice: coquiVoiceSelect.value || 'vi',
    rate,
    pitch: Number(pitchInput.value),
    sanitize: sanitizeInput.checked,
    autoNext: autoNextInput.checked,
    coquiUrl: coquiUrlInput.value.trim() || 'http://localhost:5002'
  };
};

// Listen for messages from injected script
window.addEventListener('message', (event) => {
  if (event.data?.type === 'chapter-reader-status') {
    currentState = {
      status: event.data.status,
      chapter: event.data.chapter,
      totalChunks: event.data.totalChunks,
      currentChunk: event.data.currentChunk,
      hasNext: event.data.hasNext
    };
    updateControls();
  } else if (event.data?.type === 'chapter-reader-state') {
    currentState = event.data.state;
    if (currentState?.settings) {
      rateInput.value = currentState.settings.rate || 1;
      pitchInput.value = currentState.settings.pitch || 1;
      sanitizeInput.checked = currentState.settings.sanitize !== false;
      autoNextInput.checked = currentState.settings.autoNext !== false;
      rateValue.textContent = Number(currentState.settings.rate || 1).toFixed(2);
      pitchValue.textContent = Number(currentState.settings.pitch || 1).toFixed(2);
      if (currentState.settings.voiceURI && voiceSelect.value !== currentState.settings.voiceURI) {
        voiceSelect.value = currentState.settings.voiceURI;
      }
      if (currentState.settings.coquiUrl) {
        coquiUrlInput.value = currentState.settings.coquiUrl;
      }
    }
    updateControls();
    showError('');
    setupSection.style.display = 'none';
    controlSection.classList.add('active');
  } else if (event.data?.type === 'chapter-reader-voices') {
    const voices = event.data.voices || [];
    voiceSelect.innerHTML = '';
    voices.forEach((voice) => {
      const option = document.createElement('option');
      option.value = voice.voiceURI;
      option.textContent = `${voice.name} (${voice.lang})`;
      voiceSelect.appendChild(option);
    });
    const defaultVoice = voices.find((voice) => voice.lang?.toLowerCase().startsWith('vi')) || voices[0];
    if (defaultVoice) {
      voiceSelect.value = defaultVoice.voiceURI;
    }
  } else if (event.data?.type === 'chapter-reader-response') {
    if (!event.data.success) {
      showError(event.data.error || 'Có lỗi xảy ra');
    } else {
      showError('');
      refreshState();
    }
  }
});

// Event listeners
engineSelect.addEventListener('change', () => {
  toggleEngineOptions(engineSelect.value);
  localStorage.setItem('ttsEngine', engineSelect.value);
});

checkCoquiBtn.addEventListener('click', checkCoquiServer);

startBtn.addEventListener('click', async () => {
  try {
    const settings = getSettingsFromForm();
    
    if (settings.engine === 'coqui') {
      coquiStatus.textContent = 'Đang kiểm tra...';
      try {
        const response = await fetch(`${settings.coquiUrl}/health`);
        if (!response.ok) {
          throw new Error('Server không phản hồi');
        }
        coquiStatus.textContent = 'Online ✓';
        coquiStatus.className = 'online';
      } catch (error) {
        coquiStatus.textContent = 'Offline ✗';
        coquiStatus.className = 'offline';
        showError('TTS server không khả dụng. Hãy chạy docker-compose up.');
        return;
      }
    }
    
    sendCommand('start', { settings });
    refreshState();
  } catch (error) {
    showError('Không thể khởi động. Đảm bảo đã cài đặt bookmarklet trên trang truyện.');
  }
});

pauseBtn.addEventListener('click', () => {
  sendCommand('pause');
  refreshState();
});

resumeBtn.addEventListener('click', () => {
  sendCommand('resume');
  refreshState();
});

stopBtn.addEventListener('click', () => {
  sendCommand('stop');
  refreshState();
});

rateInput.addEventListener('input', () => {
  rateValue.textContent = Number(rateInput.value).toFixed(2);
});

pitchInput.addEventListener('input', () => {
  pitchValue.textContent = Number(pitchInput.value).toFixed(2);
});

coquiRateInput.addEventListener('input', () => {
  coquiRateValue.textContent = Number(coquiRateInput.value).toFixed(1);
});

coquiUrlInput.addEventListener('change', () => {
  localStorage.setItem('coquiUrl', coquiUrlInput.value);
});

coquiVoiceSelect.addEventListener('change', () => {
  localStorage.setItem('coquiVoice', coquiVoiceSelect.value);
});

coquiRateInput.addEventListener('change', () => {
  localStorage.setItem('coquiRate', coquiRateInput.value);
});

// Initialize
const init = async () => {
  // Register service worker
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('./service-worker.js', {
        scope: './'
      });
      console.log('Service Worker registered:', registration.scope);
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available, prompt user to reload
            console.log('New service worker available');
          }
        });
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
  
  // Handle install prompt (for PWA installation)
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // You can show a custom install button here if needed
    console.log('PWA install prompt available');
  });
  
  // Listen for app installed
  window.addEventListener('appinstalled', () => {
    console.log('PWA installed');
    deferredPrompt = null;
  });
  
  // Load saved preferences
  const stored = {
    ttsEngine: localStorage.getItem('ttsEngine'),
    coquiUrl: localStorage.getItem('coquiUrl'),
    coquiVoice: localStorage.getItem('coquiVoice'),
    coquiRate: localStorage.getItem('coquiRate')
  };
  
  if (stored.ttsEngine) {
    engineSelect.value = stored.ttsEngine;
  }
  if (stored.coquiUrl) {
    coquiUrlInput.value = stored.coquiUrl;
  }
  if (stored.coquiVoice) {
    coquiVoiceSelect.value = stored.coquiVoice;
  }
  if (stored.coquiRate) {
    coquiRateInput.value = stored.coquiRate;
    coquiRateValue.textContent = Number(stored.coquiRate).toFixed(1);
  }
  
  // Setup bookmarklet
  setupBookmarklet();
  
  // Apply initial engine toggle
  toggleEngineOptions(engineSelect.value);
  
  // Try to connect to page
  connectToPage();
  
  // Periodically try to refresh state
  setInterval(() => {
    if (controlSection.classList.contains('active')) {
      refreshState();
    }
  }, 2000);
};

init();

