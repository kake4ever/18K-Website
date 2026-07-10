/**
 * 18K Nail Boutique — Video Showcase
 * Lazy-loaded muted autoplay reels with tap-to-fullscreen lightbox.
 *
 * - Videos load only when the reel scrolls into view (IntersectionObserver)
 * - Autoplay muted, loop, playsinline for mobile compatibility
 * - Pause when scrolled out of view to save battery / bandwidth
 * - Tap opens a fullscreen lightbox with UNMUTED audio
 * - Respects prefers-reduced-motion (shows first-frame poster only)
 */
(function () {
  'use strict';

  const REELS = document.querySelectorAll('.video-reel');
  if (!REELS.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Inject styles
  const styles = `
    .k18-video-lightbox{position:fixed;inset:0;background:rgba(10,9,8,0.96);z-index:10000;display:none;align-items:center;justify-content:center;padding:24px;}
    .k18-video-lightbox.open{display:flex;animation:k18vlFade 0.3s ease;}
    @keyframes k18vlFade{from{opacity:0;}to{opacity:1;}}
    .k18-video-lightbox video{max-width:min(500px,92vw);max-height:90vh;aspect-ratio:9/16;object-fit:cover;background:#000;border:1px solid rgba(197,160,87,0.3);box-shadow:0 20px 60px rgba(0,0,0,0.7);}
    .k18-video-lightbox-close{position:absolute;top:24px;right:24px;background:transparent;border:1px solid rgba(197,160,87,0.5);color:#C5A057;width:44px;height:44px;border-radius:50%;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.3s;font-family:'Outfit',sans-serif;}
    .k18-video-lightbox-close:hover{background:#C5A057;color:#0A0908;}
    .k18-video-lightbox-hint{position:absolute;bottom:32px;left:50%;transform:translateX(-50%);font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(197,160,87,0.6);font-family:'Outfit',sans-serif;}
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  // Build lightbox once, reuse
  const lightbox = document.createElement('div');
  lightbox.className = 'k18-video-lightbox';
  lightbox.innerHTML = `
    <button class="k18-video-lightbox-close" aria-label="Close video">&times;</button>
    <video controls playsinline preload="none"></video>
    <div class="k18-video-lightbox-hint">Tap outside to close</div>
  `;
  document.body.appendChild(lightbox);
  const lightboxVideo = lightbox.querySelector('video');
  const lightboxClose = lightbox.querySelector('.k18-video-lightbox-close');

  function openLightbox(src) {
    lightboxVideo.src = src;
    lightbox.classList.add('open');
    lightboxVideo.currentTime = 0;
    lightboxVideo.muted = false;
    lightboxVideo.play().catch(() => {});
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightboxVideo.pause();
    lightboxVideo.removeAttribute('src');
    lightboxVideo.load();
    document.body.style.overflow = '';
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });

  // Lazy-load videos into reels when they scroll into view
  function loadReel(reel) {
    if (reel.dataset.loaded) return;
    const src = reel.dataset.src;
    if (!src) return;
    const video = document.createElement('video');
    video.src = src;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = !prefersReduced;
    video.preload = 'metadata';
    video.setAttribute('aria-hidden', 'true');
    reel.appendChild(video);
    reel.dataset.loaded = '1';
    if (!prefersReduced) {
      video.play().catch(() => { /* browser blocked autoplay */ });
    }
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const reel = entry.target;
      const video = reel.querySelector('video');
      if (entry.isIntersecting) {
        if (!video) {
          loadReel(reel);
        } else if (!prefersReduced) {
          video.play().catch(() => {});
        }
      } else if (video) {
        video.pause();
      }
    });
  }, { threshold: 0.25 });

  REELS.forEach(reel => {
    observer.observe(reel);
    // Tap opens lightbox
    reel.addEventListener('click', () => {
      const src = reel.dataset.src;
      if (src) openLightbox(src);
    });
    reel.style.cursor = 'pointer';
    // Keyboard accessibility
    reel.setAttribute('role', 'button');
    reel.setAttribute('tabindex', '0');
    reel.setAttribute('aria-label', 'Play video with sound');
    reel.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const src = reel.dataset.src;
        if (src) openLightbox(src);
      }
    });
  });
})();
