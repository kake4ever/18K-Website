'use client';

import { motion } from 'motion/react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-warmblack">
      {/* Hero background image with subtle Ken-Burns zoom */}
      <motion.div
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 12, ease: 'easeOut' }}
        className="absolute inset-0"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/hero.jpg)' }}
        />
      </motion.div>

      {/* Warm overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-warmblack/40 via-warmblack/30 to-warmblack/80" />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(26,23,20,0.5) 100%)' }} />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          className="text-[10px] md:text-xs font-light tracking-[0.5em] uppercase text-softgold mb-8"
        >
          Santa Monica&apos;s Premier Nail Boutique
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.55 }}
          className="font-display text-5xl md:text-7xl lg:text-8xl font-light text-pearl leading-[1.02] tracking-[-0.02em] mb-6"
        >
          Nail Artistry,<br />
          <em className="not-italic gradient-gold font-normal italic">Refined</em>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.9 }}
          className="text-sm md:text-base font-light text-pearl/60 max-w-xl mx-auto leading-relaxed mb-10"
        >
          Modern precision meets quiet luxury. Every service designed with intention — never rushed, never ordinary.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 1.15 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <a
            href="https://booking.18knailboutique.com/webstoreNew/services"
            target="_blank"
            rel="noopener"
            className="group inline-flex items-center gap-3 bg-deepgold text-pearl px-9 py-4 text-[11px] tracking-[0.25em] uppercase hover:bg-softgold transition-all rounded-sm"
          >
            Book Your Visit
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
          <a
            href="#services"
            className="inline-block text-[11px] tracking-[0.25em] uppercase text-pearl border border-pearl/30 px-9 py-4 hover:border-softgold hover:text-softgold transition-all rounded-sm"
          >
            Explore Services
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.8 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <div className="w-px h-9 bg-gradient-to-b from-softgold/60 to-transparent animate-pulse" />
        <span className="text-[10px] tracking-[0.35em] uppercase text-pearl/25" style={{ writingMode: 'vertical-rl' }}>
          Scroll
        </span>
      </motion.div>
    </section>
  );
}
