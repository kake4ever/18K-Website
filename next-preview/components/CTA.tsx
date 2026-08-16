'use client';

import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

export default function CTA() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.35 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className={`relative py-32 lg:py-48 px-6 lg:px-10 bg-warmblack overflow-hidden ${
        active ? 'lamp-active' : ''
      }`}
    >
      {/* Lamp cones */}
      <div className="absolute inset-x-0 top-0 h-72 flex justify-center pointer-events-none">
        <motion.div
          initial={{ width: '15rem' }}
          animate={{ width: active ? '30rem' : '15rem' }}
          transition={{ duration: 1.0, ease: 'easeOut' }}
          className="lamp-cone-left"
        />
        <motion.div
          initial={{ width: '15rem' }}
          animate={{ width: active ? '30rem' : '15rem' }}
          transition={{ duration: 1.0, ease: 'easeOut' }}
          className="lamp-cone-right"
        />
      </div>

      {/* Lamp light strip + halo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: active ? '30rem' : 0 }}
          transition={{ duration: 1.0, ease: 'easeOut' }}
          className="h-[2px] bg-gradient-to-r from-transparent via-softgold to-transparent"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: active ? 1 : 0 }}
          transition={{ duration: 1.0 }}
          className="w-56 h-40 rounded-full mt-[-8rem] blur-3xl"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(232,209,154,0.5) 0%, transparent 65%)',
          }}
        />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-3xl mx-auto text-center relative z-10 mt-20"
      >
        <p className="text-[10px] tracking-[0.5em] uppercase text-softgold mb-8">
          — Ready to Experience 18K —
        </p>
        <h2 className="font-display text-5xl md:text-6xl lg:text-7xl font-light text-pearl leading-[1.05] mb-8">
          Your moment of{' '}
          <em className="gradient-gold not-italic italic font-normal">quiet luxury</em>{' '}
          awaits.
        </h2>
        <p className="text-sm md:text-base text-taupe font-light mb-12">
          Appointments available seven days a week in Santa Monica.
        </p>

        <a
          href="https://booking.18knailboutique.com/webstoreNew/services"
          target="_blank"
          rel="noopener"
          className="moving-border group inline-flex items-center gap-3 px-12 py-4 text-[11px] tracking-[0.3em] uppercase text-pearl rounded-sm"
        >
          Book an Appointment
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </a>

        <p className="mt-10 text-xs text-taupe tracking-widest">
          (424) 238-5500 &nbsp;·&nbsp; info@18knailboutique.com
        </p>
      </motion.div>
    </section>
  );
}
