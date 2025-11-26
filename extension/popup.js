const statusText = document.getElementById('statusText');
const chapterName = document.getElementById('chapterName');
const voiceSelect = document.getElementById('voiceSelect');
const rateInput = document.getElementById('rate');
const pitchInput = document.getElementById('pitch');
const rateValue = document.getElementById('rateValue');
const pitchValue = document.getElementById('pitchValue');
const sanitizeInput = document.getElementById('sanitize');
const autoNextInput = document.getElementById('autoNext');
const errorBox = document.getElementById('error');

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
    voiceSelect.disabled = true;
  }
};

const getSettingsFromForm = () => ({
  voiceURI: voiceSelect.value || null,
  rate: Number(rateInput.value),
  pitch: Number(pitchInput.value),
  sanitize: sanitizeInput.checked,
  autoNext: autoNextInput.checked
});

startBtn.addEventListener('click', async () => {
  try {
    await sendToActiveTab({ type: 'startReading', settings: getSettingsFromForm() });
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

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === 'reader-status') {
    currentState = message.payload;
    updateControls();
  }
});

Promise.all([loadVoices(), refreshState()]);

