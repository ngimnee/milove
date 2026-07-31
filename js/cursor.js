/* ==========================================================================
   CUSTOM GLOWING CURSOR & CLICK RIPPLE TRAIL
   ========================================================================== */

const CustomCursor = (function() {
  'use strict';

  let cursorDot = null;
  let cursorFollower = null;
  let mouseX = -100;
  let mouseY = -100;
  let followerX = -100;
  let followerY = -100;

  function init() {
    cursorDot = document.getElementById('custom-cursor');
    cursorFollower = document.getElementById('custom-cursor-follower');

    if (!cursorDot || !cursorFollower) return;

    // Track Mouse Position
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    // Smooth Follower Animation Loop
    function renderFollower() {
      followerX += (mouseX - followerX) * 0.15;
      followerY += (mouseY - followerY) * 0.15;
      cursorFollower.style.left = `${followerX}px`;
      cursorFollower.style.top = `${followerY}px`;
      requestAnimationFrame(renderFollower);
    }
    renderFollower();

    // Click Ripple Effect
    window.addEventListener('click', (e) => {
      createRipple(e.clientX, e.clientY);
      AudioEngine.playSound('click');
    });

    // Detect Hover Elements
    const hoverTargets = 'a, button, .btn-romantic, .envelope-container, .gallery-card, .time-card, .quote-card, .control-btn';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverTargets)) {
        document.body.classList.add('cursor-hover');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverTargets)) {
        document.body.classList.remove('cursor-hover');
      }
    });
  }

  function createRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'cursor-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    document.body.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  return {
    init,
    createRipple
  };
})();
