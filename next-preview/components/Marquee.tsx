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
    <div className="bg-warmblack py-5 overflow-hidden border-y border-deepgold/10">
      <div className="flex gap-10 animate-marquee w-max">
        {[...items, ...items, ...items].map((item, i) => (
          <span
            key={i}
            className="font-display text-sm font-light tracking-[0.3em] uppercase text-taupe whitespace-nowrap flex items-center gap-10"
          >
            {item}
            <span className="text-deepgold text-[0.35rem]">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
