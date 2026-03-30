import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useLocation } from "wouter";
import { useI18n } from "@/contexts/LanguageContext";
import type { PageSectionNavItem } from "@/lib/page-sections";

interface FloatingSectionNavProps {
  items: PageSectionNavItem[];
  topLabel: string;
}

const DEFAULT_STICKY_OFFSET = 16;
const PAGE_END_THRESHOLD = 48;

function resolveStickyOffset() {
  const header = document.querySelector("header");
  const headerHeight =
    header instanceof HTMLElement
      ? Math.round(header.getBoundingClientRect().height)
      : 0;
  return headerHeight + DEFAULT_STICKY_OFFSET;
}

export default function FloatingSectionNav({
  items,
  topLabel,
}: FloatingSectionNavProps) {
  const { language } = useI18n();
  const [location] = useLocation();
  const firstPrimaryFocusDoneRef = useRef(false);
  const stickyOffsetRef = useRef(DEFAULT_STICKY_OFFSET);
  const visibleRatiosRef = useRef<Map<string, number>>(new Map());
  const [stickyOffset, setStickyOffset] = useState(DEFAULT_STICKY_OFFSET);
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);
  const [availableItems, setAvailableItems] =
    useState<PageSectionNavItem[]>(items);
  const [isAtPageEnd, setIsAtPageEnd] = useState(false);
  const labels =
    language === "en"
      ? { more: "more", back: "back", controls: "Page controls" }
      : language === "es"
        ? { more: "más", back: "volver", controls: "Controles de página" }
        : { more: "mais", back: "voltar", controls: "Controles da página" };

  useEffect(() => {
    firstPrimaryFocusDoneRef.current = false;
  }, [location]);

  useEffect(() => {
    function updateStickyOffset() {
      const nextOffset = resolveStickyOffset();
      stickyOffsetRef.current = nextOffset;
      setStickyOffset(current =>
        current === nextOffset ? current : nextOffset
      );
    }

    updateStickyOffset();

    const header = document.querySelector("header");
    if (!(header instanceof HTMLElement)) {
      return;
    }

    if (typeof ResizeObserver === "function") {
      const observer = new ResizeObserver(() => {
        updateStickyOffset();
      });
      observer.observe(header);
      window.addEventListener("resize", updateStickyOffset);

      return () => {
        observer.disconnect();
        window.removeEventListener("resize", updateStickyOffset);
      };
    }

    window.addEventListener("resize", updateStickyOffset);
    return () => {
      window.removeEventListener("resize", updateStickyOffset);
    };
  }, []);

  useEffect(() => {
    const nextItems = items.filter(item => document.getElementById(item.id));
    const itemOrder = new Map(
      nextItems.map((item, index) => [item.id, index] as const)
    );

    setAvailableItems(nextItems);
    visibleRatiosRef.current.clear();

    if (!nextItems.length) {
      setActiveId(null);
      return;
    }

    setActiveId(current =>
      current && nextItems.some(item => item.id === current)
        ? current
        : nextItems[0].id
    );

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            visibleRatiosRef.current.set(
              entry.target.id,
              entry.intersectionRatio
            );
          } else {
            visibleRatiosRef.current.delete(entry.target.id);
          }
        });

        const nextActiveId = Array.from(
          visibleRatiosRef.current.entries()
        ).sort((left, right) => {
          if (right[1] !== left[1]) {
            return right[1] - left[1];
          }

          return (
            (itemOrder.get(left[0]) ?? Number.MAX_SAFE_INTEGER) -
            (itemOrder.get(right[0]) ?? Number.MAX_SAFE_INTEGER)
          );
        })[0]?.[0];

        if (nextActiveId) {
          setActiveId(nextActiveId);
        }
      },
      {
        rootMargin: `-${Math.max(stickyOffset + 8, 72)}px 0px -55% 0px`,
        threshold: [0.15, 0.35, 0.6],
      }
    );

    nextItems.forEach(item => {
      const target = document.getElementById(item.id);
      if (target) {
        observer.observe(target);
      }
    });

    return () => {
      visibleRatiosRef.current.clear();
      observer.disconnect();
    };
  }, [items, stickyOffset]);

  useEffect(() => {
    let frameId = 0;

    function updateViewportState() {
      frameId = 0;
      const viewportBottom = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      setIsAtPageEnd(viewportBottom >= documentHeight - PAGE_END_THRESHOLD);
    }

    function requestViewportUpdate() {
      if (frameId) {
        return;
      }

      frameId = window.requestAnimationFrame(updateViewportState);
    }

    updateViewportState();
    window.addEventListener("scroll", requestViewportUpdate, { passive: true });
    window.addEventListener("resize", requestViewportUpdate);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener("scroll", requestViewportUpdate);
      window.removeEventListener("resize", requestViewportUpdate);
    };
  }, []);

  const navItems = useMemo(() => availableItems, [availableItems]);

  if (!navItems.length) {
    return null;
  }

  function scrollToSection(sectionId: string) {
    const target = document.getElementById(sectionId);
    if (!target) {
      return;
    }

    setActiveId(sectionId);
    const top =
      window.scrollY +
      target.getBoundingClientRect().top -
      stickyOffsetRef.current;
    window.scrollTo({
      top: Math.max(0, top),
      behavior: "smooth",
    });
  }

  function isFullyVisible(target: HTMLElement) {
    const rect = target.getBoundingClientRect();
    return (
      rect.top >= stickyOffsetRef.current &&
      rect.bottom <= window.innerHeight - 16
    );
  }

  function scrollToTarget(target: HTMLElement) {
    const top =
      window.scrollY +
      target.getBoundingClientRect().top -
      stickyOffsetRef.current;
    window.scrollTo({
      top: Math.max(0, top),
      behavior: "smooth",
    });
  }

  function focusPrimaryAreaOnceOrScroll(sectionId: string) {
    const primaryFocusTarget =
      document.querySelector<HTMLElement>("[data-floating-focus]");

    if (primaryFocusTarget && !firstPrimaryFocusDoneRef.current) {
      firstPrimaryFocusDoneRef.current = true;
      if (!isFullyVisible(primaryFocusTarget)) {
        scrollToTarget(primaryFocusTarget);
        return;
      }
    }

    const isDesktop = window.innerWidth >= 1024;
    const isGamePage = location.startsWith("/jogos/");

    if (isDesktop && isGamePage && !firstPrimaryFocusDoneRef.current) {
      const focusTarget =
        document.querySelector<HTMLElement>("[data-game-focus]") ??
        document.getElementById("ferramenta");
      if (focusTarget) {
        firstPrimaryFocusDoneRef.current = true;
        scrollToTarget(focusTarget);
        return;
      }
    }

    scrollToSection(sectionId);
  }

  const activeIndex = Math.max(
    0,
    navItems.findIndex(item => item.id === activeId)
  );
  const nextItem =
    navItems[Math.min(activeIndex + 1, navItems.length - 1)] ?? navItems[0];
  const actionLabel = isAtPageEnd ? labels.back : labels.more;

  return (
    <nav className="floating-section-nav" aria-label={labels.controls}>
      <button
        type="button"
        onClick={() =>
          isAtPageEnd
            ? window.scrollTo({ top: 0, behavior: "smooth" })
            : activeIndex >= navItems.length - 1
              ? window.scrollTo({
                  top: Math.min(
                    document.documentElement.scrollHeight,
                    window.scrollY + window.innerHeight * 0.72
                  ),
                  behavior: "smooth",
                })
              : focusPrimaryAreaOnceOrScroll(nextItem.id)
        }
        className="floating-section-row"
        aria-label={actionLabel}
        title={actionLabel}
      >
        <span className="floating-section-row-icon">
          {isAtPageEnd ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </span>
        <span>{actionLabel}</span>
      </button>
    </nav>
  );
}
