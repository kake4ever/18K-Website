const items = [
  'Signature Manicures',
  'Rose Petal',
  'Golden Aura',
  'Champagne & Rose',
  'Gel-X Extensions',
  'Dipping Powder',
  'The Calm',
  'Aromatherapy Ritual',
];

export default function Marquee() {
  return (
    <div className="bg-warmblack py-8 overflow-hidden border-y border-deepgold/15 relative">
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            'linear-gradient(90deg, #1A1714 0%, transparent 8%, transparent 92%, #1A1714 100%)',
        }}
      />
      <div
        className="relative"
        style={{ perspective: '600px', perspectiveOrigin: 'center' }}
      >
        <div
          className="flex gap-14 animate-marquee w-max"
          style={{ transform: 'rotateX(6deg)', transformStyle: 'preserve-3d' }}
        >
          {[...items, ...items, ...items].map((item, i) => (
            <span
              key={i}
              className="font-display text-lg md:text-2xl font-light tracking-[0.35em] uppercase text-pearl/40 whitespace-nowrap flex items-center gap-14"
            >
              {item}
              <span className="text-deepgold text-[0.5rem]">◆</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
