/* --------------------------------------------------------------------------
   BỨC TÂM THƯ - MAIN APPLICATION ORCHESTRATOR
   -------------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // 1. Initialize Audio Engine
  AudioEngine.init();

  // 2. Initialize Custom Cursor & Canvases
  CustomCursor.init();
  GalaxyEngine.init();
  HeartsEngine.init();
  SakuraEngine.init();
  MeteorEngine.init();
  FireworksEngine.init();
  SmoothScrollEngine.init();

  // 3. Initialize Interactive Components
  CountdownEngine.init();
  GalleryController.init();
  TimelineController.init();
  QuotesEngine.init();
  TypewriterEngine.init();

  // 4. Initialize Floating Utilities Dock & Memory Book Orchestrator
  MemoryBookController.init();

  // 5. Loading Preloader Flow
  LoadingController.init(() => {
    // When loading finishes, start Intro Sequence
    IntroController.init(() => {
      // When Intro finishes, scroll to 3D Galaxy & Envelope view
      SmoothScrollEngine.scrollTo('#galaxy-section');
    });
  });

  // 6. Bind 3D Envelope Click & Unfold Sequence
  const envelopeContainer = document.getElementById('envelope-container');
  const envelope = document.getElementById('envelope');
  const letterModal = document.getElementById('letter-modal');
  const letterCloseBtn = document.getElementById('letter-close-btn');

  if (envelopeContainer && envelope && letterModal) {
    // Hover shake
    envelopeContainer.addEventListener('mouseenter', () => {
      envelopeContainer.classList.add('shake');
    });
    envelopeContainer.addEventListener('animationend', () => {
      envelopeContainer.classList.remove('shake');
    });

    // Envelope Click to Open
    envelopeContainer.addEventListener('click', () => {
      AudioEngine.playSound('open');
      envelope.classList.add('open');

      // Unfold letter paper & zoom full-screen after flap rotation
      setTimeout(() => {
        letterModal.classList.add('active');
        TypewriterEngine.start();
      }, 700);
    });

    // Close Letter Modal
    function closeLetterModal() {
      AudioEngine.playSound('click');
      letterModal.classList.remove('active');
      envelope.classList.remove('open');
    }

    if (letterCloseBtn) {
      letterCloseBtn.addEventListener('click', closeLetterModal);
    }

    // Close on backdrop click (outside paper)
    letterModal.addEventListener('click', (e) => {
      if (e.target === letterModal) {
        closeLetterModal();
      }
    });

    // Priority scroll handling: inside letter paper scrolls letter, outside scrolls webpage
    const paperWrapper = letterModal.querySelector('.letter-paper-wrapper');
    if (paperWrapper) {
      letterModal.addEventListener('wheel', (e) => {
        if (!letterModal.classList.contains('active')) return;

        if (paperWrapper.contains(e.target)) {
          // Inside letter paper: isolate scroll from background page
          e.stopPropagation();
        } else {
          // Outside letter paper (on modal backdrop): scroll background webpage
          window.scrollBy(0, e.deltaY);
        }
      }, { passive: true });
    }
  }

  // 7. Bind Grand Finale Button ("Khám phá món quà cuối cùng")
  const finaleBtn = document.getElementById('finale-btn');
  if (finaleBtn) {
    finaleBtn.addEventListener('click', () => {
      AudioEngine.playSound('ending');
      FireworksEngine.launchSequence();
      MeteorEngine.triggerManual();
    });
  }

  console.log('Bức Tâm Thư - Successfully initialized all cinematic modules.');
});
