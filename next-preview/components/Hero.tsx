'use client';

import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';

/* Sparkles — deterministic layout so SSR + client match */
function Sparkles({ count = 44 }: { count?: number }) {
  const dots = useMemo(() => {
    // deterministic pseudo-random using a fixed seed sequence
    let s = 1337;
    const rand = () => {
      s = (s * 1664525 + 1013904223) % 4294967296;
      return s / 4294967296;
    };
    return Array.from({ length: count }, (_, i) => ({
      key: i,
      top: rand() * 100,
      left: rand() * 100,
      size: 2 + rand() * 4,
      delay: rand() * 4,
      duration: 2.5 + rand() * 3,
    }));
  }, [count]);
  return (
    <div className="absolute inset-0 pointer-events-none">
      {dots.map((d) => (
        <span
          key={d.key}
          className="sparkle"
          style={{
            top: `${d.top}%`,
            left: `${d.left}%`,
            width: `${d.size}px`,
            height: `${d.size}px`,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

/* Kinetic character-by-character reveal */
function KineticHeadline({ line1, line2 }: { line1: string; line2: string }) {
  return (
    <h1 className="font-display text-5xl md:text-7xl lg:text-[7.5rem] font-light text-pearl leading-[1.02] tracking-[-0.02em] mb-6">
      <span className="block">
        {line1.split('').map((ch, i) => (
          <motion.span
            key={`a-${i}`}
            initial={{ opacity: 0, y: 40, filter: 'blur(12px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.9, delay: 0.5 + i * 0.035, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'inline-block' }}
          >
            {ch === ' ' ? ' ' : ch}
          </motion.span>
        ))}
      </span>
      <span className="block gradient-gold italic font-normal">
        {line2.split('').map((ch, i) => (
          <motion.span
            key={`b-${i}`}
            initial={{ opacity: 0, y: 40, filter: 'blur(12px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.9, delay: 0.9 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'inline-block' }}
          >
            {ch === ' ' ? ' ' : ch}
          </motion.span>
        ))}
      </span>
    </h1>
  );
}

/* Magnetic button — cursor pull */
function MagneticCTA({
  href,
  children,
  primary = false,
}: {
  href: string;
  children: React.ReactNode;
  primary?: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = e.clientX - rect.left - rect.width / 2;
    const cy = e.clientY - rect.top - rect.height / 2;
    animate(x, cx * 0.25, { type: 'spring', stiffness: 200, damping: 15 });
    animate(y, cy * 0.25, { type: 'spring', stiffness: 200, damping: 15 });
  };
  const handleLeave = () => {
    animate(x, 0, { type: 'spring', stiffness: 200, damping: 15 });
    animate(y, 0, { type: 'spring', stiffness: 200, damping: 15 });
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      target={href.startsWith('#') ? undefined : '_blank'}
      rel={href.startsWith('#') ? undefined : 'noopener'}
      style={{ x, y }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={
        primary
          ? 'moving-border inline-flex items-center gap-3 px-10 py-4 text-[11px] tracking-[0.3em] uppercase text-pearl rounded-sm'
          : 'inline-flex items-center gap-3 text-[11px] tracking-[0.3em] uppercase text-pearl/80 border border-pearl/20 px-10 py-4 hover:border-softgold hover:text-softgold transition-colors rounded-sm backdrop-blur-sm'
      }
    >
      {children}
    </motion.a>
  );
}

export default function Hero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-warmblack">
      {/* Aurora layer */}
      <div className="aurora absolute inset-0 opacity-70" />
      {/* Warm vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 30%, rgba(13,10,8,0.85) 100%)',
        }}
      />
      {/* Sparkles — only after mount to avoid SSR flicker */}
      {mounted && <Sparkles count={44} />}

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

        <KineticHeadline line1="Nail Artistry," line2="Refined." />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 1.6 }}
          className="text-sm md:text-base font-light text-pearl/60 max-w-xl mx-auto leading-relaxed mb-12"
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
          <MagneticCTA href="https://booking.18knailboutique.com/webstoreNew/services" primary>
            Book Your Visit
            <span>→</span>
          </MagneticCTA>
          <MagneticCTA href="#services">Explore Services</MagneticCTA>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2.4 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
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
