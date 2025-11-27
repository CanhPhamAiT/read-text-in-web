(() => {
  if (window.__metruyen_reader_injected__) {
    return;
  }
  window.__metruyen_reader_injected__ = true;

  const AUTO_KEY = 'metruyencv:auto-read-settings';
  const CHAPTER_SELECTOR = '#chapter-content';

  const state = {
    status: 'idle', // idle | reading | paused
    chapter: null,
    queue: [],
    queueIndex: 0,
    utterances: [],
    settings: {
      engine: 'browser', // 'browser' | 'coqui'
      rate: 1,
      pitch: 1,
      voiceURI: null,
      coquiVoice: 'vi', // 'vi' | 'en'
      autoNext: true,
      sanitize: true,
      coquiUrl: 'http://localhost:5002'
    },
    // Coqui TTS state
    coquiAudio: null,
    coquiAbortController: null
  };

  const SENTENCE_REGEX = /[^.?!。？！…]+[.?!。？！…"]*\s*/g;
  let currentHighlight = null;

  const ensureHighlightStyles = () => {
    if (document.getElementById('metruyencv-reader-highlight-style')) {
      return;
    }
    const style = document.createElement('style');
    style.id = 'metruyencv-reader-highlight-style';
    style.textContent = `
      .metruyencv-sentence {
        transition: background-color 0.2s ease, color 0.2s ease;
      }
      .metruyencv-sentence--current {
        background: rgba(37, 99, 235, 0.3);
        color: #0f172a;
        border-radius: 4px;
        padding: 0 2px;
      }
    `;
    document.head.appendChild(style);
  };

  const highlightSentence = (span) => {
    ensureHighlightStyles();
    if (currentHighlight) {
      currentHighlight.classList.remove('metruyencv-sentence--current');
    }
    currentHighlight = span;
    if (span) {
      span.classList.add('metruyencv-sentence--current');
      span.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const clearHighlight = () => {
    if (currentHighlight) {
      currentHighlight.classList.remove('metruyencv-sentence--current');
      currentHighlight = null;
    }
  };

  const emit = (payload) => {
    chrome.runtime.sendMessage({ type: 'reader-status', payload }).catch(() => {});
  };

  const resolveChapterHeading = () => {
    const selectors = [
      '[data-chapter-title]',
      '#chapter-content h2',
      'main h2',
      '.chapter-title',
      '.chapter-name'
    ];
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      const text = el?.textContent?.trim();
      if (text) return text;
    }
    const heading = Array.from(document.querySelectorAll('h1,h2,h3')).find((el) =>
      el.textContent?.toLowerCase().includes('chương')
    );
    return heading?.textContent?.trim() || '';
  };

  const getChapterMeta = () => {
    const data = window.chapterData;
    const slug = data?.book?.slug;
    const currentIndex = data?.chapter?.index;
    const nextIndex = data?.chapter?.next?.index;
    let hasNext = Boolean(slug && nextIndex);
    let nextUrl = hasNext ? `https://metruyencv.com/truyen/${slug}/chuong-${nextIndex}` : null;
    
    // Fallback: Try to find "Chương sau" button if chapterData is not available
    if (!nextUrl) {
      // Try finding by text content (avoid invalid CSS selectors)
      const buttons = Array.from(document.querySelectorAll('button, a'));
      const nextBtn = buttons.find(btn => 
        btn.textContent?.toLowerCase().includes('chương sau') ||
        btn.textContent?.toLowerCase().includes('tiếp') ||
        btn.getAttribute('aria-label')?.toLowerCase().includes('next')
      );
      if (nextBtn) {
        const href = nextBtn.getAttribute('href') || nextBtn.closest('a')?.getAttribute('href');
        if (href && href.includes('chuong-')) {
          nextUrl = href.startsWith('http') ? href : `https://metruyencv.com${href}`;
          hasNext = true;
        }
      }
      
      // Another fallback: Look for link with next chapter number
      if (!nextUrl && currentIndex) {
        const nextChapterLink = document.querySelector(`a[href*="chuong-${currentIndex + 1}"]`);
        if (nextChapterLink) {
          nextUrl = nextChapterLink.href;
          hasNext = true;
        }
      }
    }
    
    const currentName = (data?.chapter?.name || '').trim() || resolveChapterHeading();
    return {
      slug,
      currentIndex,
      currentName,
      hasNext,
      nextUrl
    };
  };

  const cleanText = (raw) => {
    if (!raw) return '';
    let output = raw.replace(/\s+/g, ' ').trim();
    if (state.settings.sanitize) {
      output = output.replace(/[^0-9A-Za-zÀ-ỹà-ỹ.,?!:;'"()\-\s–—]/g, '');
    }
    return output;
  };

  const createSentenceQueue = () => {
    const container = document.querySelector(CHAPTER_SELECTOR);
    if (!container) {
      throw new Error('Không tìm thấy nội dung chương.');
    }
    ensureHighlightStyles();
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    const candidates = [];
    let node;
    while ((node = walker.nextNode())) {
      if (!node.textContent.trim()) continue;
      if (node.parentElement?.classList.contains('metruyencv-sentence')) continue;
      candidates.push(node);
    }

    const queue = [];
    candidates.forEach((textNode) => {
      const matches = textNode.textContent.match(SENTENCE_REGEX);
      if (!matches) return;
      const fragment = document.createDocumentFragment();
      matches.forEach((segment) => {
        if (!segment.trim()) {
          fragment.appendChild(document.createTextNode(segment));
          return;
        }
        const span = document.createElement('span');
        span.className = 'metruyencv-sentence';
        span.textContent = segment;
        fragment.appendChild(span);
        const sanitized = cleanText(segment);
        if (sanitized) {
          queue.push({ span, text: sanitized, raw: segment });
        }
      });
      textNode.replaceWith(fragment);
    });
    if (!queue.length) {
      throw new Error('Không có nội dung để đọc.');
    }
    return queue;
  };

  const prepareQueue = () => {
    state.queue = createSentenceQueue();
    state.queueIndex = 0;
  };

  // ============================================
  // Browser TTS (Web Speech API)
  // ============================================
  const loadVoice = (voiceURI) => {
    const voices = speechSynthesis.getVoices();
    if (!voiceURI) {
      return voices.find((voice) => voice.lang?.toLowerCase().startsWith('vi')) || voices[0] || null;
    }
    return voices.find((voice) => voice.voiceURI === voiceURI) || null;
  };

  const playBrowserTTS = () => {
    if (state.queueIndex >= state.queue.length) {
      handleChapterFinished();
      return;
    }
    const voice = loadVoice(state.settings.voiceURI);
    const current = state.queue[state.queueIndex];
    highlightSentence(current?.span);
    const utter = new SpeechSynthesisUtterance(current?.text || '');
    utter.rate = state.settings.rate;
    utter.pitch = state.settings.pitch;
    if (voice) {
      utter.voice = voice;
    }
    utter.onend = () => {
      state.queueIndex += 1;
      if (state.status === 'reading') {
        playBrowserTTS();
      }
    };
    utter.onerror = (event) => {
      console.error('Speech synthesis error', event);
      state.status = 'idle';
      speechSynthesis.cancel();
      clearHighlight();
      emit(buildStatus());
    };
    state.utterances.push(utter);
    speechSynthesis.speak(utter);
  };

  // ============================================
  // Google TTS (Local Server)
  // ============================================
  const playCoquiTTS = async () => {
    if (state.queueIndex >= state.queue.length) {
      handleChapterFinished();
      return;
    }

    const current = state.queue[state.queueIndex];
    highlightSentence(current?.span);
    
    const text = current?.text || '';
    
    // Skip empty or punctuation-only chunks
    const meaningfulText = text.replace(/[.,!?;:'"()\-–—…\s]/g, '');
    if (!meaningfulText) {
      console.log(`[TTS] Skipping empty/punctuation chunk ${state.queueIndex + 1}/${state.queue.length}: "${text}"`);
      state.queueIndex += 1;
      if (state.status === 'reading') {
        playCoquiTTS();
      }
      return;
    }
    
    console.log(`[TTS] Playing chunk ${state.queueIndex + 1}/${state.queue.length}: "${text.substring(0, 50)}..."`);

    try {
      // Create abort controller for cancellation
      state.coquiAbortController = new AbortController();
      
      // Google TTS API uses query parameters
      const encodedText = encodeURIComponent(text);
      const voice = state.settings.coquiVoice || 'vi';
      const url = `${state.settings.coquiUrl}/api/tts?text=${encodedText}&voice=${voice}`;
      console.log(`[TTS] Fetching: ${url} (voice: ${voice}, rate: ${state.settings.rate})`);
      
      const response = await fetch(url, {
        method: 'GET',
        signal: state.coquiAbortController.signal
      });

      console.log(`[TTS] Response status: ${response.status}, type: ${response.headers.get('content-type')}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`TTS server error: ${response.status} - ${errorText}`);
      }

      // Get audio as blob directly from response
      const audioBlob = await response.blob();
      console.log(`[TTS] Got audio blob: ${audioBlob.size} bytes, type: ${audioBlob.type}`);
      
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Play using Audio element
      state.coquiAudio = new Audio(audioUrl);
      
      // Apply playback speed from settings (0.8 - 2.4)
      state.coquiAudio.playbackRate = state.settings.rate || 1;
      console.log(`[TTS] Playback rate set to: ${state.coquiAudio.playbackRate}`);
      
      state.coquiAudio.onended = () => {
        console.log(`[TTS] Audio ended, moving to next chunk`);
        URL.revokeObjectURL(audioUrl);
        state.queueIndex += 1;
        if (state.status === 'reading') {
          playCoquiTTS();
        }
      };

      state.coquiAudio.onerror = (event) => {
        console.error('[TTS] Audio playback error:', event);
        URL.revokeObjectURL(audioUrl);
        state.status = 'idle';
        clearHighlight();
        emit(buildStatus());
      };

      // Only play if still in reading state
      if (state.status === 'reading') {
        console.log(`[TTS] Starting playback at rate ${state.coquiAudio.playbackRate}...`);
        await state.coquiAudio.play();
        console.log(`[TTS] Playback started`);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log(`[TTS] Playback aborted`);
        return;
      }
      console.error('[TTS] Error:', error);
      
      // Continue to next chunk instead of stopping completely
      console.log('[TTS] Skipping to next chunk due to error...');
      state.queueIndex += 1;
      if (state.status === 'reading' && state.queueIndex < state.queue.length) {
        // Small delay before retrying
        setTimeout(() => playCoquiTTS(), 100);
      } else if (state.queueIndex >= state.queue.length) {
        handleChapterFinished();
      } else {
        state.status = 'idle';
        clearHighlight();
        emit(buildStatus());
      }
    }
  };

  // ============================================
  // Unified playback control
  // ============================================
  const playCurrentChunk = () => {
    if (state.settings.engine === 'coqui') {
      playCoquiTTS();
    } else {
      playBrowserTTS();
    }
  };

  const handleChapterFinished = () => {
    console.log('[TTS] Chapter finished!');
    state.status = 'idle';
    clearHighlight();
    emit(buildStatus());
    
    const meta = getChapterMeta();
    console.log('[TTS] Chapter meta:', meta);
    console.log('[TTS] autoNext setting:', state.settings.autoNext);
    
    if (state.settings.autoNext && meta.nextUrl) {
      console.log('[TTS] Auto-navigating to next chapter:', meta.nextUrl);
      sessionStorage.setItem(
        AUTO_KEY,
        JSON.stringify({
          resume: true,
          settings: state.settings
        })
      );
      // Small delay to ensure session storage is saved
      setTimeout(() => {
        window.location.href = meta.nextUrl;
      }, 500);
    } else {
      console.log('[TTS] Not auto-navigating. autoNext:', state.settings.autoNext, 'nextUrl:', meta.nextUrl);
      sessionStorage.removeItem(AUTO_KEY);
    }
  };

  const startReading = (settings = {}) => {
    // Stop any existing playback
    stopAllPlayback();
    
    state.settings = {
      ...state.settings,
      ...settings
    };
    prepareQueue();
    state.utterances = [];
    state.queueIndex = 0;
    state.status = 'reading';
    emit(buildStatus());
    playCurrentChunk();
  };

  const stopAllPlayback = () => {
    // Stop browser TTS
    speechSynthesis.cancel();
    
    // Stop Coqui TTS
    if (state.coquiAbortController) {
      state.coquiAbortController.abort();
      state.coquiAbortController = null;
    }
    if (state.coquiAudio) {
      state.coquiAudio.pause();
      state.coquiAudio.src = '';
      state.coquiAudio = null;
    }
  };

  const pauseReading = () => {
    if (state.status !== 'reading') return;
    
    if (state.settings.engine === 'coqui') {
      if (state.coquiAudio) {
        state.coquiAudio.pause();
      }
    } else {
      speechSynthesis.pause();
    }
    
    state.status = 'paused';
    emit(buildStatus());
  };

  const resumeReading = () => {
    if (state.status !== 'paused') return;
    
    if (state.settings.engine === 'coqui') {
      if (state.coquiAudio) {
        state.coquiAudio.play();
      }
    } else {
      speechSynthesis.resume();
    }
    
    state.status = 'reading';
    emit(buildStatus());
  };

  const stopReading = () => {
    stopAllPlayback();
    state.status = 'idle';
    state.queue = [];
    state.queueIndex = 0;
    state.utterances = [];
    sessionStorage.removeItem(AUTO_KEY);
    clearHighlight();
    emit(buildStatus());
  };

  const buildStatus = () => {
    const meta = getChapterMeta();
    return {
      status: state.status,
      totalChunks: state.queue.length,
      currentChunk: state.queueIndex,
      chapter: meta.currentName || `Chương ${meta.currentIndex || ''}`,
      hasNext: meta.hasNext,
      settings: state.settings
    };
  };

  const ensureAutoStart = () => {
    const payload = sessionStorage.getItem(AUTO_KEY);
    if (!payload) return;
    try {
      const data = JSON.parse(payload);
      sessionStorage.removeItem(AUTO_KEY);
      if (data.resume) {
        startReading(data.settings);
      }
    } catch (error) {
      console.warn('Cannot parse auto settings', error);
    }
  };

  const getVoices = () =>
    new Promise((resolve) => {
      const voices = speechSynthesis.getVoices();
      if (voices.length) {
        resolve(voices);
        return;
      }
      speechSynthesis.addEventListener(
        'voiceschanged',
        () => {
          resolve(speechSynthesis.getVoices());
        },
        { once: true }
      );
    }).then((voices) =>
      voices.map((voice) => ({
        voiceURI: voice.voiceURI,
        name: voice.name,
        lang: voice.lang
      }))
    );

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message?.type) return;
    switch (message.type) {
      case 'getState':
        sendResponse(buildStatus());
        break;
      case 'startReading':
        try {
          startReading(message.settings);
          sendResponse({ success: true });
        } catch (error) {
          sendResponse({ success: false, error: error.message });
        }
        break;
      case 'pauseReading':
        pauseReading();
        sendResponse({ success: true });
        break;
      case 'resumeReading':
        resumeReading();
        sendResponse({ success: true });
        break;
      case 'stopReading':
        stopReading();
        sendResponse({ success: true });
        break;
      case 'listVoices':
        getVoices().then((voices) => sendResponse({ voices }));
        return true;
      default:
        break;
    }
    return true;
  });

  window.addEventListener('beforeunload', () => {
    stopAllPlayback();
  });

  ensureAutoStart();
})();
