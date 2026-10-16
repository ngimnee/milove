/* --------------------------------------------------------------------------
   LOADING SCREEN & PRELOADER CONTROLLER
   The percentage follows real work: the photos the first screen needs (on a
   special day, that day's photos), counted as each one finishes. While one is
   still downloading the bar inches toward the next step, so it never looks
   frozen. The screen always stays a moment (it is part of the show) and never
   longer than MAX_WAIT_MS: on a slow connection late photos fade in by themselves.
   -------------------------------------------------------------------------- */

const LoadingController = (function() {
  'use strict';

  const MIN_DURATION_MS = 1000;
  const MAX_WAIT_MS = 20000;
  const TICK_MS = 80;
  const CATCH_UP = 0.35;       // share of the gap to the real progress closed each tick
  const CREEP_MS = 4000;       // pace of the inching toward the next step
  const CREEP_MAX = 0.9;       // ...which never reaches it on its own
  const HOLD_AT_FULL_MS = 500;
  const FADE_OUT_MS = 1200;

  let percentText = null;
  let progressBarFill = null;
  let loadingScreen = null;

  /**
   * @param {Function} onCompleteCallback runs once the screen has faded out
   * @param {Promise[]} [tasks] work the first screen needs; a rejected task counts as finished
   */
  function init(onCompleteCallback, tasks = []) {
    percentText = document.getElementById('loading-percent');
    progressBarFill = document.getElementById('progress-bar-fill');
    loadingScreen = document.getElementById('loading-screen');

    if (!loadingScreen) {
      if (typeof onCompleteCallback === 'function') onCompleteCallback();
      return;
    }

    const total = tasks.length;
    let settled = 0;
    let lastSettledAt = performance.now();
    tasks.forEach(task => {
      Promise.resolve(task).catch(() => {}).then(() => {
        settled++;
        lastSettledAt = performance.now();
      });
    });

    const startedAt = performance.now();
    let shown = 0;

    const interval = setInterval(() => {
      const now = performance.now();
      const elapsed = now - startedAt;
      const timeShare = Math.min(1, elapsed / MIN_DURATION_MS);
      const workDone = settled >= total || elapsed >= MAX_WAIT_MS;
      const creep = CREEP_MAX * (1 - Math.exp(-(now - lastSettledAt) / CREEP_MS));
      const workShare = workDone ? 1 : (settled + creep) / total;
      const target = Math.min(timeShare, workShare) * 100;

      shown += (target - shown) * CATCH_UP;
      if (workDone && timeShare >= 1 && target - shown < 1) shown = 100;
      updateUI(Math.floor(shown));

      if (shown >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          dismissLoader(onCompleteCallback);
        }, HOLD_AT_FULL_MS);
      }
    }, TICK_MS);
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
      }, FADE_OUT_MS);
    }
  }

  return {
    init
  };
})();
