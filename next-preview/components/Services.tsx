'use client';

import { motion } from 'motion/react';

type Service = {
  num: string;
  name: string;
  desc: string;
  from: string;
  span: string; // grid classes
  featured?: boolean;
};

const services: Service[] = [
  {
    num: '01',
    name: 'Signature Manicures',
    desc: 'The house rituals — Honey & Milk, The Calm, Rose Petal. Each treatment a slow, sensory experience.',
    from: 'From $45',
    span: 'md:col-span-4 md:row-span-2',
    featured: true,
  },
  {
    num: '02',
    name: 'Signature Pedicures',
    desc: 'Champagne & Rose, 18K Golden Aura — cinematic pedicures with lasting effect.',
    from: 'From $80',
    span: 'md:col-span-2 md:row-span-2',
  },
  {
    num: '03',
    name: 'Manicures',
    desc: 'Classic to gel — structured nail care with a refined finish.',
    from: 'From $30',
    span: 'md:col-span-2',
  },
  {
    num: '04',
    name: 'Pedicures',
    desc: 'From essential care to signature spa rituals.',
    from: 'From $35',
    span: 'md:col-span-2',
  },
  {
    num: '05',
    name: 'Enhancements',
    desc: 'Gel-X, Structured Gel & Dipping Powder — 10-day warranty.',
    from: 'From $70',
    span: 'md:col-span-2',
  },
];

export default function Services() {
  return (
    <section
      id="services"
      className="py-24 lg:py-36 px-6 lg:px-10 bg-warmblack relative overflow-hidden"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-deepgold/40 to-transparent" />
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] pointer-events-none opacity-40"
        style={{
          background:
            'radial-gradient(circle, rgba(184,150,78,0.18) 0%, transparent 55%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-4xl mx-auto text-center mb-16 relative z-10"
      >
        <p className="text-[10px] tracking-[0.5em] uppercase text-softgold mb-4">
          — The Menu —
        </p>
        <h2 className="font-display text-4xl lg:text-6xl font-light text-pearl leading-tight mb-4">
          Thoughtfully performed with{' '}
          <em className="gradient-gold not-italic italic font-normal">premium</em> products.
        </h2>
      </motion.div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-6 md:auto-rows-[13rem] gap-4">
        {services.map((service, i) => (
          <motion.a
            key={service.num}
            href="https://booking.18knailboutique.com/webstoreNew/services"
            target="_blank"
            rel="noopener"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className={`group beam-parent shine-parent ${service.span} rounded-sm p-8 lg:p-10 flex flex-col justify-between bg-blacksoft border border-deepgold/15 hover:border-deepgold/60 transition-colors`}
          >
            <span className="shine" />
            <div className="flex items-start justify-between">
              <span className="font-display text-xs tracking-[0.4em] text-softgold/70">
                {service.num}
              </span>
              {service.featured && (
                <span className="text-[9px] tracking-[0.35em] uppercase text-softgold/70 border border-softgold/30 px-2 py-1 rounded-sm">
                  Signature
                </span>
              )}
            </div>
            <div>
              <h3
                className={`font-display font-light text-pearl mb-3 leading-tight ${
                  service.featured ? 'text-4xl lg:text-5xl' : 'text-2xl lg:text-3xl'
                }`}
              >
                {service.name}
              </h3>
              <p className="text-sm text-taupe font-light leading-relaxed max-w-md">
                {service.desc}
              </p>
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-deepgold/10">
                <span className="font-display text-sm text-softgold">{service.from}</span>
                <span className="text-softgold group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
