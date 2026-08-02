/* --------------------------------------------------------------------------
   MEMORY BOOK - CONTROLLER MODULE
   Central Orchestrator connecting Storage, State, Renderer, Navigation, Animation, and Entry.
   -------------------------------------------------------------------------- */

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

  function flipPage(isNext) {
    if (!MemoryBookState.isOpen() || MemoryBookState.isAnimating()) return;

    const total = MemoryBookRenderer.getPagesCount();
    const oldIndex = MemoryBookState.getCurrentPage();
    const newIndex = isNext
      ? (oldIndex + 1) % total
      : (oldIndex - 1 + total) % total;

    const pageNodes = document.querySelectorAll('.album-page');
    const oldNode = pageNodes[oldIndex];
    const newNode = pageNodes[newIndex];
    if (!oldNode || !newNode) return;

    MemoryBookState.setAnimating(true);
    MemoryBookState.setCurrentPage(newIndex);
    MemoryBookStorage.saveLastPage(newIndex);

    AudioEngine.playSound('page');

    const DURATION = 580; // ms — matches CSS @keyframes page-flip-shadow
    const EASE_FOLD   = 'cubic-bezier(0.455, 0.03, 0.515, 0.955)'; // easeInOutSine — smooth fold into spine
    const EASE_UNFOLD = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';   // easeOutQuad — snappy landing

    function finalize() {
      [oldNode, newNode].forEach(n => {
        n.style.cssText = '';
        n.classList.remove('is-flipping');
      });
      oldNode.classList.remove('active');
      oldNode.classList.add(isNext ? 'turned-prev' : 'turned-next');
      newNode.classList.add('active');
      MemoryBookRenderer.updatePageDisplay(newIndex, total);
      setTimeout(() => MemoryBookState.setAnimating(false), 30);
    }

    if (isNext) {
      // ── FORWARD: old page folds into spine; new page revealed underneath ──
      // 1. Place new page flat underneath (instant, no transition)
      newNode.style.cssText = 'visibility:visible; opacity:1; transform:rotateY(0deg); z-index:5; transition:none;';

      // 2. Trigger shadow keyframe on old page as it folds
      oldNode.classList.add('is-flipping');

      // 3. Fold old page to spine (rotateY 0 → -170°)
      void oldNode.offsetWidth;
      oldNode.style.cssText = `visibility:visible; opacity:1; transform:rotateY(0deg); z-index:20; transition:none;`;
      void oldNode.offsetWidth;
      oldNode.style.transition = `transform ${DURATION}ms ${EASE_FOLD}`;
      oldNode.style.transform = 'rotateY(-170deg)';

      setTimeout(finalize, DURATION + 20);

    } else {
      // ── BACKWARD: old page hides instantly; new page unfolds from spine ──
      // Hide old page immediately
      oldNode.style.cssText = 'visibility:hidden; opacity:0; z-index:5; transition:none;';

      // Snap new page to folded start position (no transition)
      newNode.style.cssText = 'visibility:visible; opacity:1; transform:rotateY(-170deg); z-index:20; transition:none;';
      void newNode.offsetWidth;

      // Trigger shadow keyframe as new page unfolds
      newNode.classList.add('is-flipping');

      // Unfold new page toward viewer
      newNode.style.transition = `transform ${DURATION}ms ${EASE_UNFOLD}`;
      newNode.style.transform = 'rotateY(0deg)';

      setTimeout(finalize, DURATION + 20);
    }
  }

  function nextPage() { flipPage(true); }
  function prevPage() { flipPage(false); }

  return {
    init,
    openAlbum,
    closeAlbum,
    nextPage,
    prevPage
  };
})();
