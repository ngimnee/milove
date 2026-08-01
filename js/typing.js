/* ==========================================================================
   TYPEWRITER ENGINE FOR LOVE LETTER
   ========================================================================== */

const TypewriterEngine = (function() {
  'use strict';

  const LETTER_CONTENT = `Gửi em, người con gái đã làm thay đổi cả thế giới của anh...

Có những ngày anh ngồi lặng im giữa không gian bao la, ngắm nhìn những vì sao trên bầu trời đêm và tự hỏi: "Điều kỳ diệu nhất trong cuộc đời này là gì?"

Và câu trả lời luôn luôn là khoảnh khắc anh được gặp em.

Cảm ơn em vì đã đến bên anh, mang theo thứ ánh sáng dịu dàng như hoa anh đào buổi sớm, ấm áp như ánh nắng mùa thu. Cảm ơn em đã kiên nhẫn cùng anh qua những giông bão, chia sẻ từng nụ cười, từng giọt nước mắt, và biến những điều bình dị nhất trở thành kỷ niệm vô giá.

Người ta nói vũ trụ này có vô số dải ngân hà, nhưng đối với anh, em chính là vũ trụ duy nhất mà anh muốn dành cả đời này để khám phá và yêu thương.

Cho dù thời gian có trôi đi, cho dù bầu trời đêm ngoài kia có thay đổi, lời hứa này vẫn luôn vẹn nguyên: Anh sẽ luôn ở đây, yêu em nhiều hơn mỗi ngày, trân trọng từng phút giây chúng mình bên nhau.

Yêu em nhiều hơn tất cả những gì anh có thể nói thành lời.
`;

  const SIGNATURE = "Anh,\nYêu của Em ❤️";

  let bodyElement = null;
  let cursorElement = null;
  let signatureElement = null;

  let currentIndex = 0;
  let isTyping = false;
  let isPaused = false;
  let typingTimer = null;
  const speed = 45; // ms per character

  function init() {
    bodyElement = document.getElementById('letter-typewriter-text');
    cursorElement = document.getElementById('typewriter-cursor');
    signatureElement = document.getElementById('letter-signature');

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
  }

  function start() {
    if (!bodyElement) return;
    reset();
    isTyping = true;
    typeNextChar();
  }

  function typeNextChar() {
    if (!isTyping || isPaused) return;

    if (currentIndex < LETTER_CONTENT.length) {
      const char = LETTER_CONTENT.charAt(currentIndex);
      bodyElement.textContent += char;

      // Hide cursor temporarily on newline to avoid it jumping to blank line
      if (cursorElement) {
        cursorElement.style.display = (char === '\n') ? 'none' : 'inline-block';
      }

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

  function togglePause() {
    isPaused = !isPaused;
    const btnPause = document.getElementById('btn-type-pause');
    if (btnPause) {
      btnPause.innerHTML = isPaused ? '<i class="fas fa-play"></i> Tiếp tục' : '<i class="fas fa-pause"></i> Tạm dừng';
    }
    if (!isPaused && isTyping) {
      typeNextChar();
    }
  }

  function restart() {
    clearTimeout(typingTimer);
    start();
  }

  function skip() {
    clearTimeout(typingTimer);
    if (bodyElement) bodyElement.textContent = LETTER_CONTENT;
    currentIndex = LETTER_CONTENT.length;
    finish();
  }

  function reset() {
    clearTimeout(typingTimer);
    currentIndex = 0;
    isTyping = false;
    isPaused = false;
    if (bodyElement) bodyElement.textContent = '';
    if (cursorElement) {
      cursorElement.classList.remove('hidden');
      cursorElement.style.display = 'inline-block';
    }
    if (signatureElement) {
      signatureElement.textContent = '';
      signatureElement.classList.remove('show');
    }
  }

  function finish() {
    isTyping = false;
    // Hide the blinking cursor completely when typing is done
    if (cursorElement) {
      cursorElement.style.display = 'none';
      cursorElement.classList.add('hidden');
    }
    if (signatureElement) {
      signatureElement.textContent = SIGNATURE;
      signatureElement.classList.add('show');
    }
    // Launch celebratory fireworks when reading completes
    FireworksEngine.launchSequence();
  }

  return {
    init,
    start,
    restart,
    skip,
    togglePause
  };
})();
