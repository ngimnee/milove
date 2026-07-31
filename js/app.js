/* ==========================================================================
   BỨC TÂM THƯ - MAIN APPLICATION ORCHESTRATOR
   ========================================================================== */

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

  // 4. Bind Floating Audio Widget Button
  const audioWidgetBtn = document.getElementById('audio-widget-btn');
  if (audioWidgetBtn) {
    audioWidgetBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      AudioEngine.toggleMute();
    });
  }

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
    if (letterCloseBtn) {
      letterCloseBtn.addEventListener('click', () => {
        AudioEngine.playSound('click');
        letterModal.classList.remove('active');
        envelope.classList.remove('open');
      });
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
