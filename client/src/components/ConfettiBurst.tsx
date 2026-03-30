import { useMemo, type CSSProperties } from "react";

const COLORS = ["#1a3a5c", "#10b981", "#3b82f6", "#f97316", "#facc15"];

export default function ConfettiBurst({ active }: { active: boolean }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 28 }, (_, index) => ({
        id: index,
        left: 4 + ((index * 13) % 92),
        color: COLORS[index % COLORS.length],
        rotate: (index * 37) % 360,
        offset: ((index % 2 === 0 ? 1 : -1) * (60 + (index % 7) * 18)),
        duration: 1800 + (index % 5) * 180,
        delay: (index % 6) * 55,
      })),
    []
  );

  if (!active) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {pieces.map(piece => (
        <span
          key={piece.id}
          className="confetti-piece"
          style={
            {
              left: `${piece.left}%`,
              backgroundColor: piece.color,
              transform: `rotate(${piece.rotate}deg)`,
              animationDuration: `${piece.duration}ms`,
              animationDelay: `${piece.delay}ms`,
              "--confetti-x": `${piece.offset}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
