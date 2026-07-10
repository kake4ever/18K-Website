/**
 * 18K Nail Boutique — Motion Foundation
 * Quiet-luxury animations powered by GSAP 3 (free — Webflow/GreenSock)
 *
 * Effects:
 *   1. Line-mask reveal on H1/H2 headings (SplitText)
 *   2. Fade-up on section content (ScrollTrigger)
 *   3. Gallery image subtle parallax scale
 *   4. Reduce-motion toggle in footer (localStorage-persisted)
 *
 * Respects prefers-reduced-motion + user opt-out.
 * Budget: ~35KB gzipped total (GSAP core + plugins loaded via CDN).
 */
(function () {
  'use strict';

  const STORAGE_KEY = '18k_motion_pref_v1';
  const REDUCE_CLASS = 'k18-motion-reduced';

  // ==================================================================
  // 1. USER PREFERENCE + REDUCED MOTION DETECTION
  // ==================================================================
  function getUserPref() {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  }
  function setUserPref(val) {
    try { localStorage.setItem(STORAGE_KEY, val); } catch { /* ignore */ }
  }
  function shouldReduceMotion() {
    const pref = getUserPref();
    if (pref === 'reduced') return true;
    if (pref === 'full') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  function applyReducedClass() {
    document.documentElement.classList.toggle(REDUCE_CLASS, shouldReduceMotion());
  }
  applyReducedClass();

  // ==================================================================
  // 2. INJECT STYLES (motion toggle UI + CSS scroll-driven parallax)
  // ==================================================================
  const styles = `
    /* --- Reduce-motion toggle in footer --- */
    .k18-motion-toggle{display:inline-flex;align-items:center;gap:8px;font-size:0.68rem;letter-spacing:0.15em;text-transform:uppercase;color:rgba(184,150,78,0.6);cursor:pointer;background:none;border:1px solid rgba(184,150,78,0.2);padding:6px 12px;border-radius:20px;font-family:'Outfit',sans-serif;transition:all 0.3s;}
    .k18-motion-toggle:hover{color:#B8964E;border-color:#B8964E;}
    .k18-motion-toggle .k18-toggle-dot{width:8px;height:8px;border-radius:50%;background:#B8964E;transition:all 0.3s;}
    .k18-motion-reduced .k18-motion-toggle .k18-toggle-dot{background:transparent;border:1px solid #B8964E;}

    /* --- Line-mask reveal: prevent FOUC --- */
    .k18-reveal{visibility:hidden;}
    .k18-reveal.k18-revealed{visibility:visible;}
    .k18-motion-reduced .k18-reveal{visibility:visible;}

    /* --- Native CSS scroll-driven parallax (Chrome/Safari 26+) --- */
    @supports (animation-timeline: view()) {
      .k18-parallax-img{
        animation: k18ParallaxRise linear both;
        animation-timeline: view();
        animation-range: entry 0% exit 100%;
      }
      @keyframes k18ParallaxRise {
        from { transform: translateY(4%) scale(1.06); }
        to   { transform: translateY(-4%) scale(1.06); }
      }
    }
    .k18-motion-reduced .k18-parallax-img{animation:none !important;transform:none !important;}

    /* --- Native View Transitions --- */
    @view-transition{navigation:auto;}
    ::view-transition-old(root),::view-transition-new(root){animation-duration:280ms;animation-timing-function:cubic-bezier(0.22,1,0.36,1);}
    .k18-motion-reduced ::view-transition-old(root),.k18-motion-reduced ::view-transition-new(root){animation-duration:0ms;}

    @media (prefers-reduced-motion: reduce){
      ::view-transition-old(root),::view-transition-new(root){animation-duration:0ms;}
    }
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  // ==================================================================
  // 3. WAIT FOR GSAP + INIT
  // ==================================================================
  function waitForGSAP(cb) {
    if (window.gsap && window.ScrollTrigger) {
      cb();
    } else {
      let tries = 0;
      // 40 tries * 50ms = 2 seconds max wait
      const check = setInterval(() => {
        if (window.gsap && window.ScrollTrigger) {
          clearInterval(check);
          cb();
        } else if (++tries > 40) {
          clearInterval(check);
          console.warn('[18K motion] GSAP failed to load; revealing all content.');
          document.querySelectorAll('.k18-reveal').forEach(el => el.classList.add('k18-revealed'));
        }
      }, 50);
    }
  }

  function initMotion() {
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);
    if (window.SplitText) gsap.registerPlugin(window.SplitText);

    const mm = gsap.matchMedia();

    // Autotag headings + images if not already tagged
    autoTagElements();

    mm.add({
      normal: '(prefers-reduced-motion: no-preference)',
      reduce: '(prefers-reduced-motion: reduce)',
    }, (ctx) => {
      const { reduce } = ctx.conditions;
      const userReduced = getUserPref() === 'reduced';
      const forcefull = getUserPref() === 'full';
      const effectiveReduce = forcefull ? false : (reduce || userReduced);

      // ---- Effect 1: Line-mask reveal on hero headings ----
      revealHeadings(gsap, effectiveReduce);

      // ---- Effect 2: Fade-up on section content ----
      fadeUpSections(gsap, ScrollTrigger, effectiveReduce);

      // ---- Effect 3: JS fallback for browsers without CSS scroll-timeline ----
      if (!CSS.supports('animation-timeline: view()')) {
        jsParallaxFallback(gsap, ScrollTrigger, effectiveReduce);
      }
    });

    injectMotionToggle();
  }

  // ==================================================================
  // 4. AUTO-TAG HEADINGS AND IMAGES
  // ==================================================================
  function autoTagElements() {
    // Tag major headings for reveal (respect k18-skip on the element or any parent)
    const headingSelectors = [
      '.hero-h1', '.page-title', '.page-hero-title',
      '.section-title', '.cta-title', '.services-cta h2',
      'h1', 'h2',
    ];
    headingSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        if (el.classList.contains('k18-skip')) return;
        if (el.closest('.k18-skip')) return;
        if (!el.classList.contains('k18-reveal')) el.classList.add('k18-reveal');
      });
    });

    // Tag gallery images for parallax
    const parallaxSelectors = [
      '.g-item img', '.masonry-item img', '.gallery-item img',
      '.about-story-img img', '.home-about-img img', '.story-img img',
    ];
    parallaxSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        if (el.classList.contains('k18-skip') || el.closest('.k18-skip')) return;
        if (!el.classList.contains('k18-parallax-img')) el.classList.add('k18-parallax-img');
      });
    });
  }

  // ==================================================================
  // 5. EFFECT: LINE-MASK REVEAL ON HEADINGS
  // ==================================================================
  function revealHeadings(gsap, reduce) {
    const headings = document.querySelectorAll('.k18-reveal');

    headings.forEach(el => {
      // Skip if already revealed (page transitions)
      if (el.classList.contains('k18-revealed')) return;

      const isHero = el.closest('.hero, .page-hero, .cta-section');
      const useSplitText = window.SplitText && el.textContent.trim().length > 0 && !reduce;

      if (useSplitText) {
        try {
          const split = window.SplitText.create(el, {
            type: 'lines',
            mask: 'lines',
            linesClass: 'k18-split-line',
          });
          el.classList.add('k18-revealed');
          gsap.from(split.lines, {
            yPercent: 110,
            opacity: 0,
            duration: 1.1,
            stagger: 0.08,
            ease: 'expo.out',
            scrollTrigger: isHero ? null : {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
            delay: isHero ? 0.2 : 0,
          });
          return;
        } catch (e) { /* fall through to fade */ }
      }

      // Fallback: simple fade + lift (no SplitText or reduced motion)
      el.classList.add('k18-revealed');
      if (reduce) {
        gsap.from(el, { opacity: 0, duration: 0.3 });
      } else {
        gsap.from(el, {
          opacity: 0,
          y: 30,
          duration: 0.9,
          ease: 'expo.out',
          scrollTrigger: el.closest('.hero, .page-hero') ? null : {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        });
      }
    });
  }

  // ==================================================================
  // 6. EFFECT: FADE-UP ON SECTION CONTENT
  // ==================================================================
  function fadeUpSections(gsap, ScrollTrigger, reduce) {
    const fadeUpSelectors = [
      '.service-card', '.svc-card', '.value-card', '.hygiene-item',
      '.testi-card', '.stat-item', '.menu-item', '.footer-grid > div',
      '.hero-sub', '.page-sub', '.page-hero-sub', '.section-overline',
      '.hero-buttons', '.hero-cta', '.btn-primary', '.gold-divider',
      '.services-cta p', '.cta-sub',
    ];

    const els = document.querySelectorAll(fadeUpSelectors.join(','));

    els.forEach((el) => {
      if (reduce) {
        gsap.from(el, {
          opacity: 0,
          duration: 0.3,
          scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
        });
      } else {
        gsap.from(el, {
          opacity: 0,
          y: 24,
          duration: 0.9,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
        });
      }
    });
  }

  // ==================================================================
  // 7. JS PARALLAX FALLBACK (for browsers without CSS scroll-timeline)
  // ==================================================================
  function jsParallaxFallback(gsap, ScrollTrigger, reduce) {
    if (reduce) return;
    document.querySelectorAll('.k18-parallax-img').forEach(img => {
      gsap.to(img, {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: {
          trigger: img,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });
  }

  // ==================================================================
  // 8. MOTION TOGGLE UI (bottom of every page)
  // ==================================================================
  function injectMotionToggle() {
    // Find footer legal or footer-bottom to inject into
    const footerLegal = document.querySelector('.footer-legal, .footer-bottom');
    if (!footerLegal) return;
    if (document.querySelector('.k18-motion-toggle')) return;

    const btn = document.createElement('button');
    btn.className = 'k18-motion-toggle';
    btn.setAttribute('aria-label', 'Toggle motion');
    btn.innerHTML = '<span class="k18-toggle-dot"></span><span class="k18-toggle-label">Motion</span>';

    btn.addEventListener('click', () => {
      const currentReduced = shouldReduceMotion();
      setUserPref(currentReduced ? 'full' : 'reduced');
      applyReducedClass();
      // Reload for clean state — cheap + reliable
      window.location.reload();
    });

    footerLegal.appendChild(btn);
  }

  // ==================================================================
  // BOOT
  // ==================================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => waitForGSAP(initMotion));
  } else {
    waitForGSAP(initMotion);
  }
})();
