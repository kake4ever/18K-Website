'use client';

import { motion } from 'motion/react';

type Review = { quote: string; name: string; role: string };

const reviews: Review[] = [
  {
    quote:
      'The most refined nail experience in Santa Monica. Attention to detail is unmatched — my gel-x lasted a full four weeks.',
    name: 'Alexa M.',
    role: 'Regular · 3+ years',
  },
  {
    quote:
      'Every time I visit, it feels like a small ritual. The signature manicure is worth every dollar.',
    name: 'Priya S.',
    role: 'Signature Member',
  },
  {
    quote:
      'Quiet, clean, thoughtful. This isn’t a nail salon — it’s a boutique in the truest sense.',
    name: 'Julia K.',
    role: 'Local Resident',
  },
  {
    quote:
      'The staff genuinely cares. My nails have never looked healthier since switching to 18K.',
    name: 'Emma R.',
    role: 'Bride, Fall 2025',
  },
  {
    quote:
      'The Champagne & Rose pedicure is a full sensory reset. I keep coming back for the mood alone.',
    name: 'Sofia L.',
    role: 'Weekly Visitor',
  },
  {
    quote:
      'A rare find. Precision, hygiene, and quiet luxury — exactly what I look for in a boutique service.',
    name: 'Rachel D.',
    role: 'Google Review',
  },
];

function ReviewCard({ quote, name, role }: Review) {
  return (
    <li className="w-[22rem] md:w-[26rem] max-w-full shrink-0 rounded-sm border border-deepgold/20 bg-blacksoft/60 backdrop-blur px-8 py-8 mr-4">
      <div className="text-softgold text-2xl font-display leading-none mb-3">&ldquo;</div>
      <p className="text-sm text-pearl/85 font-light leading-relaxed mb-6">{quote}</p>
      <div className="pt-4 border-t border-deepgold/10">
        <p className="font-display text-base text-pearl">{name}</p>
        <p className="text-[11px] tracking-[0.25em] uppercase text-softgold/70 mt-1">{role}</p>
      </div>
    </li>
  );
}

function Row({
  items,
  direction = 'left',
  duration = '45s',
}: {
  items: Review[];
  direction?: 'left' | 'right';
  duration?: string;
}) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        maskImage:
          'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
      }}
    >
      <ul
        className="flex w-max animate-scroll-x py-4"
        style={{ ['--duration' as string]: duration }}
        data-direction={direction === 'right' ? 'reverse' : undefined}
      >
        {[...items, ...items].map((r, i) => (
          <ReviewCard key={i} {...r} />
        ))}
      </ul>
    </div>
  );
}

export default function Testimonials() {
  const rowA = reviews.slice(0, 3);
  const rowB = reviews.slice(3);

  return (
    <section className="py-24 lg:py-32 px-0 bg-warmblack relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-deepgold/40 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-4xl mx-auto text-center mb-16 px-6"
      >
        <p className="text-[10px] tracking-[0.5em] uppercase text-softgold mb-4">
          — What Guests Say —
        </p>
        <h2 className="font-display text-4xl lg:text-5xl font-light text-pearl leading-tight">
          Trusted by Santa Monica&apos;s{' '}
          <em className="gradient-gold not-italic italic font-normal">most discerning</em>.
        </h2>
      </motion.div>

      <Row items={rowA} direction="left" duration="40s" />
      <div className="h-4" />
      <Row items={rowB} direction="right" duration="50s" />
    </section>
  );
}
