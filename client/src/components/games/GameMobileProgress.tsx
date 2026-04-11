import { cn } from "@/lib/utils";

interface GameMobileProgressProps {
  value: number;
  label: string;
  className?: string;
}

export default function GameMobileProgress({
  value,
  label,
  className,
}: GameMobileProgressProps) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div
      className={cn("game-mobile-progress", className)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safeValue}
    >
      <div className="game-progress-track">
        <div
          className="game-progress-fill"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}
