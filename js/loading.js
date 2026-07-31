/* ==========================================================================
   LOADING SCREEN & PRELOADER CONTROLLER
   ========================================================================== */

const LoadingController = (function() {
  'use strict';

  let percentText = null;
  let progressBarFill = null;
  let loadingScreen = null;
  let currentProgress = 0;

  function init(onCompleteCallback) {
    percentText = document.getElementById('loading-percent');
    progressBarFill = document.getElementById('progress-bar-fill');
    loadingScreen = document.getElementById('loading-screen');

    if (!loadingScreen) return;

    // Simulate smooth progress loader up to 100%
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 8) + 4;
      if (currentProgress > 100) currentProgress = 100;

      updateUI(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          dismissLoader(onCompleteCallback);
        }, 500);
      }
    }, 80);
  }

  function updateUI(percent) {
    if (percentText) percentText.textContent = `${percent}%`;
    if (progressBarFill) progressBarFill.style.width = `${percent}%`;
  }

  function dismissLoader(onComplete) {
    if (loadingScreen) {
      loadingScreen.classList.add('fade-out');
      setTimeout(() => {
        loadingScreen.style.display = 'none';
        if (typeof onComplete === 'function') {
          onComplete();
        }
      }, 1200);
    }
  }

  return {
    init
  };
})();
