'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Play, X } from 'lucide-react';

const reels = ['/videos/reel-1.mp4', '/videos/reel-2.mp4', '/videos/reel-3.mp4', '/videos/reel-4.mp4'];

function ReelCard({ src, i }: { src: string; i: number }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.9, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="group relative aspect-[9/16] overflow-hidden border border-deepgold/20 hover:border-deepgold/50 transition-colors bg-warmblack"
    >
      <video
        ref={ref}
        src={src}
        muted
        loop
        playsInline
        preload="metadata"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-warmblack/80 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[9px] tracking-[0.25em] uppercase text-softgold flex items-center gap-2">
          <Play size={10} /> Tap to play with sound
        </span>
      </div>
    </motion.div>
  );
}

export default function VideoShowcase() {
  return (
    <section className="py-24 lg:py-36 px-6 lg:px-10 bg-warmblack relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(184,150,78,0.08), transparent 60%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl mx-auto text-center mb-14 relative z-10"
      >
        <p className="text-[10px] tracking-[0.4em] uppercase text-softgold mb-4">The Craft in Motion</p>
        <h2 className="font-display text-4xl lg:text-5xl font-light text-pearl leading-tight">
          Watch the <em className="gradient-gold not-italic italic font-normal">artistry.</em>
        </h2>
        <p className="text-sm text-taupe font-light mt-4">A closer look at the process — from first stroke to final finish.</p>
      </motion.div>

      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4 relative z-10">
        {reels.map((src, i) => (
          <ReelCard key={src} src={src} i={i} />
        ))}
      </div>

      <div className="mt-14 text-center relative z-10">
        <a
          href="https://www.instagram.com/18k.nailboutique"
          target="_blank"
          rel="noopener"
          className="inline-block text-[11px] tracking-[0.25em] uppercase border border-softgold text-softgold px-8 py-3 hover:bg-deepgold hover:text-warmblack hover:border-deepgold transition-all rounded-sm"
        >
          See more on @18k.nailboutique
        </a>
      </div>
    </section>
  );
}
