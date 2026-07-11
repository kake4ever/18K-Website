'use client';

import { motion } from 'motion/react';

const services = [
  { num: '01', name: 'Manicures',       desc: 'Classic to gel — structured nail care with a refined finish.',   from: 'From $30' },
  { num: '02', name: 'Signature Manicures', desc: 'The house rituals — Honey & Milk, The Calm, Rose Petal.',      from: 'From $45' },
  { num: '03', name: 'Pedicures',       desc: 'From essential care to signature spa rituals.',                   from: 'From $35' },
  { num: '04', name: 'Signature Pedicures', desc: 'Aromatherapy Ritual, Champagne & Rose, 18K Golden Aura.',      from: 'From $80' },
  { num: '05', name: 'Enhancements',    desc: 'Gel-X, Structured Gel & Dipping Powder — 10-day warranty.',       from: 'From $70' },
];

export default function Services() {
  return (
    <section id="services" className="py-24 lg:py-36 px-6 lg:px-10 bg-warmblack relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-deepgold/30 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-4xl mx-auto text-center mb-16"
      >
        <p className="text-[10px] tracking-[0.4em] uppercase text-softgold mb-4">Our Services</p>
        <h2 className="font-display text-4xl lg:text-5xl font-light text-pearl leading-tight mb-4">
          Thoughtfully performed with<br />
          <em className="gradient-gold not-italic italic font-normal">premium</em> products.
        </h2>
        <p className="text-sm text-taupe font-light mt-6">
          Every treatment is crafted with care, using only the finest products and proven techniques.
        </p>
      </motion.div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            whileHover={{ y: -6 }}
            className="group relative bg-blacksoft border border-deepgold/15 p-10 lg:p-12 flex flex-col hover:border-deepgold/50 transition-colors"
          >
            <span className="font-display text-xs tracking-[0.4em] text-softgold/60 mb-6">{service.num}</span>
            <h3 className="font-display text-3xl font-light text-pearl mb-3">{service.name}</h3>
            <p className="text-sm text-taupe font-light leading-relaxed flex-1 mb-6">{service.desc}</p>
            <div className="flex items-center justify-between pt-6 border-t border-deepgold/10">
              <span className="font-display text-sm text-softgold">{service.from}</span>
              <span className="text-softgold group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
