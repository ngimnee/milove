/* ==========================================================================
   MEMORY BOOK - CONTROLLER MODULE
   Central Orchestrator connecting Storage, State, Renderer, Navigation,
   Animation, and Entry.
   ========================================================================== */

const MemoryBookController = (function() {
  'use strict';

  let autoSuggestTimer = null;

  function init() {
    // 1. Initialize Floating Utilities Dock Entry
    MemoryBookEntry.init({
      onOpen: openAlbum
    });

    // 2. Setup Auto-Suggest Timer (60s check if user hasn't opened book)
    if (!MemoryBookStorage.hasOpenedBefore()) {
      autoSuggestTimer = setTimeout(checkAutoSuggest, 60000);
    }
  }

  function checkAutoSuggest() {
    if (!MemoryBookStorage.hasOpenedBefore() && !MemoryBookState.isOpen()) {
      MemoryBookState.setAutoSuggestTriggered(true);
      MemoryBookAnimation.triggerAutoSuggestEffect(
        MemoryBookEntry.getDockElement(),
        MemoryBookEntry.getTooltipElement()
      );
    }
  }

  function openAlbum() {
    if (MemoryBookState.isOpen() || MemoryBookState.isAnimating()) return;

    if (autoSuggestTimer) {
      clearTimeout(autoSuggestTimer);
      autoSuggestTimer = null;
    }

    // Lazy Render Album DOM on first open
    if (!MemoryBookState.isRendered()) {
      MemoryBookRenderer.renderAlbum();
      MemoryBookNavigation.init({
        onNext: nextPage,
        onPrev: prevPage,
        onClose: closeAlbum
      });
      MemoryBookNavigation.bindDOMButtons();
      MemoryBookState.setRendered(true);
    }

    // Update storage & state
    MemoryBookStorage.setOpened();
    MemoryBookState.setOpen(true);
    MemoryBookState.setTotalPages(MemoryBookRenderer.getPagesCount());

    const savedPage = MemoryBookStorage.getLastPage();
    MemoryBookState.setCurrentPage(savedPage);
    MemoryBookRenderer.updatePageDisplay(savedPage, MemoryBookRenderer.getPagesCount());

    // Play entrance sequence
    MemoryBookAnimation.playOpenSequence(() => {
      // Completed opening sequence
    });
  }

  function closeAlbum() {
    if (!MemoryBookState.isOpen() || MemoryBookState.isAnimating()) return;

    MemoryBookAnimation.playCloseSequence(() => {
      MemoryBookState.setOpen(false);
    });
  }

  function nextPage() {
    if (!MemoryBookState.isOpen() || MemoryBookState.isAnimating()) return;

    const total = MemoryBookRenderer.getPagesCount();
    let current = MemoryBookState.getCurrentPage();
    current = (current + 1) % total;

    MemoryBookState.setCurrentPage(current);
    MemoryBookStorage.saveLastPage(current);
    MemoryBookRenderer.updatePageDisplay(current, total);

    if (window.AudioEngine && typeof window.AudioEngine.playSound === 'function') {
      window.AudioEngine.playSound('typing');
    }
  }

  function prevPage() {
    if (!MemoryBookState.isOpen() || MemoryBookState.isAnimating()) return;

    const total = MemoryBookRenderer.getPagesCount();
    let current = MemoryBookState.getCurrentPage();
    current = (current - 1 + total) % total;

    MemoryBookState.setCurrentPage(current);
    MemoryBookStorage.saveLastPage(current);
    MemoryBookRenderer.updatePageDisplay(current, total);

    if (window.AudioEngine && typeof window.AudioEngine.playSound === 'function') {
      window.AudioEngine.playSound('typing');
    }
  }

  return {
    init,
    openAlbum,
    closeAlbum,
    nextPage,
    prevPage
  };
})();
