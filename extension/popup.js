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

// TTS Engine option containers
const browserOptions = document.getElementById('browserOptions');
const coquiOptions = document.getElementById('coquiOptions');
const coquiUrlInput = document.getElementById('coquiUrl');
const coquiStatus = document.getElementById('coquiStatus');
const checkCoquiBtn = document.getElementById('checkCoquiBtn');
const coquiVoiceSelect = document.getElementById('coquiVoiceSelect');
const coquiRateInput = document.getElementById('coquiRate');
const coquiRateValue = document.getElementById('coquiRateValue');
const serverLocal = document.getElementById('serverLocal');
const serverRailway = document.getElementById('serverRailway');

// Server URLs
const SERVER_URLS = {
  local: 'http://localhost:5002',
  railway: 'https://agile-heart.railway.app'
};

const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const stopBtn = document.getElementById('stopBtn');

let currentState = null;

const getActiveTab = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
};

const sendToActiveTab = async (payload) => {
  const tab = await getActiveTab();
  if (!tab?.id) throw new Error('Không tìm thấy tab đang mở.');
  return chrome.tabs.sendMessage(tab.id, payload);
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
  statusText.textContent = status;
  chapterName.textContent = currentState?.chapter || 'Không xác định';

  pauseBtn.disabled = status !== 'reading';
  resumeBtn.disabled = status !== 'paused';
  stopBtn.disabled = status === 'idle';
};

const refreshState = async () => {
  try {
    const state = await sendToActiveTab({ type: 'getState' });
    currentState = state;
    if (state?.settings) {
      rateInput.value = state.settings.rate;
      pitchInput.value = state.settings.pitch;
      sanitizeInput.checked = state.settings.sanitize;
      autoNextInput.checked = state.settings.autoNext;
      rateValue.textContent = Number(state.settings.rate).toFixed(2);
      pitchValue.textContent = Number(state.settings.pitch).toFixed(2);
      if (state.settings.voiceURI && voiceSelect.value !== state.settings.voiceURI) {
        voiceSelect.value = state.settings.voiceURI;
      }
      if (state.settings.coquiUrl) {
        coquiUrlInput.value = state.settings.coquiUrl;
      }
    }
    updateControls();
    showError('');
  } catch (error) {
    showError('Hãy mở trang chương trên metruyencv.com rồi thử lại.');
  }
};

const loadVoices = async () => {
  try {
    const response = await sendToActiveTab({ type: 'listVoices' });
    const voices = response?.voices || [];
    voiceSelect.innerHTML = '';
    voices.forEach((voice) => {
      const option = document.createElement('option');
      option.value = voice.voiceURI;
      option.textContent = `${voice.name} (${voice.lang})`;
      voiceSelect.appendChild(option);
    });
    const defaultVoice =
      voices.find((voice) => voice.lang?.toLowerCase().startsWith('vi')) || voices[0];
    if (defaultVoice) {
      voiceSelect.value = defaultVoice.voiceURI;
    }
  } catch (error) {
    voiceSelect.innerHTML = '<option value="">Không lấy được danh sách giọng</option>';
  }
};

const toggleEngineOptions = (engine) => {
  console.log('[Popup] Toggle engine:', engine);
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
    const response = await fetch(`${url}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*'
      }
    });
    
    if (response.ok) {
      // Try to parse as JSON first, fallback to text
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        // Check if response is "OK" or similar success indicators
        if (text.trim().toUpperCase() === 'OK' || text.includes('ok') || text.includes('status')) {
          data = { status: 'ok' };
        } else {
          // Try to parse as JSON anyway
          try {
            data = JSON.parse(text);
          } catch {
            data = { status: 'ok' }; // Assume OK if we got a response
          }
        }
      }
      
      coquiStatus.textContent = 'Online ✓';
      coquiStatus.className = 'online';
    } else {
      coquiStatus.textContent = `Lỗi ${response.status}`;
      coquiStatus.className = 'offline';
    }
  } catch (error) {
    console.error('Server check error:', error);
    coquiStatus.textContent = 'Offline ✗';
    coquiStatus.className = 'offline';
    
    // Show more specific error for CORS issues
    if (error.message && error.message.includes('CORS')) {
      coquiStatus.textContent = 'CORS Error ✗';
    } else if (error.message && error.message.includes('Failed to fetch')) {
      coquiStatus.textContent = 'Không kết nối được ✗';
    }
  }
};

const getSettingsFromForm = () => {
  const engine = engineSelect.value;
  
  // Use coqui rate when using Google TTS
  const rate = engine === 'coqui' 
    ? Number(coquiRateInput.value) 
    : Number(rateInput.value);
  
  console.log('[Popup] getSettingsFromForm - engine:', engine, 'rate:', rate);
  
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

// Event listeners
engineSelect.addEventListener('change', () => {
  const engine = engineSelect.value;
  toggleEngineOptions(engine);
  chrome.storage.local.set({ ttsEngine: engine });
});

checkCoquiBtn.addEventListener('click', checkCoquiServer);

startBtn.addEventListener('click', async () => {
  try {
    const settings = getSettingsFromForm();
    console.log('[Popup] Starting with settings:', settings);
    
    // Validate server if using Google TTS
    if (settings.engine === 'coqui') {
      coquiStatus.textContent = 'Đang kiểm tra...';
      try {
        const response = await fetch(`${settings.coquiUrl}/health`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json, text/plain, */*'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Server trả về lỗi ${response.status}`);
        }
        
        // Accept both JSON and text "OK" responses
        const contentType = response.headers.get('content-type');
        const text = await response.text();
        
        // Check if response indicates success
        const isOk = (contentType && contentType.includes('application/json')) ||
                     text.trim().toUpperCase() === 'OK' ||
                     text.includes('ok') ||
                     text.includes('status');
        
        if (!isOk) {
          throw new Error('Server response không hợp lệ');
        }
        
        coquiStatus.textContent = 'Online ✓';
        coquiStatus.className = 'online';
      } catch (error) {
        console.error('Server validation error:', error);
        coquiStatus.textContent = 'Offline ✗';
        coquiStatus.className = 'offline';
        
        const errorMsg = error.message && error.message.includes('Failed to fetch')
          ? 'TTS server không khả dụng. Kiểm tra URL và đảm bảo server đang chạy.'
          : 'TTS server không khả dụng. Hãy chạy docker-compose up hoặc kiểm tra Railway server.';
        
        showError(errorMsg);
        return;
      }
    }
    
    await sendToActiveTab({ type: 'startReading', settings });
    refreshState();
  } catch (error) {
    showError('Không thể khởi động. Kiểm tra trang chương.');
  }
});

