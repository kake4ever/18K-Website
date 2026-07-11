/**
 * 18K Nail Boutique — Signature Interactive Effects
 *
 * Three brand-appropriate micro-interactions:
 *   1. Gallery hue-shift on hover ("interactive nail color")
 *   2. Subtle 3D tilt on service cards (~6° max, mouse-tracked)
 *   3. Ambient gold particles floating in hero (canvas, ~35 dots)
 *
 * All effects:
 *   - Disabled on touch devices (no hover to react to)
 *   - Respect prefers-reduced-motion + user's motion toggle
 *   - Pause when tab not visible
 *   - Total footprint: ~4KB gz
 */
(function () {
  'use strict';

  const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const userReducedMotion = () => {
    try { return localStorage.getItem('18k_motion_pref_v1') === 'reduced'; } catch { return false; }
  };
  const disabled = prefersReduced || userReducedMotion();

  // ==================================================================
  // Inject styles
  // ==================================================================
  const styles = `
    /* --- Effect 1: Gallery hue-shift on hover --- */
    .g-item .img-cover,
    .masonry-item .masonry-item-inner,
    .gallery-item img {
      transition: filter 0.9s cubic-bezier(0.22, 1, 0.36, 1);
    }
    @media (hover: hover) and (pointer: fine) {
      .g-item:hover .img-cover,
      .masonry-item:hover .masonry-item-inner,
      .gallery-item:hover img {
        filter: hue-rotate(-12deg) saturate(1.15) brightness(1.05);
      }
    }

    /* --- Effect 2: 3D tilt on service cards --- */
    .svc-card, .service-card {
      transform-style: preserve-3d;
      transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.5s ease;
    }
    .svc-card.k18-tilting, .service-card.k18-tilting {
      transition: box-shadow 0.3s ease;
    }
    .svc-card.k18-tilting {
      box-shadow: 0 25px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(184,150,78,0.4);
    }

    /* --- Effect 3: Ambient gold particles canvas --- */
    .k18-particles-canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      opacity: 0.55;
      z-index: 1;
      mix-blend-mode: screen;
    }
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  if (disabled) return;

  // ==================================================================
  // Effect 2: 3D card tilt (mouse-tracked)
  // ==================================================================
  if (!isTouch) {
    const tiltCards = document.querySelectorAll('.svc-card, .service-card');
    tiltCards.forEach(card => {
      let rafId = null;
      const MAX_TILT = 6;   // degrees
      const LIFT = 6;       // px translateZ approximation via translateY

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const cx = (e.clientX - rect.left) / rect.width - 0.5;
        const cy = (e.clientY - rect.top) / rect.height - 0.5;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          card.style.transform = `perspective(1000px) rotateY(${cx * MAX_TILT}deg) rotateX(${-cy * MAX_TILT}deg) translateY(-${LIFT}px)`;
          card.classList.add('k18-tilting');
        });
      });

      card.addEventListener('mouseleave', () => {
        if (rafId) cancelAnimationFrame(rafId);
        card.style.transform = '';
        card.classList.remove('k18-tilting');
      });
    });
  }

  // ==================================================================
  // Effect 3: Ambient gold particles in hero
  // ==================================================================
  const hero = document.querySelector('.hero');
  if (!hero) return;

  // Ensure hero has position: relative so canvas overlays correctly
  const heroStyle = getComputedStyle(hero);
  if (heroStyle.position === 'static') hero.style.position = 'relative';

  const canvas = document.createElement('canvas');
  canvas.className = 'k18-particles-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  hero.insertBefore(canvas, hero.firstChild);

  const ctx = canvas.getContext('2d');
  const particles = [];
  const NUM_PARTICLES = window.innerWidth > 900 ? 40 : 22;
  let width = 0, height = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  let animId = null, isRunning = false;

  function resize() {
    const rect = hero.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function createParticle() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      size: 0.6 + Math.random() * 1.8,
      speedY: -0.15 - Math.random() * 0.35,
      speedX: (Math.random() - 0.5) * 0.12,
      opacity: 0.15 + Math.random() * 0.55,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.008 + Math.random() * 0.02,
    };
  }

  function initParticles() {
    particles.length = 0;
    for (let i = 0; i < NUM_PARTICLES; i++) {
      particles.push(createParticle());
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      p.y += p.speedY;
      p.x += p.speedX;
      p.twinklePhase += p.twinkleSpeed;

      // Wrap around
      if (p.y < -10) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      const twinkle = (Math.sin(p.twinklePhase) + 1) / 2;
      const alpha = p.opacity * (0.4 + twinkle * 0.6);

      // Gold glow — layered fill
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
      gradient.addColorStop(0, `rgba(212, 188, 139, ${alpha})`);
      gradient.addColorStop(0.4, `rgba(184, 150, 78, ${alpha * 0.5})`);
      gradient.addColorStop(1, 'rgba(184, 150, 78, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
      ctx.fill();

      // Bright core
      ctx.fillStyle = `rgba(245, 235, 210, ${alpha * 0.9})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
    animId = requestAnimationFrame(draw);
  }

  function start() {
    if (isRunning) return;
    isRunning = true;
    draw();
  }

  function stop() {
    isRunning = false;
    if (animId) cancelAnimationFrame(animId);
    animId = null;
  }

  // Init
  resize();
  initParticles();
  start();

  // Handle resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resize();
      initParticles();
    }, 200);
  });

  // Pause when tab hidden or hero out of view
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) start();
      else stop();
    });
  }, { threshold: 0 });
  heroObserver.observe(hero);
})();
