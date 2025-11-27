(() => {
  if (window.__metruyen_reader_injected__) {
    return;
  }
  window.__metruyen_reader_injected__ = true;

  const AUTO_KEY = 'metruyencv:auto-read-settings';
  
  // Detect site and get appropriate selector
  const getSiteConfig = () => {
    const hostname = window.location.hostname;
    // Support both desktop (tangthuvien.net) and mobile (m.tangthuvien.net) versions
    if (hostname.includes('tangthuvien.net') || hostname.includes('m.tangthuvien.net')) {
      return {
        selector: '.chapter-c-content',
        site: 'tangthuvien'
      };
    } else if (hostname.includes('metruyencv.com')) {
      return {
        selector: '#chapter-content',
        site: 'metruyencv'
      };
    }
    // Default fallback
    return {
      selector: '#chapter-content',
      site: 'metruyencv'
    };
  };
  
  const siteConfig = getSiteConfig();
  const CHAPTER_SELECTOR = siteConfig.selector;

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

  // Improved regex: match any text, splitting by sentence-ending punctuation
  // Also handles text without punctuation as a single sentence
  const SENTENCE_REGEX = /[^.?!。？！…\n]+[.?!。？！…]*\s*/g;
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
    try {
      // Send to PWA via postMessage
      window.postMessage({ 
        type: 'chapter-reader-status', 
        status: payload.status,
        chapter: payload.chapter,
        totalChunks: payload.totalChunks,
        currentChunk: payload.currentChunk,
        hasNext: payload.hasNext
      }, '*');
      
      // Also try extension context if available (for backward compatibility)
      if (typeof chrome !== 'undefined' && 
          chrome.runtime && 
          chrome.runtime.sendMessage &&
          chrome.runtime.id) {
        chrome.runtime.sendMessage({ type: 'reader-status', payload }).catch(() => {});
      }
    } catch (error) {
      console.debug('Cannot send message:', error);
    }
  };

  const resolveChapterHeading = () => {
    // For tangthuvien.net (both desktop and mobile), try specific selectors first
    if (siteConfig.site === 'tangthuvien') {
      const selectors = [
        'h4', // Often used for chapter titles
        'h2',
        'h1',
        'h5', // Mobile version might use h5
        '.chapter-title',
        '.chapter-name'
      ];
      for (const selector of selectors) {
        const el = document.querySelector(selector);
        const text = el?.textContent?.trim();
        if (text && text.toLowerCase().includes('chương')) {
          return text;
        }
      }
    }
    
    // Common selectors for both sites
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
    const heading = Array.from(document.querySelectorAll('h1,h2,h3,h4')).find((el) =>
      el.textContent?.toLowerCase().includes('chương')
    );
    return heading?.textContent?.trim() || '';
  };

  const getChapterMeta = () => {
    // Handle tangthuvien.net (both desktop and mobile versions)
    if (siteConfig.site === 'tangthuvien') {
      const isMobile = window.location.hostname.includes('m.tangthuvien.net');
      const baseUrl = isMobile ? 'https://m.tangthuvien.net' : 'https://tangthuvien.net';
      let nextUrl = null;
      let nextButton = null;
      let hasNext = false;
      
      // Method 1: Try to find link with id="next_chap" or class containing "next_chap"
      const nextLinkById = document.getElementById('next_chap') || 
                          document.querySelector('.bot-next_chap, .next_chap');
      
      if (nextLinkById) {
        const href = nextLinkById.getAttribute('href');
        const onclick = nextLinkById.getAttribute('onclick');
        
        // If it has a real href (not javascript:void(0))
        if (href && !href.startsWith('javascript:')) {
          nextUrl = href.startsWith('http') ? href : `${baseUrl}${href}`;
          hasNext = true;
        } 
        // If it has onclick with NextChap, we can click it
        else if (onclick && onclick.includes('NextChap')) {
          nextButton = nextLinkById;
          hasNext = true;
        }
        // Otherwise, try to construct URL from current URL pattern
        else {
          const currentUrl = window.location.href;
          const urlMatch = currentUrl.match(/\/chuong-(\d+)/);
          if (urlMatch) {
            const currentChapterNum = parseInt(urlMatch[1]);
            const urlPath = currentUrl.match(/^https?:\/\/[^\/]+(\/doc-truyen\/[^\/]+)/)?.[1];
            if (urlPath) {
              nextUrl = `${baseUrl}${urlPath}/chuong-${currentChapterNum + 1}`;
              hasNext = true;
            }
          }
        }
      }
      
      // Method 2: Fallback - try to find "Chương tiếp" text link
      if (!hasNext) {
        const links = Array.from(document.querySelectorAll('a'));
        const nextLink = links.find(link => {
          const text = link.textContent?.toLowerCase().trim() || '';
          return text.includes('chương tiếp') || text.includes('chương sau') || text === 'tiếp';
        });
        
        if (nextLink) {
          const href = nextLink.getAttribute('href');
          if (href && !href.startsWith('javascript:')) {
            nextUrl = href.startsWith('http') ? href : `${baseUrl}${href}`;
            hasNext = true;
          } else {
            nextButton = nextLink;
            hasNext = true;
          }
        }
      }
      
      // Method 3: Construct URL from current chapter number if still no result
      if (!hasNext) {
        const currentUrl = window.location.href;
        const urlMatch = currentUrl.match(/\/chuong-(\d+)/);
        if (urlMatch) {
          const currentChapterNum = parseInt(urlMatch[1]);
          const urlPath = currentUrl.match(/^https?:\/\/[^\/]+(\/doc-truyen\/[^\/]+)/)?.[1];
          if (urlPath) {
            nextUrl = `${baseUrl}${urlPath}/chuong-${currentChapterNum + 1}`;
            hasNext = true;
          }
        }
      }
      
      const currentName = resolveChapterHeading();
      return {
        slug: null,
        currentIndex: null,
        currentName,
        hasNext,
        nextUrl,
        nextButton
      };
    }
    
    // Handle metruyencv.com (original logic)
    const data = window.chapterData;
    const slug = data?.book?.slug;
    const currentIndex = data?.chapter?.index;
    const nextIndex = data?.chapter?.next?.index;
    let hasNext = Boolean(slug && nextIndex);
    let nextUrl = hasNext ? `https://metruyencv.com/truyen/${slug}/chuong-${nextIndex}` : null;
    let nextButton = null;
    
    // Fallback: Try to find "Chương sau" button
    if (!nextUrl) {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      const nextBtn = buttons.find(btn => {
        const text = btn.textContent?.toLowerCase() || '';
        return text.includes('chương sau') || text === 'sau';
      });
      
      if (nextBtn) {
        // Check if it's a link with href
        const href = nextBtn.getAttribute('href') || nextBtn.closest('a')?.getAttribute('href');
        if (href && href.includes('chuong-')) {
          nextUrl = href.startsWith('http') ? href : `https://metruyencv.com${href}`;
          hasNext = true;
        } else {
          // It's a button without href - we'll click it
          nextButton = nextBtn;
          hasNext = true;
        }
      }
      
      // Another fallback: construct URL from current chapter
      if (!nextUrl && !nextButton && slug && currentIndex) {
        nextUrl = `https://metruyencv.com/truyen/${slug}/chuong-${currentIndex + 1}`;
        hasNext = true;
      }
    }
    
    const currentName = (data?.chapter?.name || '').trim() || resolveChapterHeading();
    return {
      slug,
      currentIndex,
      currentName,
      hasNext,
      nextUrl,
      nextButton
    };
  };

  const cleanText = (raw) => {
    if (!raw) return '';
    // Remove quotes and brackets used for dialogue/special text
    let output = raw.replace(/["'"'「」『』【】\[\]]/g, '');
    output = output.replace(/\s+/g, ' ').trim();
    if (state.settings.sanitize) {
      // Keep Vietnamese characters, numbers, basic punctuation
      output = output.replace(/[^0-9A-Za-zÀ-ỹà-ỹ.,?!:;\-()\s–—~]/g, '');
    }
    return output;
  };

  // Extract text from canvas using OCR
  const extractTextFromCanvas = async (canvas) => {
    try {
      // Check if Tesseract is available
      if (typeof Tesseract === 'undefined') {
        console.warn('Tesseract.js không khả dụng, bỏ qua canvas OCR');
        return null;
      }

      // Get canvas image data
      const imageData = canvas.toDataURL('image/png');
      
      // Configure Tesseract for browser extension
      // Use CDN for workers if local files aren't available
      const workerOptions = {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR: ${Math.round(m.progress * 100)}%`);
          }
        }
      };
      
      // Try to use CDN for workers (Tesseract.js v5 supports this)
      try {
        const worker = await Tesseract.createWorker('vie', 1, workerOptions);
        const { data: { text } } = await worker.recognize(imageData);
        await worker.terminate();
        const cleaned = text.trim();
        if (cleaned) {
          console.log(`OCR thành công: "${cleaned.substring(0, 50)}..."`);
        }
        return cleaned;
      } catch (workerError) {
        console.warn('Không thể tạo Tesseract worker, thử phương pháp khác:', workerError);
        // Fallback: try direct recognize (might work in some cases)
        try {
          const { data: { text } } = await Tesseract.recognize(imageData, 'vie', workerOptions);
          return text.trim();
        } catch (fallbackError) {
          console.error('OCR fallback cũng thất bại:', fallbackError);
          return null;
        }
      }
    } catch (error) {
      console.error('Lỗi OCR canvas:', error);
      return null;
    }
  };

  const createSentenceQueue = async () => {
    let container = document.querySelector(CHAPTER_SELECTOR);
    if (!container) {
      throw new Error('Không tìm thấy nội dung chương.');
    }
    
    // For tangthuvien.net, find the actual chapter content (box-chap without hidden class)
    if (siteConfig.site === 'tangthuvien') {
      // Find the first box-chap div that doesn't have 'hidden' class
      const chapterBox = container.querySelector('.box-chap:not(.hidden)');
      if (chapterBox) {
        container = chapterBox;
        console.log('Found chapter content box:', chapterBox.className);
      } else {
        // Fallback: try to find any box-chap
        const anyBoxChap = container.querySelector('.box-chap');
        if (anyBoxChap) {
          container = anyBoxChap;
          console.log('Using first box-chap found:', anyBoxChap.className);
        } else {
          console.warn('Could not find box-chap, using full container');
        }
      }
    }
    
    ensureHighlightStyles();
    
    // Step 1: Extract text from text nodes (existing spans and text)
    // For tangthuvien.net, exclude navigation and other chapter headings
    const shouldExcludeNode = (node) => {
      if (!node.parentElement) return false;
      
      // Exclude navigation elements
      const parent = node.parentElement;
      if (parent.closest('.left-control, .bot-control, .box-adv')) return true;
      
      // Exclude chapter headings (h5 with "Chương" that are not the current chapter)
      if (siteConfig.site === 'tangthuvien') {
        const h5Heading = parent.closest('h5');
        if (h5Heading && h5Heading.textContent?.toLowerCase().includes('chương')) {
          // Check if this heading is for a hidden chapter
          const nextSibling = h5Heading.nextElementSibling;
          if (nextSibling && nextSibling.classList.contains('hidden')) {
            return true;
          }
        }
      }
      
      return false;
    };
    
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    const candidates = [];
    let node;
    while ((node = walker.nextNode())) {
      if (!node.textContent.trim()) continue;
      if (node.parentElement?.classList.contains('metruyencv-sentence')) continue;
      if (shouldExcludeNode(node)) continue;
      candidates.push(node);
    }

    const queue = [];
    candidates.forEach((textNode) => {
      const rawText = textNode.textContent;
      let matches = rawText.match(SENTENCE_REGEX);
      
      // Fallback: if no matches or text wasn't captured, use entire text as one segment
      if (!matches || matches.join('').trim().length < rawText.trim().length * 0.8) {
        const trimmed = rawText.trim();
        if (trimmed) {
          matches = [trimmed];
        }
      }
      
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

    // Step 2: Extract text from canvas elements using OCR
    const canvasElements = container.querySelectorAll('canvas');
    const canvasCount = canvasElements.length;
    console.log(`Tìm thấy ${canvasCount} canvas elements`);
    
    if (canvasCount > 0) {
      // Check if Tesseract is available
      if (typeof Tesseract === 'undefined') {
        console.warn('⚠️ Tesseract.js chưa được tải. Một số đoạn văn trong canvas có thể không được đọc.');
        console.warn('Extension vẫn sẽ đọc các đoạn văn có sẵn trong text nodes.');
      } else {
        console.log('🔄 Bắt đầu OCR cho canvas elements...');
      }
      
      let processedCount = 0;
      for (const canvas of canvasElements) {
        // Skip if canvas is too small (likely decorative)
        if (canvas.width < 100 || canvas.height < 20) {
          continue;
        }
        
        // Check if canvas has already been processed (has a data attribute)
        if (canvas.dataset.ocrProcessed === 'true') {
          continue;
        }
        
        try {
          const canvasText = await extractTextFromCanvas(canvas);
          if (canvasText && canvasText.trim()) {
            processedCount++;
            console.log(`✅ OCR thành công (${processedCount}/${canvasCount}): "${canvasText.substring(0, 50)}..."`);
            
            // Mark canvas as processed
            canvas.dataset.ocrProcessed = 'true';
            
            // Split canvas text into sentences
            let matches = canvasText.match(SENTENCE_REGEX);
            if (!matches || matches.join('').trim().length < canvasText.trim().length * 0.8) {
              const trimmed = canvasText.trim();
              if (trimmed) {
                matches = [trimmed];
              }
            }
            
            if (matches) {
              matches.forEach((segment) => {
                if (!segment.trim()) return;
                
                // Create a span for the canvas text (invisible, for highlighting)
                const span = document.createElement('span');
                span.className = 'metruyencv-sentence metruyencv-canvas-text';
                span.textContent = segment;
                span.style.display = 'none'; // Hide but keep for reference
                
                // Insert span after canvas
                canvas.parentNode.insertBefore(span, canvas.nextSibling);
                
                const sanitized = cleanText(segment);
                if (sanitized) {
                  queue.push({ span, text: sanitized, raw: segment, isCanvas: true });
                }
              });
            }
          }
        } catch (error) {
          console.error('❌ Lỗi xử lý canvas:', error);
          // Continue with other canvases
        }
      }
      
      if (processedCount > 0) {
        console.log(`✅ Đã xử lý ${processedCount} canvas elements bằng OCR`);
      }
    }
    
    if (!queue.length) {
      throw new Error('Không có nội dung để đọc.');
    }
    
    // Sort queue by DOM position to maintain reading order
    queue.sort((a, b) => {
      const aPos = a.span.compareDocumentPosition(b.span);
      if (aPos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (aPos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });
    
    return queue;
  };

  const prepareQueue = async () => {
    state.queue = await createSentenceQueue();
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
    
    if (!state.settings.autoNext) {
      console.log('[TTS] autoNext is disabled');
      sessionStorage.removeItem(AUTO_KEY);
      return;
    }
    
    // Save settings for next page
    sessionStorage.setItem(
      AUTO_KEY,
      JSON.stringify({
        resume: true,
        settings: state.settings
      })
    );
    
    // Try URL first
    if (meta.nextUrl) {
      console.log('[TTS] Auto-navigating to next chapter:', meta.nextUrl);
      setTimeout(() => {
        window.location.href = meta.nextUrl;
      }, 500);
    } 
    // Try clicking button
    else if (meta.nextButton) {
      console.log('[TTS] Clicking next chapter button');
      setTimeout(() => {
        meta.nextButton.click();
      }, 500);
    } 
    else {
      console.log('[TTS] No way to navigate to next chapter');
      sessionStorage.removeItem(AUTO_KEY);
    }
  };

  const startReading = async (settings = {}) => {
    // Stop any existing playback
    stopAllPlayback();
    
    state.settings = {
      ...state.settings,
      ...settings
    };
    
    try {
      await prepareQueue();
      state.utterances = [];
      state.queueIndex = 0;
      state.status = 'reading';
      emit(buildStatus());
      playCurrentChunk();
    } catch (error) {
      console.error('Lỗi chuẩn bị queue:', error);
      state.status = 'idle';
      emit(buildStatus());
      throw error;
    }
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

  const ensureAutoStart = async () => {
    const payload = sessionStorage.getItem(AUTO_KEY);
    if (!payload) return;
    try {
      const data = JSON.parse(payload);
      sessionStorage.removeItem(AUTO_KEY);
      if (data.resume) {
        await startReading(data.settings);
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

  // Listen for messages from PWA or extension
  window.addEventListener('message', async (event) => {
    // Only accept messages from same origin or trusted sources
    if (event.data?.type?.startsWith('chapter-reader-')) {
      const message = event.data;
      
      switch (message.type) {
        case 'chapter-reader-command':
          if (message.command === 'start') {
            try {
              await startReading(message.settings || {});
              window.postMessage({ type: 'chapter-reader-response', success: true }, '*');
            } catch (error) {
              window.postMessage({ type: 'chapter-reader-response', success: false, error: error.message }, '*');
            }
          } else if (message.command === 'pause') {
            pauseReading();
          } else if (message.command === 'resume') {
            resumeReading();
          } else if (message.command === 'stop') {
            stopReading();
          } else if (message.command === 'getState') {
            window.postMessage({ type: 'chapter-reader-state', state: buildStatus() }, '*');
          } else if (message.command === 'listVoices') {
            const voices = await getVoices();
            window.postMessage({ type: 'chapter-reader-voices', voices }, '*');
          }
          break;
        default:
          break;
      }
    }
  });

  // Also listen for extension messages (backward compatibility)
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (!message?.type) return;
      switch (message.type) {
        case 'getState':
          sendResponse(buildStatus());
          break;
        case 'startReading':
          (async () => {
            try {
              await startReading(message.settings);
              sendResponse({ success: true });
            } catch (error) {
              sendResponse({ success: false, error: error.message });
            }
          })();
          return true;
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
  }

  window.addEventListener('beforeunload', () => {
    stopAllPlayback();
  });

  ensureAutoStart();
})();