pauseBtn.addEventListener('click', async () => {
  try {
    await sendToActiveTab({ type: 'pauseReading' });
    refreshState();
  } catch (error) {
    showError('Không thể tạm dừng trên trang hiện tại.');
  }
});

resumeBtn.addEventListener('click', async () => {
  try {
    await sendToActiveTab({ type: 'resumeReading' });
    refreshState();
  } catch (error) {
    showError('Không thể tiếp tục trên trang hiện tại.');
  }
});

stopBtn.addEventListener('click', async () => {
  try {
    await sendToActiveTab({ type: 'stopReading' });
    refreshState();
  } catch (error) {
    showError('Không thể dừng trên trang hiện tại.');
  }
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

// Server location change handler
const handleServerLocationChange = (location) => {
  const url = SERVER_URLS[location] || SERVER_URLS.local;
  coquiUrlInput.value = url;
  chrome.storage.local.set({ 
    serverLocation: location,
    coquiUrl: url 
  });
  // Auto check server when switching
  checkCoquiServer();
};

serverLocal.addEventListener('change', () => {
  if (serverLocal.checked) {
    handleServerLocationChange('local');
  }
});

serverRailway.addEventListener('change', () => {
  if (serverRailway.checked) {
    handleServerLocationChange('railway');
  }
});

coquiUrlInput.addEventListener('change', () => {
  chrome.storage.local.set({ coquiUrl: coquiUrlInput.value });
  // If user manually changes URL, switch to custom mode
  if (coquiUrlInput.value !== SERVER_URLS.local && coquiUrlInput.value !== SERVER_URLS.railway) {
    serverLocal.checked = false;
    serverRailway.checked = false;
  }
});

coquiVoiceSelect.addEventListener('change', () => {
  chrome.storage.local.set({ coquiVoice: coquiVoiceSelect.value });
});

coquiRateInput.addEventListener('change', () => {
  chrome.storage.local.set({ coquiRate: coquiRateInput.value });
});

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === 'reader-status') {
    currentState = message.payload;
    updateControls();
  }
});

// Initialize on load
const init = async () => {
  // Load saved preferences
  const stored = await chrome.storage.local.get(['ttsEngine', 'coquiUrl', 'coquiVoice', 'coquiRate', 'serverLocation']);
  
  if (stored.ttsEngine) {
    engineSelect.value = stored.ttsEngine;
  }
  
  // Set server location
  if (stored.serverLocation) {
    if (stored.serverLocation === 'railway') {
      serverRailway.checked = true;
      coquiUrlInput.value = SERVER_URLS.railway;
    } else {
      serverLocal.checked = true;
      coquiUrlInput.value = SERVER_URLS.local;
    }
  } else if (stored.coquiUrl) {
    // Legacy: check if saved URL matches known servers
    if (stored.coquiUrl === SERVER_URLS.railway) {
      serverRailway.checked = true;
      coquiUrlInput.value = SERVER_URLS.railway;
    } else if (stored.coquiUrl === SERVER_URLS.local) {
      serverLocal.checked = true;
      coquiUrlInput.value = SERVER_URLS.local;
    } else {
      // Custom URL
      coquiUrlInput.value = stored.coquiUrl;
    }
  } else {
    // Default to local
    serverLocal.checked = true;
    coquiUrlInput.value = SERVER_URLS.local;
  }
  
  if (stored.coquiVoice) {
    coquiVoiceSelect.value = stored.coquiVoice;
  }
  if (stored.coquiRate) {
    coquiRateInput.value = stored.coquiRate;
    coquiRateValue.textContent = Number(stored.coquiRate).toFixed(1);
  }
  
  // Apply initial engine toggle
  toggleEngineOptions(engineSelect.value);
  
  // Load voices and state
  await Promise.all([loadVoices(), refreshState()]);
};

init();
