/* --------------------------------------------------------------------------
   BỨC TÂM THƯ - MAIN APPLICATION ORCHESTRATOR
   -------------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // One module failing (no WebGL, an old browser, a blocked CDN) must never keep
  // the loading screen up or the letter from opening: it is logged and skipped.
  function safely(name, start, fallback) {
    try {
      return start();
    } catch (err) {
      console.error(`[App] ${name} could not start:`, err);
      return fallback;
    }
  }

  // 1. Initialize Audio Engine
  safely('AudioEngine', () => AudioEngine.init());

  // 2. Initialize Custom Cursor & Canvases
  safely('CustomCursor', () => CustomCursor.init());
  safely('GalaxyEngine', () => GalaxyEngine.init());
  safely('HeartsEngine', () => HeartsEngine.init());
  safely('SakuraEngine', () => SakuraEngine.init());
  safely('MeteorEngine', () => MeteorEngine.init());
  safely('FireworksEngine', () => FireworksEngine.init());
  safely('SmoothScrollEngine', () => SmoothScrollEngine.init());

  // 3. Initialize Interactive Components
  safely('CountdownEngine', () => CountdownEngine.init());
  safely('GalleryController', () => GalleryController.init());
  safely('TimelineController', () => TimelineController.init());
  safely('QuotesEngine', () => QuotesEngine.init());
  safely('TypewriterEngine', () => TypewriterEngine.init());

  // 4. Initialize Floating Utilities Dock & Memory Book Orchestrator
  safely('MemoryBookController', () => MemoryBookController.init());

  // 4a. Share button in the ending section (QR card, copy link, native share sheet)
  safely('ShareController', () => ShareController.init());

  // 4b. Detect today's special day now; the loading screen waits for its photos
  const criticalLoads = safely('SpecialEventsController', () => SpecialEventsController.init(), []);

  // 4c. Then, in the background, the photos for later: the gallery first (it comes first
  //     on the page), then the album. Started after, so they never slow the loader down.
  Promise.allSettled(criticalLoads).then(() => {
    safely('Gallery photos', () => GalleryController.hydrateImages());
    safely('Album photos', () => ImageProvider.preload(MemoryBookRenderer.getImageKeys()));
  });

  // 5. Loading Preloader Flow
  let introStarted = false;
  function startIntro() {
    if (introStarted) return;
    introStarted = true;
    safely('IntroController', () => IntroController.init(() => {
      // When Intro finishes, scroll to 3D Galaxy & Envelope view
      SmoothScrollEngine.scrollTo('#galaxy-section');
    }));
  }

  LoadingController.init(() => {
    // On a special day its one-day chapter opens first (its seal tap also unlocks audio);
    // on normal days this continues straight to the Intro Sequence.
    safely('SpecialEventsController', () => SpecialEventsController.start(startIntro));
    // Should the special day have failed before handing over, the intro still follows
    if (!introStarted && !document.getElementById('special-event')) startIntro();
  }, criticalLoads);

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
        // The letter's backdrop is nearly opaque: the background effects can rest meanwhile
        AmbientLoop.hold('letter');
        TypewriterEngine.start();
      }, 700);
    });

    // Close Letter Modal
    function closeLetterModal() {
      AudioEngine.playSound('click');
      TypewriterEngine.stop();
      letterModal.classList.remove('active');
      envelope.classList.remove('open');
      AmbientLoop.release('letter');
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
      FireworksEngine.launchSequence();
      MeteorEngine.triggerManual();
    });
  }

  console.log('Bức Tâm Thư - Successfully initialized all cinematic modules.');
});
