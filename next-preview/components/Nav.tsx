'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'About', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-warmblack/85 backdrop-blur-lg border-b border-deepgold/20 py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between">
          <a href="#" className="font-display text-xl tracking-[0.4em] text-softgold font-light">
            18K
          </a>

          <ul className="hidden md:flex gap-10 list-none">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-[11px] font-light tracking-[0.25em] uppercase text-pearl/60 hover:text-softgold transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-5">
            <a
              href="https://booking.18knailboutique.com/webstoreNew/giftcards/eca2792d-2bbb-4789-be99-6a263c609925"
              target="_blank"
              rel="noopener"
              className="text-[10px] tracking-[0.3em] uppercase text-pearl/40 hover:text-softgold transition-colors"
            >
              Gift Cards
            </a>
            <a
              href="https://booking.18knailboutique.com/webstoreNew/services"
              target="_blank"
              rel="noopener"
              className="text-[10px] tracking-[0.25em] uppercase px-5 py-2.5 border border-softgold text-softgold hover:bg-deepgold hover:text-pearl hover:border-deepgold transition-all rounded-sm"
            >
              Book Now
            </a>
          </div>

          <button
            className="md:hidden text-softgold"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-warmblack flex flex-col items-center justify-center gap-8 md:hidden"
          >
            {links.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="font-display text-3xl text-pearl tracking-wider"
              >
                {link.label}
              </motion.a>
            ))}
            <motion.a
              href="https://booking.18knailboutique.com/webstoreNew/services"
              target="_blank"
              rel="noopener"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-6 text-xs tracking-[0.3em] uppercase px-8 py-3 border border-softgold text-softgold"
            >
              Book Now
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
