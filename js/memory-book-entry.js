/* ==========================================================================
   MEMORY BOOK - ENTRY MODULE (FLOATING UTILITIES DOCK)
   Manages the Floating Utilities Dock (🎵 Audio + 📖 Memory Book Entry)
   ========================================================================== */

const MemoryBookEntry = (function() {
  'use strict';

  let dockElement = null;
  let bookButtonElement = null;
  let tooltipElement = null;
  let openCallback = null;

  function init(options = {}) {
    openCallback = options.onOpen || null;
    createOrUpdateDock();
    bindEntryEvents();
  }

  function createOrUpdateDock() {
    let dock = document.getElementById('floating-utilities-dock');

    if (!dock) {
      dock = document.createElement('div');
      dock.id = 'floating-utilities-dock';
      dock.className = 'floating-utilities-dock';

      // Move existing audio-widget into dock if present, or create unified dock HTML
      const existingAudio = document.getElementById('audio-widget');
      if (existingAudio && existingAudio.parentNode) {
        existingAudio.parentNode.removeChild(existingAudio);
      }

      dock.innerHTML = `
        <!-- Audio Utility Item -->
        <div class="dock-item dock-item-audio" id="dock-audio-item" title="Bật/Tắt Nhạc Nền">
          <button id="audio-widget-btn" class="dock-btn audio-btn" aria-label="Điều khiển Âm thanh" tabindex="0">
            <i id="audio-icon" class="fas fa-music"></i>
          </button>
          <div class="sound-waves">
            <span class="sound-bar"></span>
            <span class="sound-bar"></span>
            <span class="sound-bar"></span>
            <span class="sound-bar"></span>
          </div>
        </div>

        <div class="dock-divider"></div>

        <!-- Memory Book Utility Item -->
        <div class="dock-item dock-item-book" id="dock-book-item">
          <button id="memory-book-entry-btn" class="dock-btn memory-book-btn" aria-label="Mở Album Kỷ Niệm" tabindex="0">
            <span class="book-icon-wrapper">
              <i class="fas fa-book-bookmark book-icon"></i>
              <span class="mini-bookmark-ribbon"></span>
            </span>
          </button>
          
          <!-- Animated Tooltip -->
          <div id="memory-book-tooltip" class="dock-tooltip">
            <span id="tooltip-text">Mở Album Kỷ Niệm</span>
          </div>
        </div>
      `;

      document.body.appendChild(dock);
    }

    dockElement = dock;
    bookButtonElement = document.getElementById('memory-book-entry-btn');
    tooltipElement = document.getElementById('memory-book-tooltip');

    // Setup initial tooltip text if unopened
    if (optionsHasOpened() === false) {
      showInitialTooltip();
    }
  }

  function optionsHasOpened() {
    if (window.MemoryBookStorage && typeof window.MemoryBookStorage.hasOpenedBefore === 'function') {
      return window.MemoryBookStorage.hasOpenedBefore();
    }
    return false;
  }

  function bindEntryEvents() {
    if (bookButtonElement) {
      bookButtonElement.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        triggerOpen();
      });

      bookButtonElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          triggerOpen();
        }
      });
    }

    const audioBtn = document.getElementById('audio-widget-btn');
    if (audioBtn) {
      audioBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.AudioEngine && typeof window.AudioEngine.toggleMute === 'function') {
          window.AudioEngine.toggleMute();
        }
      });
    }
  }

  function triggerOpen() {
    hideTooltip();
    if (openCallback) openCallback();
  }

  function showInitialTooltip() {
    if (!tooltipElement) return;
    const txt = tooltipElement.querySelector('#tooltip-text');
    if (txt) txt.textContent = '✨ Khám phá Album Kỷ Niệm';
    tooltipElement.classList.add('visible', 'first-time');
  }

  function hideTooltip() {
    if (!tooltipElement) return;
    tooltipElement.classList.remove('visible', 'first-time', 'auto-suggest');
  }

  function getDockElement() {
    return dockElement;
  }

  function getTooltipElement() {
    return tooltipElement;
  }

  return {
    init,
    showInitialTooltip,
    hideTooltip,
    getDockElement,
    getTooltipElement
  };
})();
