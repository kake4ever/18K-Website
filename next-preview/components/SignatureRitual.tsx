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

const specs = [
  { k: 'SESSION',  v: '45 MIN' },
  { k: 'WARRANTY', v: '10 DAYS' },
  { k: 'BASE',     v: 'STRUCTURED GEL' },
  { k: 'ORIGIN',   v: 'THE CALM RITUAL' },
];

const headlineWords = ['18K', 'NAIL', 'BOUTIQUE'];

export default function SignatureRitual() {
  const container = useRef<HTMLElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const frameRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const words = gsap.utils.toArray<HTMLElement>('.ritual-word');
      const specLines = gsap.utils.toArray<HTMLElement>('.ritual-spec');

      // initial states
      gsap.set(words, { yPercent: 110, opacity: 0 });
      gsap.set('.ritual-kanji', { opacity: 0, y: 20 });
      gsap.set('.ritual-tagline', { opacity: 0, y: 20 });
      gsap.set(specLines, { clipPath: 'inset(0 100% 0 0)', opacity: 0 });
      gsap.set('.ritual-photo', { scale: 0.88, opacity: 0.4 });
      gsap.set('.ritual-corner', { scale: 0, opacity: 0 });
      gsap.set('.ritual-cta', { opacity: 0, y: 12 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: 'top top',
          end: '+=1200',
          pin: true,
          scrub: 1,
          onUpdate: (self) => {
            const c = Math.floor(self.progress * 100).toString().padStart(3, '0');
            if (counterRef.current) counterRef.current.textContent = c;
            if (frameRef.current)  frameRef.current.textContent  = c;
          },
        },
      });

      tl.to(words, {
        yPercent: 0,
        opacity: 1,
        stagger: 0.12,
        duration: 1,
        ease: 'power3.out',
      })
        .to('.ritual-kanji', { opacity: 1, y: 0, duration: 0.6 }, '-=0.6')
        .to('.ritual-photo', { scale: 1, opacity: 1, duration: 1.4 }, '<')
        .to('.ritual-corner', { scale: 1, opacity: 1, duration: 0.5, stagger: 0.08 }, '-=0.8')
        .to('.ritual-tagline', { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
        .to(specLines, { clipPath: 'inset(0 0% 0 0)', opacity: 1, stagger: 0.14, duration: 0.5 }, '-=0.2')
        .to('.ritual-cta', { opacity: 1, y: 0, duration: 0.5 }, '-=0.1');
    },
    { scope: container }
  );

  return (
    <section
      ref={container}
      id="ritual"
      className="relative min-h-screen bg-[#0a0806] text-pearl overflow-hidden"
    >
      {/* subtle vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 60% 40%, rgba(184,150,78,0.08) 0%, transparent 55%)',
        }}
      />

      {/* Top HUD strip */}
      <div className="absolute top-0 inset-x-0 z-20 border-b border-deepgold/20 px-6 lg:px-10 py-3 flex items-center justify-between font-mono text-[9px] tracking-[0.3em] uppercase text-pearl/50">
        <div className="flex items-center gap-4">
          <span className="text-softgold font-bold">18K</span>
          <span className="text-pearl/30">// 静けさ</span>
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
      <div className="absolute top-11 inset-x-0 z-10 h-6 border-b border-deepgold/15 flex items-center px-6 lg:px-10 pointer-events-none">
        <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-deepgold/25 to-transparent" />
      </div>

      {/* Main content */}
      <div className="absolute inset-0 grid lg:grid-cols-[1.15fr_1fr] gap-8 lg:gap-16 items-center px-6 lg:px-14 pt-28 pb-14">
        {/* Left column */}
        <div className="relative z-10">
          <p className="font-mono text-[10px] tracking-[0.5em] uppercase text-softgold mb-6">
            // 03. 職人技 · The Craft
          </p>

          <h2 className="font-display font-light leading-[0.92] tracking-[-0.03em] mb-6">
            {headlineWords.map((w, i) => (
              <span
                key={w}
                className="inline-block overflow-hidden align-bottom pr-4 md:pr-6"
              >
                <span
                  className={`ritual-word inline-block text-6xl md:text-8xl lg:text-[8rem] ${
                    i === 0 ? 'gradient-gold italic' : 'text-pearl'
                  }`}
                >
                  {w}
                </span>
              </span>
            ))}
          </h2>

          <p className="ritual-kanji font-mono text-sm tracking-[0.4em] uppercase text-pearl/60 mb-8">
            Signature // The Calm Ritual
          </p>

          <p className="ritual-tagline text-sm md:text-base font-light text-pearl/70 leading-relaxed max-w-lg mb-10">
            A slow, sensory experience — structured gel base, honey warmth,
            rose petal cool. Precision, unhurried. Zero compromise.
          </p>

          <div className="grid grid-cols-2 gap-x-6 gap-y-5 max-w-md mb-8">
            {specs.map((s) => (
              <div key={s.k} className="ritual-spec">
                <p className="font-mono text-[9px] tracking-[0.35em] uppercase text-softgold/60 mb-1">
                  {s.k}
                </p>
                <p className="font-mono text-sm tracking-[0.15em] text-pearl">
                  {s.v}
                </p>
              </div>
            ))}
          </div>

          <a
            href="https://booking.18knailboutique.com/webstoreNew/services"
            target="_blank"
            rel="noopener"
            className="ritual-cta inline-flex items-center gap-3 border border-softgold/50 text-softgold hover:bg-softgold hover:text-warmblack transition-colors px-8 py-3 font-mono text-[10px] tracking-[0.35em] uppercase rounded-sm"
          >
            Reserve the ritual
            <span>→</span>
          </a>
        </div>

        {/* Right column — product photo with HUD chrome */}
        <div className="relative w-full aspect-[4/5] max-w-md mx-auto z-10">
          <div
            className="ritual-photo absolute inset-0 bg-cover bg-center rounded-sm"
            style={{ backgroundImage: 'url(/images/about.jpg)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0806]/50 via-transparent to-[#0a0806]/20 pointer-events-none rounded-sm" />

          {/* Corner brackets */}
          <span className="ritual-corner absolute top-2 left-2 w-8 h-8 border-t border-l border-softgold/70" />
          <span className="ritual-corner absolute top-2 right-2 w-8 h-8 border-t border-r border-softgold/70" />
          <span className="ritual-corner absolute bottom-2 left-2 w-8 h-8 border-b border-l border-softgold/70" />
          <span className="ritual-corner absolute bottom-2 right-2 w-8 h-8 border-b border-r border-softgold/70" />

          {/* HUD overlays */}
          <div className="absolute top-4 inset-x-4 flex items-center justify-between font-mono text-[9px] tracking-[0.3em] uppercase">
            <span className="text-softgold">● LIVE</span>
            <span className="text-pearl/70">
              FRAME <span ref={frameRef}>000</span> / 100
            </span>
          </div>
          <div className="absolute bottom-4 inset-x-4 flex items-center justify-between font-mono text-[9px] tracking-[0.3em] uppercase text-pearl/70">
            <span>Signature // Manicure</span>
            <span className="text-softgold">45:00</span>
          </div>
        </div>
      </div>

      {/* Bottom footer strip */}
      <div className="absolute bottom-0 inset-x-0 border-t border-deepgold/20 px-6 lg:px-10 py-3 flex items-center justify-between font-mono text-[9px] tracking-[0.3em] uppercase text-pearl/40">
        <span>18K Nail Boutique // Santa Monica · Since 2021</span>
        <span className="text-softgold hidden md:inline">Scroll // 04. The Story ↓</span>
      </div>
    </section>
  );
}
