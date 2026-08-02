/* --------------------------------------------------------------------------
   ROMANTIC QUOTES & WISHES GENERATOR
   -------------------------------------------------------------------------- */

const QuotesEngine = (function() {
  'use strict';

  const ROMANTIC_QUOTES = [
    "Vũ trụ này rộng lớn mênh mông, nhưng nơi duy nhất anh muốn lưu lại chính là trong trái tim em.",
    "Dù chúng ta ở đâu, dù quá khứ hay tương lai, anh nhất định sẽ tìm thấy em.",
    "Không có bức thư nào chứa đựng đủ chân thành ngoại trừ những nhịp đập từ chính trái tim anh dành cho em.",
    "Yêu em không phải là một sự lựa chọn, mà là điều tự nhiên nhất trong cuộc đời anh.",
    "Cảm ơn em vì đã biến những ngày bình thường thành những chương đẹp nhất trong cuốn sách cuộc đời anh.",
    "Bên em, mỗi khoảnh khắc đều trở thành vĩnh cửu.",
    "Trái tim anh biết đường về nhà — và đó chính là em."
  ];

  let quoteTextEl, nextBtn;
  let currentIndex = 0;
  let isAnimating = false;

  function init() {
    quoteTextEl = document.getElementById('quote-text');
    nextBtn = document.getElementById('quote-next-btn');

    if (!quoteTextEl || !nextBtn) return;

    displayQuote(currentIndex);

    nextBtn.addEventListener('click', () => {
      if (isAnimating) return;
      AudioEngine.playSound('click');
      MeteorEngine.triggerManual();
      changeQuote();
    });
  }

  function changeQuote() {
    isAnimating = true;
    quoteTextEl.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    quoteTextEl.style.opacity = '0';
    quoteTextEl.style.transform = 'translateY(10px)';

    setTimeout(() => {
      currentIndex = (currentIndex + 1) % ROMANTIC_QUOTES.length;
      displayQuote(currentIndex);
      quoteTextEl.style.opacity = '1';
      quoteTextEl.style.transform = 'translateY(0)';
      isAnimating = false;
    }, 420);
  }

  function displayQuote(index) {
    if (quoteTextEl) {
      quoteTextEl.textContent = `"${ROMANTIC_QUOTES[index]}"`;
    }
  }

  return {
    init
  };
})();
