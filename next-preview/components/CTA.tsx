'use client';

import { motion } from 'motion/react';

export default function CTA() {
  return (
    <section className="relative py-28 lg:py-40 px-6 lg:px-10 bg-warmblack overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(184,150,78,0.14) 0%, transparent 60%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-3xl mx-auto text-center relative z-10"
      >
        <p className="text-[10px] tracking-[0.4em] uppercase text-softgold mb-6">Ready to Experience 18K?</p>
        <h2 className="font-display text-5xl md:text-6xl lg:text-7xl font-light text-pearl leading-[1.05] mb-8">
          Your moment of <em className="gradient-gold not-italic italic font-normal">quiet luxury</em> awaits.
        </h2>
        <p className="text-sm md:text-base text-taupe font-light mb-12">
          Appointments available seven days a week in Santa Monica.
        </p>
        <a
          href="https://booking.18knailboutique.com/webstoreNew/services"
          target="_blank"
          rel="noopener"
          className="group inline-flex items-center gap-3 bg-deepgold text-pearl px-10 py-4 text-[11px] tracking-[0.25em] uppercase hover:bg-softgold transition-all rounded-sm"
        >
          Book an Appointment
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </a>
        <p className="mt-8 text-xs text-taupe tracking-widest">
          (424) 238-5500  ·  info@18knailboutique.com
        </p>
      </motion.div>
    </section>
  );
}
