/* --------------------------------------------------------------------------
   TYPEWRITER ENGINE FOR LOVE LETTER
   -------------------------------------------------------------------------- */

const TypewriterEngine = (function() {
  'use strict';

  const LETTER_CONTENT = `Gửi em, Chíp iu thương của Anh..

Không biết hôm nay em thế nào. Vui không. Cười nhiều không. Chứ anh nhớ em nhiều lắm. Muốn ôm em lắm. 

Anh không biết từ bao giờ anh lại yêu em, thương em nhiều như vậy nữa. Ban đầu là thích em rồi yêu em, thương em. Nhưng đến bây giờ, chính anh cũng không chắc tình cảm của anh cụ thể như nào. Anh chỉ biết là anh yêu em, thương em hơn tất cả những gì anh nói, anh làm. Muốn làm cho em, dành cho em tất cả những gì tốt nhất, chân thành nhất anh có thể.
Anh không giỏi giang, tâm lý như bao chàng trai ngoài kia. Nên nhiều lúc anh cũng buồn, cũng suy nghĩ lắm. Buồn, suy nghĩ vì so ra tình yêu của anh dành cho em lại chẳng nhiều, chẳng so được như những người ngoài kia.

Em hay suy nghĩ và rất nhạy cảm. Anh thì lại tính hay trêu. Anh sợ lắm những lúc mà em suy nghĩ anh lại không biết gì cả. Lúc đấy anh như người dưng. Lại vô tình làm tổn thương em, để em tủi thân. Anh xót lắm🥺. Nên là có gì vui hay không vui cũng đều nói với anh nhé. Anh không dám hứa sẽ xua đi hết những chuyện không vui của em. Nhưng anh hứa sẽ ở cạnh lắng nghe, dỗ dành an ủi và đặc biệt là sẽ ôm em (hun em nữa🤭).
Cho phép anh mượn câu này của TikTok để thay lời gửi dành tới em nhá: 
"Nếu em mệt, cứ để anh gánh giúp phần đau ấy. Đổi lại, chỉ cần em giữ nụ cười trên môi.
Vì với anh, khi em cười, mọi vết thương trong lòng anh cũng tự khắc được chữa lành."

Em biết không, em xinh lắm, xinh lắm í. Thật đấy. Nhiều lúc anh cũng không biết là em đang đùa hay em còn tự ti. Nhưng trong mắt anh, em còn xinh, còn đẹp hơn nữa. Đẹp nhất trong lòng anh đó ạ. Nên là hãy cứ tự tin và cùng anh tự hào với vẻ đẹp của em nhé.

Lúc em đọc được lá thư này, câu chuyện của chúng mình cũng đang dần bước sang một hành trình mới. Khoảng thời gian chúng ta ở bên nhau không chỉ còn được đếm bằng từng ngày hay vài chục ngày nữa, mà sẽ được "nâng cấp" lên một đơn vị mới - một đơn vị minh chứng cho sự kiên nhẫn và yêu thương.
Đó có thể chưa phải là một chặng đường quá dài, nhưng lại là cột mốc đánh dấu những bước đầu tiên của hai đứa mình. Trong suốt quãng thời gian ấy, chúng ta đã cùng nhau trải qua những khoảnh khắc hạnh phúc, những lúc giận hờn, buồn bã, và cả những lần học cách thấu hiểu nhau hơn. Dù có chuyện gì xảy ra, điều khiến anh hạnh phúc nhất là đến giờ phút này, chúng ta vẫn đang nắm tay nhau và cùng bước tiếp.

Thời gian này không được gặp em thường xuyên. Anh nhớ em lắm. Chúng mình đều là người nhạy cảm. Rất nhiều lúc đã im lặng với nhau. Nhưng cảm ơn em vẫn ôm lấy anh. Vẫn cho anh cơ hội được giải thích, được tiếp tục quan tâm, yêu thương em. Anh vui lắm. Anh muốn được cùng em đi đến cuối con đường, muốn được ra mắt bố mẹ em, xin phép được yêu em, thương em, rước em về gia đình nhỏ của chúng mình. Sáng sáng ngắm nhìn em thức giấc. Tối đến cùng em đi ngủ. Đây là ước mong, cũng là lời hứa anh dành cho em đấy. 

Và cảm ơn em, cảm ơn chúng ta đã tìm thấy và bước đến bên nhau. Dù là những lúc ốm đau, những ngày vui khi buồn hay cả những lúc "tụt mood" như em vẫn nói, vẫn luôn ở cạnh, quan tâm, chăm sóc và lo lắng cho nhau.
Cảm ơn em vì đã đến bên anh, đã kiên nhẫn cùng anh qua những giông bão, chia sẻ từng nụ cười, niềm vui, từng giọt nước mắt, và biến những điều tưởng chừng là đơn giản nhất thành những kỷ niệm vô giá.

Anh vẫn luôn ở đây, ở cạnh và yêu thương em hơn mỗi ngày, trân trọng em, trân trọng chúng ta và cả từng giây từng phút trôi qua của chúng ta nữa. Hãy ở cạnh anh và yêu thương anh em nhé. Đến năm em 25 tuổi, anh sẽ đến và thực hiện lời hứa trong lòng của mình. Anh yêu Em❤️
`;

  const SIGNATURE = "Anh,\nYêu của Em❤️";

  let bodyElement = null;
  let cursorElement = null;
  let signatureElement = null;

  let currentIndex = 0;
  let isTyping = false;
  let isPaused = false;
  let typingTimer = null;
  const speed = 46.8; // ms per character

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

      // Auto-scroll paper wrapper ONLY if user has not manually scrolled up
      const paperWrapper = document.querySelector('.letter-paper-wrapper');
      if (paperWrapper && !isScrolledUp(paperWrapper)) {
        paperWrapper.scrollTop = paperWrapper.scrollHeight;
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
    const paperWrapper = document.querySelector('.letter-paper-wrapper');
    if (paperWrapper) paperWrapper.scrollTop = 0;
  }

  function isScrolledUp(el) {
    if (!el) return false;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    return distanceToBottom > 50;
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
    const paperWrapper = document.querySelector('.letter-paper-wrapper');
    if (paperWrapper && !isScrolledUp(paperWrapper)) {
      paperWrapper.scrollTop = paperWrapper.scrollHeight;
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
