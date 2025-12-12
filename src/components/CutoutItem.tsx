import Link from 'next/link';

function generateClipPath(seed: number) {
  let s = seed;
  const random = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  const jitter = 6;

  const t1 = random() * jitter; const t2 = random() * jitter;
  const r1 = 100 - random() * jitter; const r2 = 100 - random() * jitter;
  const b1 = 100 - random() * jitter; const b2 = 100 - random() * jitter;
  const l1 = random() * jitter; const l2 = random() * jitter;

  return `polygon(
    ${t1}% ${t2}%, 50% 0%, ${r1}% ${t1}%,
    100% 50%, ${r2}% ${r1}%, ${r1}% ${b2}%,
    50% 100%, ${b1}% ${r2}%, ${l2}% ${b1}%,
    0% 50%, ${l1}% ${l2}%
  )`;
}

interface ItemProps {
  item: {
    id: string;
    title: string;
    price: string;
    image_url: string;
    product_url: string;
    rotation: number;
    seed: number;
  };
  onDelete: () => void;
}

export default function CutoutItem({ item, onDelete }: ItemProps) {
  const clipPath = generateClipPath(item.seed);

  return (
    <div className="relative group z-0 font-body" style={{ transform: `rotate(${item.rotation}deg)` }}>

      {/* DELETE BUTTON */}
      <button
        onClick={(e) => {
          e.preventDefault();
          if (confirm('Rip this page out?')) onDelete();
        }}
        className="absolute -top-4 -right-4 w-8 h-8 bg-crayon-red text-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-50 hover:bg-red-700 font-bold font-sans"
        title="Delete Item"
      >
        X
      </button>

      {/* THE CUTOUT ITEM (Glued Look) */}
      <div className="transition-transform group-hover:scale-105 group-hover:z-10 relative">

        {/* THE GLUE STAIN */}
        <div
          className="absolute inset-0 bg-stone-400 opacity-20 mix-blend-multiply blur-[2px]"
          style={{ clipPath: clipPath, transform: 'scale(1.02)' }}
        ></div>

        <Link href={item.product_url} target="_blank" className="block relative">

          {/* The Paper Itself */}
          <div className="bg-paper-cream bg-crumpled-paper p-2 shadow-sm relative" style={{ clipPath: clipPath }}>

            {/* Image */}
            <div className="relative h-64 w-full overflow-hidden bg-white/50">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover mix-blend-multiply filter contrast-125 brightness-95"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-stone-400 font-bold rotate-[-5deg] opacity-50 font-title text-2xl">
                  No Photo
                </div>
              )}
              <div className="absolute inset-0 bg-sepia-[.2] mix-blend-overlay pointer-events-none"></div>
            </div>

            {/* Title */}
            <div className="p-4 pt-6 pb-12 text-center">
              <h3 className="text-2xl font-title font-bold leading-tight text-stone-800 line-clamp-3 text-ellipsis">
                {item.title}
              </h3>
            </div>

            {/* PRICE MARKER TEXT */}
            <div className="absolute bottom-5 right-4 z-30 transform rotate-[-6deg]">
              <span
                className="font-title text-5xl text-crayon-red leading-none block"
                style={{
                  // 1. Make color slightly transparent like real ink
                  opacity: 0.9,
                  // 2. Blend it into the paper (so texture shows through the red)
                  mixBlendMode: 'multiply',
                  // 3. Use text-shadow to THICKEN the lines (simulate felt tip)
                  textShadow: '0px 0px 1px rgba(230, 90, 90, 1), 1px 1px 0px rgba(230, 90, 90, 0.8)'
                }}
              >
                {item.price}
              </span>
            </div>

          </div>
        </Link>
      </div>
    </div>
  );
}