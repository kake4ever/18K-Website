'use client';

import { motion } from 'motion/react';

const gallery = [
  { src: '/images/gallery-1.jpg', label: 'Chrome Minimalism' },
  { src: '/images/gallery-2.jpg', label: 'Marble & Gold' },
  { src: '/images/gallery-3.jpg', label: 'Modern French' },
  { src: '/images/gallery-4.jpg', label: 'Signature Art' },
  { src: '/images/gallery-5.jpg', label: 'Aurora Gel' },
  { src: '/images/gallery-6.jpg', label: 'Galaxy Art' },
];

export default function Gallery() {
  return (
    <section id="gallery" className="py-24 lg:py-36 px-6 lg:px-10 bg-pearl">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6"
        >
          <div>
            <p className="text-[10px] tracking-[0.4em] uppercase text-deepgold mb-3">Our Work</p>
            <h2 className="font-display text-4xl lg:text-5xl font-light text-warmblack leading-tight">
              Crafted with <em className="gradient-gold not-italic italic font-normal">intention.</em>
            </h2>
          </div>
          <a
            href="https://www.instagram.com/18k.nailboutique"
            target="_blank"
            rel="noopener"
            className="inline-block text-[11px] tracking-[0.25em] uppercase border border-warmblack px-6 py-3 hover:bg-warmblack hover:text-pearl transition-all rounded-sm w-fit"
          >
            @18k.nailboutique
          </a>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {gallery.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.8, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className={`group relative overflow-hidden cursor-pointer ${
                i === 0 || i === 4 ? 'col-span-2 aspect-[16/10]' : 'aspect-square'
              }`}
            >
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.06]"
                style={{ backgroundImage: `url(${item.src})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-warmblack/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-5">
                <span className="font-display text-sm text-pearl font-light">{item.label}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
