'use client';

import { motion } from 'motion/react';
import SoftAurora from './reactbits/SoftAurora';
import SplitText from './reactbits/SplitText';
import Magnet from './reactbits/Magnet';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0806]">
      {/* WebGL soft aurora — React Bits */}
      <div className="absolute inset-0">
        <SoftAurora
          color1="#B8964E"
          color2="#E8D19A"
          speed={0.4}
          brightness={0.85}
          bandHeight={0.8}
          bandSpread={0.9}
        />
      </div>

      {/* Warm vignette to hold the tone dark and legible */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 25%, rgba(10,8,6,0.85) 90%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="text-[10px] md:text-xs font-light tracking-[0.6em] uppercase text-softgold mb-10"
        >
          — Santa Monica&apos;s Premier Nail Boutique —
        </motion.p>

        {/* Kinetic headline — React Bits SplitText (GSAP-powered) */}
        <SplitText
          tag="h1"
          text="Nail Artistry,"
          className="font-display block text-5xl md:text-7xl lg:text-[7.5rem] font-light text-pearl leading-[1.02] tracking-[-0.02em]"
          delay={35}
          duration={1}
          ease="power3.out"
          splitType="chars"
          from={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
          to={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          textAlign="center"
        />
        <SplitText
          tag="h1"
          text="Refined."
          className="font-display block text-5xl md:text-7xl lg:text-[7.5rem] font-normal italic gradient-gold leading-[1.02] tracking-[-0.02em] mb-6"
          delay={45}
          duration={1.1}
          ease="power3.out"
          splitType="chars"
          from={{ opacity: 0, y: 50, filter: 'blur(12px)' }}
          to={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          textAlign="center"
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 1.6 }}
          className="text-sm md:text-base font-light text-pearl/60 max-w-xl mx-auto leading-relaxed mb-12 mt-6"
        >
          Modern precision meets quiet luxury. Every service designed with intention —
          never rushed, never ordinary.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 1.85 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Magnet padding={80} magnetStrength={3}>
            <a
              href="https://booking.18knailboutique.com/webstoreNew/services"
              target="_blank"
              rel="noopener"
              className="moving-border inline-flex items-center gap-3 px-10 py-4 text-[11px] tracking-[0.3em] uppercase text-pearl rounded-sm"
            >
              Book Your Visit
              <span>→</span>
            </a>
          </Magnet>

          <Magnet padding={80} magnetStrength={3}>
            <a
              href="#services"
              className="inline-flex items-center gap-3 text-[11px] tracking-[0.3em] uppercase text-pearl/80 border border-pearl/20 px-10 py-4 hover:border-softgold hover:text-softgold transition-colors rounded-sm backdrop-blur-sm"
            >
              Explore Services
            </a>
          </Magnet>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2.4 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
      >
        <div className="w-px h-9 bg-gradient-to-b from-softgold/60 to-transparent animate-pulse" />
        <span
          className="text-[10px] tracking-[0.35em] uppercase text-pearl/25"
          style={{ writingMode: 'vertical-rl' }}
        >
          Scroll
        </span>
      </motion.div>
    </section>
  );
}
