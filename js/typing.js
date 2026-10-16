/* --------------------------------------------------------------------------
   TYPEWRITER ENGINE FOR LOVE LETTER
   -------------------------------------------------------------------------- */

const TypewriterEngine = (function() {
  'use strict';

  // The letter text is not in the source: it lives AES-encrypted in js/encrypted-data.js
  // (made with the "Lá thư" tab of encrypt-tool.html) and is decrypted once, on demand.
  const LOAD_ERROR_TEXT = 'Không mở được lá thư lúc này. Em tải lại trang giúp anh nhé 💌';

  let letterContent = '';
  let letterChars = [];       // letterContent split into user-perceived characters (emoji stay whole)
  let signatureText = '';
  let loadPromise = null;
  let runId = 0;

  let bodyElement = null;
  let textNode = null;        // the single Text node the letter is typed into
  let cursorElement = null;
  let signatureElement = null;
  let paperWrapper = null;
  let scrollQueued = false;

  let currentIndex = 0;
  let isTyping = false;
  let isPaused = false;
  let isReady = false;        // the letter is decrypted and typing may run
  let hasFinished = false;    // the whole letter is shown (typed out or skipped): the finale played once
  let typingTimer = null;
  const speed = 46.8; // ms per character

  function init() {
    bodyElement = document.getElementById('letter-typewriter-text');
    cursorElement = document.getElementById('typewriter-cursor');
    signatureElement = document.getElementById('letter-signature');
    paperWrapper = document.querySelector('.letter-paper-wrapper');
    if (bodyElement) {
      textNode = document.createTextNode('');
      bodyElement.replaceChildren(textNode);
    }

    // Bind Controls
    const btnPause = document.getElementById('btn-type-pause');
    const btnReplay = document.getElementById('btn-type-replay');
    const btnSkip = document.getElementById('btn-type-skip');

    if (btnPause) {
      btnPause.addEventListener('click', togglePause);
    }
    if (btnReplay) {
      btnReplay.addEventListener('click', restart);
    }
    if (btnSkip) {
      btnSkip.addEventListener('click', skip);
    }

    // Decrypt ahead of time so the first keystroke is not delayed
    loadLetter().catch(() => {});
  }

  function loadLetter() {
    if (!loadPromise) {
      loadPromise = (async () => {
        [letterContent, signatureText] = await Promise.all([
          AppCrypto.decryptText(LetterData.body),
          AppCrypto.decryptText(LetterData.signature)
        ]);
        letterChars = splitGraphemes(letterContent);
      })();
      // Allow a retry on the next open if decryption failed
      loadPromise.catch(() => { loadPromise = null; });
    }
    return loadPromise;
  }

  // charAt() would cut emoji like 🥺 in half and flash a broken glyph for one tick
  function splitGraphemes(text) {
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      return Array.from(new Intl.Segmenter('vi', { granularity: 'grapheme' }).segment(text), (part) => part.segment);
    }
    return Array.from(text);
  }

  // Keep the newest line in view, at most once per frame (reading scroll metrics forces a layout)
  function queueAutoScroll() {
    if (scrollQueued || !paperWrapper) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      scrollQueued = false;
      if (!isScrolledUp(paperWrapper)) {
        paperWrapper.scrollTop = paperWrapper.scrollHeight;
      }
    });
  }

  function start() {
    if (!bodyElement) return;
    reset();
    isTyping = true;
    const myRun = ++runId;
    loadLetter().then(() => {
      if (myRun !== runId || !isTyping) return;
      isReady = true;
      typeNextChar();
    }).catch((err) => {
      console.error('[Typewriter] Cannot decrypt letter:', err);
      if (myRun !== runId) return;
      isTyping = false;
      textNode.data = LOAD_ERROR_TEXT;
      if (cursorElement) cursorElement.style.display = 'none';
    });
  }

  function typeNextChar() {
    if (!isTyping || isPaused) return;

    if (currentIndex < letterChars.length) {
      const char = letterChars[currentIndex];
      // Appending to one Text node is O(1); `textContent +=` rebuilt the whole letter on every keystroke
      textNode.appendData(char);

      // Hide cursor temporarily on newline to avoid it jumping to blank line
      const cursorDisplay = (char === '\n') ? 'none' : 'inline-block';
      if (cursorElement && cursorElement.style.display !== cursorDisplay) {
        cursorElement.style.display = cursorDisplay;
      }

      // Auto-scroll paper wrapper ONLY if user has not manually scrolled up
      queueAutoScroll();

      // Play soft typing sound on non-whitespace characters
      if (char.trim() !== '') {
        AudioEngine.playSound('typing');
      }

      currentIndex++;
      const charSpeed = (char === '.' || char === '!' || char === '?') ? speed * 8 : speed;
      typingTimer = setTimeout(typeNextChar, charSpeed);
    } else {
      finish();
    }
  }

  function updatePauseButton() {
    const btnPause = document.getElementById('btn-type-pause');
    if (btnPause) {
      btnPause.innerHTML = isPaused ? '<i class="fas fa-play"></i> Tiếp tục' : '<i class="fas fa-pause"></i> Tạm dừng';
    }
  }

  function togglePause() {
    isPaused = !isPaused;
    updatePauseButton();
    // Drop any timer still queued, so pausing and resuming quickly never runs two typing chains.
    // Before the letter is decrypted start() begins the typing itself.
    clearTimeout(typingTimer);
    if (!isPaused && isTyping && isReady) {
      typeNextChar();
    }
  }

  // Closing the letter: no more keystrokes, and nothing fires the finale behind the page
  function stop() {
    clearTimeout(typingTimer);
    runId++;
    isTyping = false;
    isPaused = false;
    isReady = false;
    hasFinished = false;
    updatePauseButton();
  }

  function restart() {
    clearTimeout(typingTimer);
    start();
  }

  function skip() {
    // Already all on the page: nothing to skip, and no second finale
    if (hasFinished) return;
    clearTimeout(typingTimer);
    const myRun = ++runId;
    // Skipping while paused ends the pause too, or the button would still say "Tiếp tục"
    isPaused = false;
    updatePauseButton();
    loadLetter().then(() => {
      if (myRun !== runId) return;
      if (textNode) textNode.data = letterContent;
      currentIndex = letterChars.length;
      finish();
    }).catch(() => {});
  }

  function reset() {
    clearTimeout(typingTimer);
    currentIndex = 0;
    isTyping = false;
    isPaused = false;
    isReady = false;
    hasFinished = false;
    updatePauseButton();
    if (bodyElement) {
      textNode = document.createTextNode('');
      bodyElement.replaceChildren(textNode);
    }
    if (cursorElement) {
      cursorElement.classList.remove('hidden');
      cursorElement.style.display = 'inline-block';
    }
    if (signatureElement) {
      signatureElement.textContent = '';
      signatureElement.classList.remove('show');
    }
    if (paperWrapper) paperWrapper.scrollTop = 0;
  }

  function isScrolledUp(el) {
    if (!el) return false;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    return distanceToBottom > 50;
  }

  function finish() {
    if (hasFinished) return;
    hasFinished = true;
    isTyping = false;
    // Hide the blinking cursor completely when typing is done
    if (cursorElement) {
      cursorElement.style.display = 'none';
      cursorElement.classList.add('hidden');
    }
    if (signatureElement) {
      signatureElement.textContent = signatureText;
      signatureElement.classList.add('show');
    }
    queueAutoScroll();
    // Launch celebratory fireworks when reading completes
    FireworksEngine.launchSequence();
  }

  return {
    init,
    start,
    restart,
    skip,
    stop,
    togglePause
  };
})();
