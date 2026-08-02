/* --------------------------------------------------------------------------
   MEMORY BOOK - STATE MODULE
   Manages internal runtime state for the album experience
   -------------------------------------------------------------------------- */

const MemoryBookState = (function() {
  'use strict';

  const state = {
    isOpen: false,
    isAnimating: false,
    currentPage: 0,
    totalPages: 8,
    isRendered: false,
    autoSuggestTriggered: false
  };

  function isOpen() {
    return state.isOpen;
  }

  function setOpen(val) {
    state.isOpen = Boolean(val);
  }

  function isAnimating() {
    return state.isAnimating;
  }

  function setAnimating(val) {
    state.isAnimating = Boolean(val);
  }

  function getCurrentPage() {
    return state.currentPage;
  }

  function setCurrentPage(val) {
    if (typeof val === 'number' && val >= 0 && val < state.totalPages) {
      state.currentPage = val;
    }
  }

  function getTotalPages() {
    return state.totalPages;
  }

  function setTotalPages(val) {
    if (typeof val === 'number' && val > 0) {
      state.totalPages = val;
    }
  }

  function isRendered() {
    return state.isRendered;
  }

  function setRendered(val) {
    state.isRendered = Boolean(val);
  }

  function isAutoSuggestTriggered() {
    return state.autoSuggestTriggered;
  }

  function setAutoSuggestTriggered(val) {
    state.autoSuggestTriggered = Boolean(val);
  }

  return {
    isOpen,
    setOpen,
    isAnimating,
    setAnimating,
    getCurrentPage,
    setCurrentPage,
    getTotalPages,
    setTotalPages,
    isRendered,
    setRendered,
    isAutoSuggestTriggered,
    setAutoSuggestTriggered
  };
})();
