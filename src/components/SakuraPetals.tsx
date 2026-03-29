import { useEffect, useState } from "react";

interface Petal {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
}

export default function SakuraPetals() {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 12,
      duration: 8 + Math.random() * 8,
      size: 6 + Math.random() * 10,
      opacity: 0.3 + Math.random() * 0.5,
    }));
    setPetals(generated);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute animate-sakura-fall"
          style={{
            left: `${p.left}%`,
            top: "-20px",
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            opacity: p.opacity,
          }}
        >
          <svg width={p.size} height={p.size} viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C12 2 8 6 8 10C8 12.2 9.8 14 12 14C14.2 14 16 12.2 16 10C16 6 12 2 12 2Z"
              fill="#ff6b9d"
            />
            <path
              d="M12 2C12 2 16 6 16 10C16 12.2 14.2 14 12 14C9.8 14 8 12.2 8 10C8 6 12 2 12 2Z"
              fill="#ffb3cf"
              opacity="0.6"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}
