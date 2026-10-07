export default function Footer() {
  return (
    <footer id="contact" className="bg-warmblack border-t border-deepgold/20 pt-16 pb-8 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-1">
            <span className="font-display text-3xl tracking-[0.4em] text-softgold font-light block mb-4">18K</span>
            <p className="text-sm text-taupe font-light leading-relaxed max-w-[280px]">
              Modern nail artistry, designed with intention. Santa Monica&apos;s premier luxury nail boutique.
            </p>
            <div className="flex gap-4 mt-6">
              {['IG', 'FB', 'TT', 'YP'].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="text-[10px] tracking-[0.15em] text-taupe hover:text-softgold transition-colors"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] tracking-[0.3em] uppercase text-softgold mb-5">Services</h4>
            <ul className="space-y-2">
              {['Manicures', 'Pedicures', 'Signature Rituals', 'Enhancements'].map((s) => (
                <li key={s}>
                  <a href="#services" className="text-sm text-taupe hover:text-pearl transition-colors">
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] tracking-[0.3em] uppercase text-softgold mb-5">Boutique</h4>
            <ul className="space-y-2">
              {['About', 'Gallery', 'Contact', 'Gift Cards'].map((s) => (
                <li key={s}>
                  <a href="#about" className="text-sm text-taupe hover:text-pearl transition-colors">
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] tracking-[0.3em] uppercase text-softgold mb-5">Visit Us</h4>
            <ul className="space-y-2 text-sm text-taupe">
              <li>1323 Lincoln Blvd, Ste 101</li>
              <li>Santa Monica, CA 90401</li>
              <li>
                <a href="tel:4242385500" className="hover:text-pearl transition-colors">
                  (424) 238-5500
                </a>
              </li>
              <li>
                <a href="mailto:info@18knailboutique.com" className="hover:text-pearl transition-colors">
                  info@18knailboutique.com
                </a>
              </li>
              <li className="text-xs mt-3">Mon–Sat 10–7 · Sun 10–5</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-deepgold/10 flex flex-col md:flex-row justify-between gap-4 text-xs text-taupe">
          <span>© 2026 18K Nail Boutique. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-pearl transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-pearl transition-colors">Terms &amp; Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
