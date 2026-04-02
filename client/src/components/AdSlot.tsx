import { useEffect, useRef, useState } from "react";

type AdFormat = "auto" | "rectangle" | "horizontal" | "vertical";

interface AdSlotProps {
  /** Unique ID for this ad placement (e.g. "ads-top", "ads-result") */
  id?: string;
  /** CSS class for outer wrapper */
  className?: string;
  /** Minimum height to reserve space and avoid CLS */
  minHeight?: number;
  /** Ad format hint for AdSense */
  format?: AdFormat;
  /** Data ad slot from AdSense */
  slot?: string;
}

const AD_CLIENT = "ca-pub-3377250238500968";

const isProductionHost =
  typeof window !== "undefined" &&
  ["datasuteis.com.br", "www.datasuteis.com.br"].includes(
    window.location.hostname
  );

/**
 * AdSlot renders a manual AdSense ad unit.
 * Uses IntersectionObserver for lazy loading to avoid blocking the main thread.
 * Reserves vertical space via minHeight to prevent CLS.
 */
export default function AdSlot({
  id,
  className,
  minHeight = 120,
  format = "auto",
  slot,
}: AdSlotProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const pushedRef = useRef(false);

  /* Lazy-load: only activate when the slot scrolls into the viewport */
  useEffect(() => {
    const node = containerRef.current;
    if (!node || !isProductionHost) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  /* Push adsbygoogle once visible */
  useEffect(() => {
    if (!isVisible || pushedRef.current || !isProductionHost) return;
    pushedRef.current = true;

    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push(
        {}
      );
    } catch {
      /* AdSense not loaded yet – Auto Ads will fill if available */
    }
  }, [isVisible]);

  /* In dev/staging, show a placeholder so layout is still visible */
  if (!isProductionHost) {
    return (
      <div
        id={id}
        className={`ad-slot-placeholder ${className ?? ""}`}
        style={{ minHeight }}
        aria-hidden="true"
      >
        <span className="text-xs text-muted-foreground opacity-50">
          [Ad Slot: {id ?? "auto"}]
        </span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      id={id}
      className={`ad-slot ${className ?? ""}`}
      style={{ minHeight }}
      aria-hidden="true"
    >
      {isVisible && (
        <ins
          className="adsbygoogle"
          style={{ display: "block", minHeight }}
          data-ad-client={AD_CLIENT}
          data-ad-slot={slot ?? ""}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      )}
    </div>
  );
}
