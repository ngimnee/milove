/* --------------------------------------------------------------------------
   MEMORY BOOK - STORAGE MODULE
   Handles persistence of album state (first-time open, active page)
   -------------------------------------------------------------------------- */

const MemoryBookStorage = (function() {
  'use strict';

  const STORAGE_KEY_OPENED = 'milove_album_opened';
  const STORAGE_KEY_PAGE = 'milove_album_last_page';

  function hasOpenedBefore() {
    try {
      return localStorage.getItem(STORAGE_KEY_OPENED) === 'true';
    } catch (e) {
      return false;
    }
  }

  function setOpened() {
    try {
      localStorage.setItem(STORAGE_KEY_OPENED, 'true');
    } catch (e) {
      console.warn('LocalStorage not available:', e);
    }
  }

  function getLastPage() {
    try {
      const val = localStorage.getItem(STORAGE_KEY_PAGE);
      return val !== null ? parseInt(val, 10) : 0;
    } catch (e) {
      return 0;
    }
  }

  function saveLastPage(pageIndex) {
    try {
      localStorage.setItem(STORAGE_KEY_PAGE, String(pageIndex));
    } catch (e) {
      console.warn('LocalStorage write failed:', e);
    }
  }

  return {
    hasOpenedBefore,
    setOpened,
    getLastPage,
    saveLastPage
  };
})();
