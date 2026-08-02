/* --------------------------------------------------------------------------
   MEMORY BOOK - NAVIGATION MODULE
   Binds user interaction controls (buttons, keyboard shortcuts, touch gestures)
   -------------------------------------------------------------------------- */

const MemoryBookNavigation = (function() {
  'use strict';

  let callbacks = {
    onNext: null,
    onPrev: null,
    onClose: null
  };

  let touchStartX = 0;
  let touchStartY = 0;
  let isBound = false;

  function init(handlers) {
    callbacks = { ...callbacks, ...handlers };
    bindEvents();
  }

  function bindEvents() {
    if (isBound) return;
    isBound = true;

    // Keyboard navigation listener
    document.addEventListener('keydown', handleKeyDown);

    // Touch navigation for mobile swipe
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
  }

  function bindDOMButtons() {
    const prevBtn = document.getElementById('album-prev-btn');
    const nextBtn = document.getElementById('album-next-btn');
    const closeBtn = document.getElementById('memory-book-close-btn');

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (callbacks.onPrev) callbacks.onPrev();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (callbacks.onNext) callbacks.onNext();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (callbacks.onClose) callbacks.onClose();
      });
    }
  }

  function handleKeyDown(e) {
    if (!MemoryBookState.isOpen()) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      if (callbacks.onClose) callbacks.onClose();
    } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      e.preventDefault();
      if (callbacks.onNext) callbacks.onNext();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      if (callbacks.onPrev) callbacks.onPrev();
    }
  }

  function handleTouchStart(e) {
    if (!MemoryBookState.isOpen()) return;
    if (e.touches && e.touches.length > 0) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  }

  function handleTouchEnd(e) {
    if (!MemoryBookState.isOpen()) return;
    if (!e.changedTouches || e.changedTouches.length === 0) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    // Horizonal swipe detection threshold > 50px
    if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        // Swipe left -> Next Page
        if (callbacks.onNext) callbacks.onNext();
      } else {
        // Swipe right -> Prev Page
        if (callbacks.onPrev) callbacks.onPrev();
      }
    }
  }

  return {
    init,
    bindDOMButtons
  };
})();
