/* --------------------------------------------------------------------------
   MEMORY BOOK - CONTROLLER MODULE
   Central Orchestrator connecting Storage, State, Renderer, Navigation, Animation, and Entry.
   -------------------------------------------------------------------------- */

const MemoryBookController = (function() {
  'use strict';

  let autoSuggestTimer = null;
  let isClosing = false;

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
    if (!MemoryBookState.isOpen() || MemoryBookState.isAnimating() || isClosing) return;
    isClosing = true;

    // Closing may start while the opening is still playing; the animation module hands over cleanly
    MemoryBookAnimation.playCloseSequence(() => {
      isClosing = false;
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

    const DURATION_NEXT = 550; // ms — perfect middle-ground pace
    const DURATION_PREV = 550; // ms — smooth backward flip
    const EASE_FOLD   = 'cubic-bezier(0.455, 0.03, 0.515, 0.955)'; // Gentle easeInOutSine fold
    const EASE_UNFOLD = 'cubic-bezier(0.22, 0.61, 0.36, 1)';      // Smooth initial sweep for unfolding back

    // The label turns with the page: it fades out over the first half of the flip, swaps at the
    // midpoint (the page is edge-on and the new one takes over) and fades back in over the second half
    const indicator = document.getElementById('album-page-indicator');
    if (indicator) indicator.classList.add('is-turning');
    const labelTimer = setTimeout(() => {
      MemoryBookRenderer.updatePageIndicator(newIndex, total);
      if (indicator) indicator.classList.remove('is-turning');
    }, DURATION_NEXT / 2);

    function finalize() {
      clearTimeout(labelTimer);
      MemoryBookRenderer.updatePageIndicator(newIndex, total);
      if (indicator) indicator.classList.remove('is-turning');
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
      // ── FORWARD: old page folds into spine (-170deg); new page revealed underneath ──
      newNode.style.cssText = 'visibility:visible; opacity:1; transform:rotateY(0deg); z-index:5; transition:none;';
      oldNode.style.cssText = 'visibility:visible; opacity:1; transform:rotateY(0deg); z-index:20; transition:none;';
      oldNode.classList.add('is-flipping');

      requestAnimationFrame(() => {
        oldNode.style.transition = `transform ${DURATION_NEXT}ms ${EASE_FOLD}`;
        oldNode.style.transform = 'rotateY(-170deg)';
      });

      setTimeout(finalize, DURATION_NEXT + 30);

    } else {
      // ── BACKWARD: new page sweeps in from spine (-170deg -> 0deg); old page stays flat underneath ──
      oldNode.style.cssText = 'visibility:visible; opacity:1; transform:rotateY(0deg); z-index:5; transition:none;';
      newNode.style.cssText = 'visibility:visible; opacity:1; transform:rotateY(-170deg); z-index:20; transition:none;';

      requestAnimationFrame(() => {
        newNode.classList.add('is-flipping');
        newNode.style.transition = `transform ${DURATION_PREV}ms ${EASE_UNFOLD}`;
        newNode.style.transform = 'rotateY(0deg)';
      });

      setTimeout(finalize, DURATION_PREV + 30);
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
