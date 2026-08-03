/* --------------------------------------------------------------------------
   MEMORY BOOK - RENDERER MODULE
   Dynamic DOM creation for the 3D Leather Album & Smart Image Preloading.
   Images are served via ImageProvider — renderer has NO knowledge of
   encryption, decryption, or image storage format.
   -------------------------------------------------------------------------- */

const MemoryBookRenderer = (function() {
  'use strict';

  // Album Data Pages Definition (Including Cover Front & Cover Back)
  // `image` field uses ImageData keys — not file paths.
  const PAGES_DATA = [
    {
      type: 'cover-front',
      title: 'MiLove',
      subtitle: 'Album Kỷ Niệm Tình Yêu',
      date: 'Bìa Trước',
      description: 'Chạm nút tiếp theo để mở trang đầu tiên'
    },
    {
      type: 'intro',
      title: 'Chào mừng em đến với Album Kỷ Niệm',
      subtitle: 'Tất cả những điều ngọt ngào nhất dành cho em',
      image: 'anh-va-em-chibi',
      date: 'MiLove Special',
      description: 'Quyển album này được làm ra chỉ để lưu giữ những khoảnh khắc đẹp nhất khi anh có em trong đời. Cảm ơn em đã xuất hiện và làm thế giới của anh trở nên rạng rỡ.'
    },
    {
      type: 'memory',
      title: 'Khoảnh Khắc Đầu Tiên',
      date: '17 Tháng 03',
      image: 'khoanh-khac-dau-tien',
      description: 'Ngày kỳ diệu khi ánh mắt chúng ta chạm nhau, mở đầu cho một hành trình dịu dàng và ấm áp.'
    },
    {
      type: 'memory',
      title: 'Hồ Tây Với Em',
      date: '25 Tháng 03',
      image: 'ho-tay-voi-em',
      description: 'Cùng nhau rảo bước qua từng con phố quen, ngắm hoàng hôn rực rỡ và trao nhau những nụ cười rộn rã.'
    },
    {
      type: 'memory',
      title: 'Bó Hoa Đầu Tiên Tặng Em',
      date: '05 Tháng 04',
      image: 'bo-hoa-dau-tien',
      description: 'Trao em đóa hoa tươi thắm cùng tất cả sự nâng niu, trân trọng và dịu dàng nhất từ trái tim anh.'
    },
    {
      type: 'memory',
      title: 'Date Cùng Thái Bình',
      date: '30 Tháng 04',
      image: 'date-cung-thai-binh',
      description: 'Hành trình bình yên về lại mảnh đất thân thương của cả hai chúng ta, lưu giữ bao tiếng cười và ký ức ngọt ngào.'
    },
    {
      type: 'memory',
      title: 'Lời Tỏ Tình Chân Thành',
      date: '08 Tháng 05',
      image: 'bo-hoa-to-tinh',
      description: 'Dưới bầu trời đêm đầy sao cùng bó sophia chân thành, khoảnh khắc anh lấy hết can đảm trao em trái tim này.'
    },
    {
      type: 'memory',
      title: 'Cafe & Nặn Đất Sét',
      date: '19 Tháng 07',
      image: 'cafe-dat-set',
      description: 'Góc nhỏ bình yên bên tách cafe thơm, cùng em tỉ mỉ nhào nặn nên những hình khối dễ thương đong đầy tình yêu.'
    },
    {
      type: 'finale',
      title: 'Lời Hứa Cho Tương Lai',
      date: 'Mãi Mãi Về Sau',
      image: 'anh-va-em-chibi',
      description: 'Cảm ơn em vì đã là một phần tuyệt vời nhất trong cuộc đời anh. Anh hứa sẽ luôn bên cạnh, yêu thương và nắm chặt tay em qua mọi năm tháng.'
    },
    {
      type: 'cover-back',
      title: 'Trái Tim Anh Luôn Có Em',
      subtitle: 'Cảm Ơn Em Vì Tất Cả',
      date: 'Bìa Sau',
      description: 'MiLove &bull; Written with endless love'
    }
  ];

  // ── Image Preloading ────────────────────────────────────────────────────

  /**
   * Preloads images for the current page and adjacent pages.
   * Delegates entirely to ImageProvider — no crypto logic here.
   * @param {number} currentIndex
   */
  function preloadImagesAround(currentIndex) {
    const total = PAGES_DATA.length;
    const indicesToLoad = [
      currentIndex,
      (currentIndex + 1) % total,
      (currentIndex + 2) % total,
      (currentIndex - 1 + total) % total,
      (currentIndex - 2 + total) % total,
    ];

    const keysToPreload = indicesToLoad
      .map(idx => PAGES_DATA[idx])
      .filter(page => page && page.image)
      .map(page => page.image);

    // Non-blocking preload — errors are handled inside ImageProvider
    ImageProvider.preload(keysToPreload);
  }

  /**
   * Resolves the ObjectURL for a page's image and sets it on the <img>.
   * Called lazily when a page becomes visible (not during HTML generation).
   * @param {number} pageIndex
   */
  async function _hydratePageImage(pageIndex) {
    const page = PAGES_DATA[pageIndex];
    if (!page || !page.image) return;

    // Find the <img> placeholder for this page
    const pageNode = document.querySelector(`[data-page-index="${pageIndex}"]`);
    if (!pageNode) return;

    const img = pageNode.querySelector('.page-photo');
    if (!img) return;

    // Already hydrated — skip
    if (img.src && img.src.startsWith('blob:')) return;

    try {
      const objectUrl = await ImageProvider.get(page.image);
      img.src = objectUrl;
    } catch (err) {
      console.error(`[Renderer] Failed to load image "${page.image}":`, err);
    }
  }

  /** Hydrates all page images in parallel immediately upon render */
  function _hydrateAllPageImages() {
    PAGES_DATA.forEach((page, idx) => {
      if (page && page.image) {
        _hydratePageImage(idx);
      }
    });
  }

  // ── DOM Rendering ───────────────────────────────────────────────────────

  /** Renders the modal & album structure into DOM */
  function renderAlbum() {
    if (document.getElementById('memory-book-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'memory-book-modal';
    modal.className = 'memory-book-modal';

    modal.innerHTML = `
      <div id="album-golden-light" class="album-golden-light"></div>
      
      <button id="memory-book-close-btn" class="album-close-btn" aria-label="Đóng Album Kỷ Niệm" tabindex="0">
        <i class="fas fa-times"></i>
      </button>

      <div class="album-stage">
        <div class="album-3d-wrapper">
          <div id="memory-book-album" class="album-book">
            
            <!-- Leather Front Cover Overlay -->
            <div class="album-cover album-cover-front">
              <div class="cover-gold-border">
                <div class="cover-content">
                  <div class="cover-emblem"><i class="fas fa-heart"></i></div>
                  <h2 class="cover-title">MiLove</h2>
                  <p class="cover-subtitle">Album Kỷ Niệm Tình Yêu</p>
                  <div class="cover-badge">Dành Riêng Cho Em</div>
                </div>
              </div>
              <!-- Ribbed Bookmark -->
              <div class="album-bookmark" id="album-ribbon-bookmark">
                <span class="bookmark-ribbon"></span>
                <i class="fas fa-bookmark bookmark-icon"></i>
              </div>
            </div>

            <!-- Inside Pages Container: perspective wrapper outside overflow:hidden -->
            <div class="album-pages-perspective">
              <div class="album-pages-container" id="album-pages-container">
                ${_renderPagesHTML()}
              </div>
            </div>

            <!-- Back Cover Overlay -->
            <div class="album-cover album-cover-back">
              <div class="cover-gold-border"></div>
            </div>
          </div>
        </div>

        <!-- Combined Navigation Pill (Placed below book with safe margin) -->
        <div class="album-controls">
          <button id="album-prev-btn" class="album-nav-btn prev" aria-label="Trang trước" tabindex="0">
            <i class="fas fa-chevron-left"></i>
          </button>
          <div id="album-page-indicator" class="album-page-indicator">Trang Bìa</div>
          <button id="album-next-btn" class="album-nav-btn next" aria-label="Trang tiếp theo" tabindex="0">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    _hydrateAllPageImages();
  }

  /**
   * Generates static HTML for all pages.
   * Uses transparent SVG data URIs to avoid browser broken-image icons.
   */
  function _renderPagesHTML() {
    return PAGES_DATA.map((page, index) => {
      const activeClass = index === 0 ? 'active' : '';

      if (page.type === 'cover-front') {
        return `
          <div class="album-page page-type-cover-front ${activeClass}" data-page-index="${index}">
            <div class="page-cover-paper">
              <div class="cover-gold-border">
                <div class="cover-content">
                  <div class="cover-emblem"><i class="fas fa-heart"></i></div>
                  <h2 class="cover-title">MiLove</h2>
                  <p class="cover-subtitle">Album Kỷ Niệm Tình Yêu</p>
                  <div class="cover-badge">Dành Riêng Cho Em</div>
                  <p class="cover-hint-text"><i class="fas fa-hand-pointer"></i> Bấm nút tiếp tục bên phải để lật trang</p>
                </div>
              </div>
            </div>
          </div>
        `;
      }

      if (page.type === 'cover-back') {
        return `
          <div class="album-page page-type-cover-back ${activeClass}" data-page-index="${index}">
            <div class="page-cover-paper">
              <div class="cover-gold-border">
                <div class="cover-content">
                  <div class="cover-emblem"><i class="fas fa-infinity"></i></div>
                  <h2 class="cover-title">${page.title}</h2>
                  <p class="cover-subtitle">${page.subtitle}</p>
                  <p class="cover-desc-text">${page.description}</p>
                  <div class="cover-badge">Bìa Sau Album</div>
                </div>
              </div>
            </div>
          </div>
        `;
      }

      // Content pages: transparent SVG placeholder prevents browser broken-image icon
      return `
        <div class="album-page ${activeClass}" data-page-index="${index}">
          <div class="page-paper">
            <div class="page-header">
              <span class="page-date"><i class="far fa-calendar-alt"></i> ${page.date}</span>
              <h3 class="page-title">${page.title}</h3>
            </div>
            <div class="page-photo-frame">
              <div class="photo-tape top-left"></div>
              <div class="photo-tape top-right"></div>
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E" alt="${page.title}" class="page-photo" data-image-key="${page.image}">
            </div>
            <div class="page-body">
              <p class="page-desc">${page.description}</p>
            </div>
            <div class="page-footer">
              <span class="page-number">- ${index} / ${PAGES_DATA.length - 2} -</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ── Page Display & Hydration ────────────────────────────────────────────

  function updatePageDisplay(currentIndex, totalPages) {
    const pageNodes = document.querySelectorAll('.album-page');
    pageNodes.forEach((node, idx) => {
      if (idx === currentIndex) {
        node.classList.add('active');
        node.classList.remove('turned-prev', 'turned-next');
      } else if (idx < currentIndex) {
        node.classList.remove('active');
        node.classList.add('turned-prev');
        node.classList.remove('turned-next');
      } else {
        node.classList.remove('active');
        node.classList.add('turned-next');
        node.classList.remove('turned-prev');
      }
    });

    const indicator = document.getElementById('album-page-indicator');
    if (indicator) {
      const pageData = PAGES_DATA[currentIndex];
      const totalContentPages = totalPages - 2;

      if (pageData && pageData.type === 'cover-front') {
        indicator.textContent = 'Trang Bìa';
      } else if (pageData && pageData.type === 'cover-back') {
        indicator.textContent = 'Trang Kết';
      } else {
        indicator.textContent = `Trang ${currentIndex} / ${totalContentPages}`;
      }
    }

    // Hydrate current page image immediately, then preload adjacent
    _hydratePageImage(currentIndex);
    preloadImagesAround(currentIndex);
  }

  return {
    renderAlbum,
    updatePageDisplay,
    preloadImagesAround,
    getPagesCount: () => PAGES_DATA.length
  };
})();
