import { ChevronDown } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveSecondarySectionProps {
  id?: string;
  title: string;
  summaryText?: string;
  className?: string;
  contentClassName?: string;
  defaultOpenMobile?: boolean;
  children: ReactNode;
}

function getDesktopState() {
  if (typeof window === "undefined") {
    return true;
  }

  return window.matchMedia("(min-width: 1024px)").matches;
}

export default function ResponsiveSecondarySection({
  id,
  title,
  summaryText,
  className,
  contentClassName,
  defaultOpenMobile = false,
  children,
}: ResponsiveSecondarySectionProps) {
  const [isDesktop, setIsDesktop] = useState(getDesktopState);
  const [mobileOpen, setMobileOpen] = useState(defaultOpenMobile);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const updateDesktopState = (event?: MediaQueryListEvent) => {
      setIsDesktop(event ? event.matches : mediaQuery.matches);
    };

    updateDesktopState();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateDesktopState);
      return () => {
        mediaQuery.removeEventListener("change", updateDesktopState);
      };
    }

    mediaQuery.addListener(updateDesktopState);
    return () => {
      mediaQuery.removeListener(updateDesktopState);
    };
  }, []);

  useEffect(() => {
    if (!isDesktop && defaultOpenMobile) {
      setMobileOpen(true);
    }
  }, [defaultOpenMobile, isDesktop]);

  if (isDesktop) {
    return (
      <section id={id} className={cn("card-base p-6", className)}>
        <header className="mb-4">
          <h2 className="text-2xl font-bold">{title}</h2>
          {summaryText ? (
            <p className="mt-3 text-muted-foreground">{summaryText}</p>
          ) : null}
        </header>
        <div className={contentClassName}>{children}</div>
      </section>
    );
  }

  return (
    <details
      id={id}
      className={cn("game-mobile-disclosure", className)}
      open={mobileOpen}
      onToggle={event => setMobileOpen(event.currentTarget.open)}
    >
      <summary className="game-mobile-disclosure-summary">
        <span className="game-mobile-disclosure-copy">
          <span className="game-mobile-disclosure-title">{title}</span>
          {summaryText ? (
            <span className="game-mobile-disclosure-note">{summaryText}</span>
          ) : null}
        </span>
        <ChevronDown className="game-mobile-disclosure-icon h-4 w-4" />
      </summary>
      <div className={cn("game-mobile-disclosure-content", contentClassName)}>
        {children}
      </div>
    </details>
  );
}
