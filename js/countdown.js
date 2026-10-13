/* --------------------------------------------------------------------------
   LIVE REAL-TIME LOVE RELATIONSHIP COUNTER
   -------------------------------------------------------------------------- */

const CountdownEngine = (function() {
  'use strict';

  // Configurable Love Start Date (YYYY-MM-DD THH:mm:ss)
  const START_DATE = new Date('2026-05-08T00:00:00');

  let daysEl, hoursEl, minsEl, secsEl;

  function init() {
    daysEl = document.getElementById('count-days');
    hoursEl = document.getElementById('count-hours');
    minsEl = document.getElementById('count-mins');
    secsEl = document.getElementById('count-secs');

    if (!daysEl) return;

    updateCounter();
    setInterval(updateCounter, 1000);
  }

  function updateCounter() {
    const now = new Date();
    const diffMs = Math.max(0, now - START_DATE);

    const secondsTotal = Math.floor(diffMs / 1000);
    const minutesTotal = Math.floor(secondsTotal / 60);
    const hoursTotal = Math.floor(minutesTotal / 60);

    const days = Math.floor(hoursTotal / 24);
    const hours = hoursTotal % 24;
    const mins = minutesTotal % 60;
    const secs = secondsTotal % 60;

    if (daysEl) daysEl.textContent = formatNumber(days);
    if (hoursEl) hoursEl.textContent = formatNumber(hours);
    if (minsEl) minsEl.textContent = formatNumber(mins);
    if (secsEl) secsEl.textContent = formatNumber(secs);
  }

  function formatNumber(num) {
    return num < 10 ? `0${num}` : `${num}`;
  }

  // Shared with the special-days anniversary so the love date lives in one place
  function getStartDate() {
    return new Date(START_DATE.getTime());
  }

  return {
    init,
    getStartDate
  };
})();
