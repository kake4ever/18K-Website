'use client';

import { motion, useScroll, useSpring, useTransform, MotionValue } from 'motion/react';
import { useRef } from 'react';

/* Curated set — we duplicate so each row has enough content */
const IMAGES = [
  '/images/gallery-1.jpg',
  '/images/gallery-2.jpg',
  '/images/gallery-3.jpg',
  '/images/gallery-4.jpg',
  '/images/gallery-5.jpg',
  '/images/gallery-6.jpg',
];

const row1 = [IMAGES[0], IMAGES[1], IMAGES[2], IMAGES[3], IMAGES[4]];
const row2 = [IMAGES[5], IMAGES[0], IMAGES[3], IMAGES[2], IMAGES[1]];
const row3 = [IMAGES[4], IMAGES[5], IMAGES[1], IMAGES[3], IMAGES[0]];

function Card({
  src,
  translate,
}: {
  src: string;
  translate: MotionValue<number>;
}) {
  return (
    <motion.div
      style={{ x: translate }}
      whileHover={{ y: -14 }}
      transition={{ type: 'spring', stiffness: 200, damping: 18 }}
      className="group/product relative shrink-0 h-64 md:h-80 w-[18rem] md:w-[24rem] overflow-hidden rounded-sm"
    >
      <div
        className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover/product:scale-105"
        style={{ backgroundImage: `url(${src})` }}
      />
      <div className="absolute inset-0 bg-warmblack/0 group-hover/product:bg-warmblack/40 transition-colors pointer-events-none" />
    </motion.div>
  );
}

export default function Gallery() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const springCfg = { stiffness: 300, damping: 30, bounce: 100 };

  const translateX = useSpring(useTransform(scrollYProgress, [0, 1], [0, 900]), springCfg);
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -900]),
    springCfg
  );
  const rotateX = useSpring(useTransform(scrollYProgress, [0, 0.2], [16, 0]), springCfg);
  const rotateZ = useSpring(useTransform(scrollYProgress, [0, 0.2], [20, 0]), springCfg);
  const translateY = useSpring(useTransform(scrollYProgress, [0, 0.2], [-700, 200]), springCfg);
  const opacity = useSpring(useTransform(scrollYProgress, [0, 0.2], [0.2, 1]), springCfg);

  return (
    <section
      id="gallery"
      ref={ref}
      className="h-[260vh] py-40 overflow-hidden bg-pearl [perspective:1000px] [transform-style:preserve-3d]"
    >
      <motion.div
        style={{ rotateX, rotateZ, translateY, opacity }}
        className="max-w-7xl mx-auto px-6 lg:px-10 mb-14"
      >
        <p className="text-[10px] tracking-[0.5em] uppercase text-deepgold mb-4">— Our Work —</p>
        <h2 className="font-display text-4xl lg:text-6xl font-light text-warmblack leading-tight max-w-3xl">
          Crafted with <em className="gradient-gold not-italic italic font-normal">intention.</em>
        </h2>
        <p className="text-sm text-taupe font-light mt-6 max-w-lg">
          Each piece a small work of art — scroll to explore recent looks from our chairs.
        </p>
      </motion.div>

      <motion.div style={{ rotateX, rotateZ, translateY, opacity }}>
        <div className="flex flex-row-reverse gap-4 mb-6">
          {row1.map((src, i) => (
            <Card key={`r1-${i}`} src={src} translate={translateX} />
          ))}
        </div>
        <div className="flex gap-4 mb-6">
          {row2.map((src, i) => (
            <Card key={`r2-${i}`} src={src} translate={translateXReverse} />
          ))}
        </div>
        <div className="flex flex-row-reverse gap-4">
          {row3.map((src, i) => (
            <Card key={`r3-${i}`} src={src} translate={translateX} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
