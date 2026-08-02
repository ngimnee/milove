/* ==========================================================================
   MEMORY BOOK - ANIMATION MODULE
   GSAP Cinematic 3D opening and closing sequence orchestrator
   ========================================================================== */

const MemoryBookAnimation = (function() {
  'use strict';

  function getGSAP() {
    return window.gsap || null;
  }

  function playOpenSequence(onComplete) {
    const gsap = getGSAP();
    const modal = document.getElementById('memory-book-modal');
    const goldenLight = document.getElementById('album-golden-light');
    const album = document.getElementById('memory-book-album');
    const frontCover = modal ? modal.querySelector('.album-cover-front') : null;
    const bookmark = document.getElementById('album-ribbon-bookmark');
    const dock = document.getElementById('floating-utilities-dock');
    const mainContent = document.getElementById('main-content');

    if (!modal || !album) {
      if (onComplete) onComplete();
      return;
    }

    modal.classList.add('active');
    document.body.classList.add('album-active-blur');

    // Fade background audio to 40%
    if (window.AudioEngine && typeof window.AudioEngine.fadeVolume === 'function') {
      window.AudioEngine.fadeVolume(0.4, 1500);
    }
    if (window.AudioEngine && typeof window.AudioEngine.playSound === 'function') {
      window.AudioEngine.playSound('open');
    }

    if (!gsap) {
      // Fallback CSS animation if GSAP isn't loaded
      if (dock) dock.classList.add('dock-shrunken');
      if (goldenLight) goldenLight.classList.add('active');
      if (frontCover) frontCover.classList.add('opened');
      if (onComplete) onComplete();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete();
      }
    });

    // Step 1: Hide Floating Utilities Dock completely while album is open
    if (dock) {
      dock.classList.add('dock-hidden');
      tl.to(dock, { scale: 0.8, opacity: 0, duration: 0.4, ease: 'power2.out' }, 0);
    }

    // Step 2 & 4: Camera zoom on main background
    if (mainContent) {
      tl.to(mainContent, { scale: 1.03, duration: 1.2, ease: 'power2.out' }, 0);
    }

    // Step 6: Golden light beam appearance
    if (goldenLight) {
      tl.fromTo(goldenLight,
        { opacity: 0, scale: 0.4 },
        { opacity: 0.9, scale: 1.2, duration: 1.4, ease: 'power2.out' },
        0.2
      );
    }

    // Step 7, 8, 9, 10: Album flies up from screen bottom with 8-12 deg tilt
    tl.fromTo(album,
      { y: '100vh', rotateZ: 10, scale: 0.7, opacity: 0 },
      { y: 0, rotateZ: -2, scale: 1.0, opacity: 1, duration: 1.2, ease: 'back.out(1.1)' },
      0.4
    );

    // Bookmark sway
    if (bookmark) {
      tl.fromTo(bookmark,
        { rotateZ: -20 },
        { rotateZ: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' },
        1.2
      );
    }

    // Step 11 & 12: Camera moves closer & Cover opens slowly
    if (frontCover) {
      tl.to(album, { scale: 1.05, duration: 0.8, ease: 'power2.inOut' }, 1.4);
      tl.to(frontCover, { rotateY: -160, duration: 1.0, ease: 'power2.inOut' }, 1.5);
    }
  }

  function playCloseSequence(onComplete) {
    const gsap = getGSAP();
    const modal = document.getElementById('memory-book-modal');
    const goldenLight = document.getElementById('album-golden-light');
    const album = document.getElementById('memory-book-album');
    const frontCover = modal ? modal.querySelector('.album-cover-front') : null;
    const bookmark = document.getElementById('album-ribbon-bookmark');
    const dock = document.getElementById('floating-utilities-dock');
    const mainContent = document.getElementById('main-content');

    if (window.AudioEngine && typeof window.AudioEngine.playSound === 'function') {
      window.AudioEngine.playSound('click');
    }

    if (!gsap || !modal || !album) {
      document.body.classList.remove('album-active-blur');
      if (modal) modal.classList.remove('active');
      if (dock) dock.classList.remove('dock-shrunken');
      if (window.AudioEngine && typeof window.AudioEngine.restoreVolume === 'function') {
        window.AudioEngine.restoreVolume(1500);
      }
      if (onComplete) onComplete();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.classList.remove('album-active-blur');
        modal.classList.remove('active');
        if (window.AudioEngine && typeof window.AudioEngine.restoreVolume === 'function') {
          window.AudioEngine.restoreVolume(1500);
        }
        if (onComplete) onComplete();
      }
    });

    // Step 1 & 2: Close cover
    if (frontCover) {
      tl.to(frontCover, { rotateY: 0, duration: 0.7, ease: 'power2.inOut' }, 0);
    }

    // Step 3: Bookmark settles
    if (bookmark) {
      tl.to(bookmark, { y: 10, duration: 0.3, ease: 'power1.out' }, 0.4)
        .to(bookmark, { y: 0, duration: 0.3, ease: 'bounce.out' }, 0.7);
    }

    // Step 4 & 5: Camera zoom out & Album flies down
    tl.to(album, { y: '100vh', rotateZ: 12, scale: 0.7, opacity: 0, duration: 0.9, ease: 'power2.in' }, 0.6);

    // Step 6: Golden light fades
    if (goldenLight) {
      tl.to(goldenLight, { opacity: 0, scale: 0.5, duration: 0.6 }, 0.6);
    }

    // Step 7: Restore background camera zoom
    if (mainContent) {
      tl.to(mainContent, { scale: 1.0, duration: 0.8, ease: 'power2.out' }, 0.6);
    }

    // Step 8: Restore Dock visibility
    if (dock) {
      dock.classList.remove('dock-hidden');
      tl.to(dock, { scale: 1.0, opacity: 1, duration: 0.5 }, 0.8);
    }
  }

  function triggerAutoSuggestEffect(dockEl, tooltipEl) {
    if (!dockEl) return;
    dockEl.classList.add('auto-suggest-glow');
    if (tooltipEl) {
      tooltipEl.textContent = 'Còn một món quà đặc biệt dành cho bạn...';
      tooltipEl.classList.add('visible', 'auto-suggest');
    }
  }

  return {
    playOpenSequence,
    playCloseSequence,
    triggerAutoSuggestEffect
  };
})();
