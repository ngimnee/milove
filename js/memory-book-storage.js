/* --------------------------------------------------------------------------
   MEMORY BOOK - STORAGE MODULE
   Handles persistence of album state (session scoped so closing tab resets to cover page)
   -------------------------------------------------------------------------- */

const MemoryBookStorage = (function() {
  'use strict';

  const STORAGE_KEY_OPENED = 'milove_album_opened';
  const STORAGE_KEY_PAGE   = 'milove_album_last_page';

  // Clean legacy localStorage keys so reopening site starts from cover page
  try {
    localStorage.removeItem(STORAGE_KEY_PAGE);
    localStorage.removeItem(STORAGE_KEY_OPENED);
  } catch (e) {}

  function hasOpenedBefore() {
    try {
      return sessionStorage.getItem(STORAGE_KEY_OPENED) === 'true';
    } catch (e) {
      return false;
    }
  }

  function setOpened() {
    try {
      sessionStorage.setItem(STORAGE_KEY_OPENED, 'true');
    } catch (e) {
      console.warn('SessionStorage not available:', e);
    }
  }

  function getLastPage() {
    try {
      const val = sessionStorage.getItem(STORAGE_KEY_PAGE);
      return val !== null ? parseInt(val, 10) : 0;
    } catch (e) {
      return 0;
    }
  }

  function saveLastPage(pageIndex) {
    try {
      sessionStorage.setItem(STORAGE_KEY_PAGE, String(pageIndex));
    } catch (e) {
      console.warn('SessionStorage write failed:', e);
    }
  }

  return {
    hasOpenedBefore,
    setOpened,
    getLastPage,
    saveLastPage
  };
})();
