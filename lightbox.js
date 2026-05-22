/**
 * 18K Nail Boutique — Luxury Lightbox
 * Self-contained lightbox/modal for gallery images.
 * Supports keyboard navigation, touch swipe, and overlay close.
 */
(function () {
  'use strict';

  // ── Inject CSS ──────────────────────────────────────────────
  var css = document.createElement('style');
  css.textContent = [
    /* Overlay */
    '.lbx-overlay {',
    '  position: fixed; inset: 0; z-index: 10000;',
    '  background: rgba(26, 23, 20, 0.95);',
    '  display: flex; align-items: center; justify-content: center;',
    '  opacity: 0; visibility: hidden;',
    '  transition: opacity 0.3s ease, visibility 0.3s ease;',
    '  -webkit-tap-highlight-color: transparent;',
    '}',
    '.lbx-overlay.lbx-open {',
    '  opacity: 1; visibility: visible;',
    '}',

    /* Image */
    '.lbx-img {',
    '  max-width: 88vw; max-height: 85vh;',
    '  object-fit: contain; display: block;',
    '  border: 1px solid rgba(184, 150, 78, 0.25);',
    '  box-shadow: 0 20px 80px rgba(0, 0, 0, 0.6);',
    '  opacity: 0; transform: scale(0.96);',
    '  transition: opacity 0.3s ease, transform 0.3s ease;',
    '  user-select: none; -webkit-user-drag: none;',
    '}',
    '.lbx-overlay.lbx-open .lbx-img {',
    '  opacity: 1; transform: scale(1);',
    '}',

    /* Close button */
    '.lbx-close {',
    '  position: absolute; top: 20px; right: 24px;',
    '  background: none; border: none; cursor: pointer;',
    '  color: #B8964E; font-size: 2.2rem; line-height: 1;',
    '  font-family: sans-serif; font-weight: 300;',
    '  transition: color 0.3s ease, transform 0.3s ease;',
    '  z-index: 10001; padding: 4px 8px;',
    '}',
    '.lbx-close:hover { color: #D4BC8B; transform: scale(1.15); }',

    /* Arrow buttons */
    '.lbx-arrow {',
    '  position: absolute; top: 50%; transform: translateY(-50%);',
    '  background: none; border: 1px solid rgba(184, 150, 78, 0.3);',
    '  color: #B8964E; font-size: 1.4rem; cursor: pointer;',
    '  width: 48px; height: 48px; border-radius: 50%;',
    '  display: flex; align-items: center; justify-content: center;',
    '  transition: background 0.3s ease, border-color 0.3s ease, color 0.3s ease;',
    '  z-index: 10001; font-family: sans-serif;',
    '}',
    '.lbx-arrow:hover {',
    '  background: rgba(184, 150, 78, 0.15);',
    '  border-color: #B8964E; color: #D4BC8B;',
    '}',
    '.lbx-prev { left: 20px; }',
    '.lbx-next { right: 20px; }',

    /* Counter */
    '.lbx-counter {',
    '  position: absolute; bottom: 20px; left: 50%;',
    '  transform: translateX(-50%);',
    '  font-family: "Outfit", sans-serif;',
    '  font-size: 0.7rem; font-weight: 300;',
    '  letter-spacing: 0.2em; color: rgba(184, 150, 78, 0.5);',
    '}',

    /* Hide arrows when only one image */
    '.lbx-single .lbx-arrow { display: none; }',
    '.lbx-single .lbx-counter { display: none; }',

    /* Mobile adjustments */
    '@media (max-width: 768px) {',
    '  .lbx-img { max-width: 95vw; max-height: 80vh; }',
    '  .lbx-close { top: 12px; right: 14px; font-size: 1.8rem; }',
    '  .lbx-arrow { width: 38px; height: 38px; font-size: 1.1rem; }',
    '  .lbx-prev { left: 10px; }',
    '  .lbx-next { right: 10px; }',
    '}'
  ].join('\n');
  document.head.appendChild(css);

  // ── Build DOM ───────────────────────────────────────────────
  var overlay = document.createElement('div');
  overlay.className = 'lbx-overlay';
  overlay.innerHTML = [
    '<button class="lbx-close" aria-label="Close">&times;</button>',
    '<button class="lbx-arrow lbx-prev" aria-label="Previous">&larr;</button>',
    '<img class="lbx-img" src="" alt="">',
    '<button class="lbx-arrow lbx-next" aria-label="Next">&rarr;</button>',
    '<span class="lbx-counter"></span>'
  ].join('');
  document.body.appendChild(overlay);

  var imgEl = overlay.querySelector('.lbx-img');
  var counterEl = overlay.querySelector('.lbx-counter');
  var closeBtn = overlay.querySelector('.lbx-close');
  var prevBtn = overlay.querySelector('.lbx-prev');
  var nextBtn = overlay.querySelector('.lbx-next');

  var images = [];   // current gallery image elements
  var current = 0;

  // ── Helpers ─────────────────────────────────────────────────
  function collectGalleryImages(clickedImg) {
    // Find the closest gallery container
    var container =
      clickedImg.closest('.gallery-grid') ||
      clickedImg.closest('.masonry-grid') ||
      clickedImg.closest('.gallery-wrap') ||
      clickedImg.closest('.gallery-masonry') ||
      clickedImg.closest('.home-gallery') ||
      clickedImg.closest('.page.active') ||
      clickedImg.closest('body');

    var selector = '.gallery-item img, .masonry-item img, .g-item img';
    var all = container.querySelectorAll(selector);
    return Array.prototype.slice.call(all);
  }

  function show(index) {
    if (index < 0) index = images.length - 1;
    if (index >= images.length) index = 0;
    current = index;
    var src = images[current].src;
    var alt = images[current].alt || '';

    // Brief fade for image swap
    imgEl.style.opacity = '0';
    imgEl.style.transform = 'scale(0.96)';
    setTimeout(function () {
      imgEl.src = src;
      imgEl.alt = alt;
      imgEl.style.opacity = '1';
      imgEl.style.transform = 'scale(1)';
    }, 150);

    counterEl.textContent = (current + 1) + ' / ' + images.length;
  }

  function open(clickedImg) {
    images = collectGalleryImages(clickedImg);
    current = images.indexOf(clickedImg);
    if (current === -1) current = 0;

    overlay.classList.toggle('lbx-single', images.length <= 1);

    imgEl.src = clickedImg.src;
    imgEl.alt = clickedImg.alt || '';
    counterEl.textContent = (current + 1) + ' / ' + images.length;

    // Force reflow then open
    overlay.offsetHeight; // eslint-disable-line no-unused-expressions
    overlay.classList.add('lbx-open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    overlay.classList.remove('lbx-open');
    document.body.style.overflow = '';
    // Reset image after transition
    setTimeout(function () {
      imgEl.src = '';
      imgEl.alt = '';
    }, 300);
  }

  function prev() { show(current - 1); }
  function next() { show(current + 1); }

  // ── Event listeners ─────────────────────────────────────────
  // Click delegation for gallery images
  document.addEventListener('click', function (e) {
    var img = e.target;
    if (img.tagName !== 'IMG') return;
    var match =
      img.closest('.gallery-item') ||
      img.closest('.masonry-item') ||
      img.closest('.g-item');
    if (!match) return;
    e.preventDefault();
    e.stopPropagation();
    open(img);
  });

  closeBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    close();
  });
  prevBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    prev();
  });
  nextBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    next();
  });

  // Click on overlay (outside image) closes
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
  });

  // Keyboard
  document.addEventListener('keydown', function (e) {
    if (!overlay.classList.contains('lbx-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  // ── Touch swipe ─────────────────────────────────────────────
  var touchStartX = 0;
  var touchStartY = 0;
  var touchDeltaX = 0;

  overlay.addEventListener('touchstart', function (e) {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchDeltaX = 0;
    }
  }, { passive: true });

  overlay.addEventListener('touchmove', function (e) {
    if (e.touches.length === 1) {
      touchDeltaX = e.touches[0].clientX - touchStartX;
      var deltaY = Math.abs(e.touches[0].clientY - touchStartY);
      // Prevent page scroll when swiping horizontally
      if (Math.abs(touchDeltaX) > deltaY) {
        e.preventDefault();
      }
    }
  }, { passive: false });

  overlay.addEventListener('touchend', function () {
    var threshold = 50;
    if (touchDeltaX > threshold) {
      prev();
    } else if (touchDeltaX < -threshold) {
      next();
    }
    touchDeltaX = 0;
  }, { passive: true });

})();
