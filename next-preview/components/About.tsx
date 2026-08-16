'use client';

import { motion } from 'motion/react';

export default function About() {
  return (
    <section id="about" className="py-24 lg:py-36 px-6 lg:px-10 bg-pearl">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative aspect-[3/4] overflow-hidden"
        >
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: 'url(/images/about.jpg)' }}
          />
          <div className="absolute -top-4 -right-4 w-20 h-20 border border-deepgold/25" />
          <div className="absolute -bottom-4 -left-4 w-20 h-20 border border-deepgold/25" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        >
          <p className="text-[10px] tracking-[0.4em] uppercase text-deepgold mb-6 font-light">
            The 18K Philosophy
          </p>
          <h2 className="font-display text-4xl lg:text-5xl font-light text-warmblack leading-tight mb-8">
            Where calm meets <em className="gradient-gold not-italic italic font-normal">precision.</em>
          </h2>
          <p className="text-sm lg:text-base text-taupe font-light leading-relaxed mb-6">
            We believe nail care should feel intentional — a moment of quiet luxury in your day. Every detail, from our individually sanitized tools to our boutique atmosphere, is designed to honor your time and comfort.
          </p>

          <ul className="space-y-3 mb-10">
            {[
              'Disposable liners for every pedicure',
              'Individually sanitized tool sets',
              'Advanced Gel-X & hard gel techniques',
              'Complimentary refreshments',
            ].map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.08 }}
                className="flex items-center gap-3 text-sm text-warmblack font-light"
              >
                <span className="w-2 h-2 border border-deepgold rotate-45" />
                {item}
              </motion.li>
            ))}
          </ul>

          <a
            href="#services"
            className="inline-block text-[11px] tracking-[0.25em] uppercase border border-warmblack px-8 py-3 text-warmblack hover:bg-warmblack hover:text-pearl transition-all rounded-sm"
          >
            Our Story
          </a>
        </motion.div>
      </div>
    </section>
  );
}
