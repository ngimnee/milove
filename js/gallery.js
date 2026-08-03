/* --------------------------------------------------------------------------
   LOVE MEMORY GALLERY & LIGHTBOX POPUP CONTROLLER
   Images are loaded asynchronously via ImageProvider.
   Gallery HTML uses data-image-key attributes instead of src paths.
   -------------------------------------------------------------------------- */

const GalleryController = (function() {
  'use strict';

  let lightboxModal, lightboxImg, lightboxTitle, lightboxDesc, closeBtn;

  /**
   * Hydrates all gallery <img> elements by resolving their data-image-key
   * through ImageProvider. Non-blocking — errors are logged silently.
   */
  async function _hydrateGalleryImages() {
    const galleryImgs = document.querySelectorAll('.gallery-img[data-image-key]');

    const tasks = Array.from(galleryImgs).map(async (img) => {
      const key = img.dataset.imageKey;
      if (!key || (img.src && img.src.startsWith('blob:'))) return;

      try {
        const objectUrl = await ImageProvider.get(key);
        img.src = objectUrl;
      } catch (err) {
        console.error(`[Gallery] Failed to load image "${key}":`, err);
      }
    });

    await Promise.all(tasks);
  }

  function init() {
    lightboxModal = document.getElementById('lightbox-modal');
    lightboxImg   = document.getElementById('lightbox-img');
    lightboxTitle = document.getElementById('lightbox-title');
    lightboxDesc  = document.getElementById('lightbox-desc');
    closeBtn      = document.getElementById('lightbox-close');

    if (lightboxModal && lightboxModal.parentNode !== document.body) {
      document.body.appendChild(lightboxModal);
    }

    // Hydrate gallery images via ImageProvider (async, non-blocking)
    _hydrateGalleryImages();

    const cards = document.querySelectorAll('.gallery-card');

    cards.forEach(card => {
      // 3D Card Parallax Tilt Effect
      card.addEventListener('mousemove', (e) => {
        const rect     = card.getBoundingClientRect();
        const x        = e.clientX - rect.left - rect.width / 2;
        const y        = e.clientY - rect.top - rect.height / 2;
        const rotateX  = (-y / rect.height) * 20;
        const rotateY  = (x / rect.width) * 20;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });

      // Lightbox Click Event
      card.addEventListener('click', () => {
        const img   = card.querySelector('.gallery-img');
        const title = card.querySelector('.gallery-card-title');
        const desc  = card.querySelector('.gallery-card-desc');

        if (img && lightboxModal) {
          lightboxImg.src                = img.src;
          lightboxTitle.textContent = title ? title.textContent : '';
          lightboxDesc.textContent  = desc  ? desc.textContent  : '';
          openLightbox();
        }
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', closeLightbox);
    }
    if (lightboxModal) {
      lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal) closeLightbox();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightboxModal && lightboxModal.classList.contains('active')) {
        closeLightbox();
      }
    });
  }

  function openLightbox() {
    if (lightboxModal) {
      lightboxModal.classList.add('active');
      document.body.classList.add('lightbox-active');
      if (window.AudioEngine && typeof window.AudioEngine.playSound === 'function') {
        window.AudioEngine.playSound('open');
      }
    }
  }

  function closeLightbox() {
    if (lightboxModal) {
      lightboxModal.classList.remove('active');
      document.body.classList.remove('lightbox-active');
    }
  }

  return {
    init
  };
})();
