'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

const chapters = [
  '01. THE CHAIR',
  '02. THE MENU',
  '03. THE CRAFT',
  '04. THE STORY',
  '05. BOOK',
];

/* 4 data stat cards — the "how it's made" numbers */
const stats = [
  {
    k: 'SESSION',
    v: '45',
    unit: 'MIN',
    caption: 'Slow and unhurried. Every ritual takes as long as it takes — no shortcuts, no rushing.',
  },
  {
    k: 'GEL LAYERS',
    v: '07',
    unit: 'STEPS',
    caption: 'Base → structure → color → art → seal. Each layer cured with intent under 405nm.',
  },
  {
    k: 'TRAINING',
    v: '32',
    unit: 'HRS',
    caption: 'Every technician certified in Gel-X, Structured Gel, and dipping powder before touching a client.',
  },
  {
    k: 'WARRANTY',
    v: '10',
    unit: 'DAYS',
    caption: 'If a nail lifts or breaks within ten days, we fix it — no questions, no charge.',
  },
];

export default function SignatureRitual() {
  const container = useRef<HTMLElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const frameRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const stats = gsap.utils.toArray<HTMLElement>('.ritual-stat');
      const displayChars = gsap.utils.toArray<HTMLElement>('.ritual-display-char');

      gsap.set(stats, { y: 40, opacity: 0 });
      gsap.set('.ritual-video-wrap', { clipPath: 'inset(100% 0% 0% 0%)' });
      gsap.set('.ritual-marker', { opacity: 0, y: 24 });
      gsap.set(displayChars, { yPercent: 110 });
      gsap.set('.ritual-tagline', { opacity: 0, y: 12 });
      gsap.set('.ritual-corner', { scale: 0, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: 'top top',
          end: '+=1600',
          pin: true,
          scrub: 1,
          onUpdate: (self) => {
            const c = Math.floor(self.progress * 100).toString().padStart(3, '0');
            if (counterRef.current) counterRef.current.textContent = c;
            if (frameRef.current)   frameRef.current.textContent   = c;
          },
        },
      });

      tl.to(stats, {
        y: 0,
        opacity: 1,
        stagger: 0.12,
        duration: 0.7,
        ease: 'power2.out',
      })
        .to('.ritual-video-wrap', {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.6,
          ease: 'power3.inOut',
        }, '-=0.3')
        .to('.ritual-corner', {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          stagger: 0.06,
        }, '-=0.9')
        .to('.ritual-marker', {
          opacity: 1,
          y: 0,
          duration: 0.6,
        }, '-=0.6')
        .to(displayChars, {
          yPercent: 0,
          stagger: 0.04,
          duration: 0.9,
          ease: 'power3.out',
        }, '-=0.5')
        .to('.ritual-tagline', {
          opacity: 1,
          y: 0,
          duration: 0.5,
        }, '-=0.2');
    },
    { scope: container }
  );

  const displayText = 'THE CRAFT';

  return (
    <section
      ref={container}
      id="ritual"
      className="relative min-h-screen bg-[#0a0806] text-pearl overflow-hidden"
    >
      {/* Top HUD strip */}
      <div className="absolute top-0 inset-x-0 z-30 border-b border-deepgold/20 px-6 lg:px-10 py-3 flex items-center justify-between font-mono text-[9px] tracking-[0.3em] uppercase text-pearl/50">
        <div className="flex items-center gap-4">
          <span className="text-softgold font-bold">18K</span>
          <span className="text-pearl/30">// 職人技</span>
        </div>
        <div className="hidden lg:flex items-center gap-6">
          {chapters.map((c, i) => (
            <span key={c} className={i === 2 ? 'text-softgold' : 'text-pearl/40'}>
              {c}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-deepgold">●</span>
          <span>REC <span ref={counterRef}>000</span></span>
        </div>
      </div>

      {/* Sensor timeline strip under HUD */}
      <div className="absolute top-11 inset-x-0 z-20 h-6 border-b border-deepgold/15 flex items-center px-6 lg:px-10 pointer-events-none">
        <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-deepgold/25 to-transparent" />
      </div>

      {/* Row 1 — data stat cards */}
      <div className="absolute top-[4.5rem] inset-x-0 z-20 grid grid-cols-2 lg:grid-cols-4 gap-px bg-deepgold/10">
        {stats.map((s) => (
          <div
            key={s.k}
            className="ritual-stat bg-[#0a0806] p-5 lg:p-6 flex flex-col"
          >
            <p className="font-mono text-[9px] tracking-[0.35em] uppercase text-softgold/60 mb-2">
              {s.k}
            </p>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="font-display text-5xl lg:text-6xl leading-none gradient-gold italic">
                {s.v}
              </span>
              <span className="font-mono text-xs tracking-[0.3em] text-pearl/50">
                {s.unit}
              </span>
            </div>
            <p className="text-[11px] font-light text-pearl/55 leading-snug">
              {s.caption}
            </p>
          </div>
        ))}
      </div>

      {/* Row 2 — full-bleed process video */}
      <div className="absolute inset-x-0 bottom-10 top-[19rem] lg:top-[16rem] z-10 px-4 lg:px-6">
        <div className="ritual-video-wrap relative w-full h-full overflow-hidden rounded-sm">
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src="/videos/reel-1.mp4"
            poster="/images/portfolio-1.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
          {/* Cinematic dark overlay for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0806] via-[#0a0806]/40 to-[#0a0806]/60 pointer-events-none" />

          {/* Corner brackets */}
          <span className="ritual-corner absolute top-3 left-3 w-10 h-10 border-t-2 border-l-2 border-softgold/80" />
          <span className="ritual-corner absolute top-3 right-3 w-10 h-10 border-t-2 border-r-2 border-softgold/80" />
          <span className="ritual-corner absolute bottom-3 left-3 w-10 h-10 border-b-2 border-l-2 border-softgold/80" />
          <span className="ritual-corner absolute bottom-3 right-3 w-10 h-10 border-b-2 border-r-2 border-softgold/80" />

          {/* Top-right HUD overlay */}
          <div className="absolute top-6 right-6 flex items-center gap-6 font-mono text-[10px] tracking-[0.3em] uppercase text-pearl/70">
            <span className="text-softgold">● LIVE</span>
            <span>FRAME <span ref={frameRef}>000</span> / 100</span>
            <span className="hidden md:inline">59.94 FPS</span>
          </div>

          {/* Chapter marker + display headline — bottom left */}
          <div className="absolute bottom-6 left-6 lg:bottom-10 lg:left-10 max-w-3xl">
            <p className="ritual-marker font-mono text-[11px] tracking-[0.5em] uppercase text-softgold mb-4">
              // 03. 手仕事 · Process
            </p>
            <h2 className="font-display font-light leading-[0.9] tracking-[-0.03em] mb-4 overflow-hidden">
              {displayText.split('').map((ch, i) => (
                <span
                  key={i}
                  className="inline-block overflow-hidden align-bottom"
                >
                  <span
                    className={`ritual-display-char inline-block text-6xl md:text-8xl lg:text-[10rem] ${
                      i < 4 ? 'text-pearl' : 'gradient-gold italic'
                    }`}
                  >
                    {ch === ' ' ? ' ' : ch}
                  </span>
                </span>
              ))}
            </h2>
            <p className="ritual-tagline text-sm md:text-base font-light text-pearl/70 leading-relaxed max-w-lg">
              Watch a signature ritual come to life — from bare nail to final seal.
              Every step by hand, every layer by intent.
            </p>
          </div>

          {/* Bottom-right timecode */}
          <div className="absolute bottom-6 right-6 font-mono text-[10px] tracking-[0.3em] uppercase text-pearl/70">
            <span>Signature // 45:00</span>
          </div>
        </div>
      </div>

      {/* Bottom HUD strip */}
      <div className="absolute bottom-0 inset-x-0 z-30 border-t border-deepgold/20 px-6 lg:px-10 py-3 flex items-center justify-between font-mono text-[9px] tracking-[0.3em] uppercase text-pearl/40">
        <span>18K Nail Boutique // Santa Monica · Since 2021</span>
        <span className="text-softgold hidden md:inline">Scroll // 04. The Story ↓</span>
      </div>
    </section>
  );
}
