import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

function getRouteKey(path: string) {
  return path.split("#")[0] ?? path;
}

function scrollToHash(hash: string) {
  if (!hash) {
    return false;
  }

  const target = document.getElementById(hash.replace(/^#/, ""));
  if (!target) {
    return false;
  }

  target.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}

export default function RouteBehavior() {
  const [location, navigate] = useLocation();
  const positionsRef = useRef<Map<string, number>>(new Map());
  const previousLocationRef = useRef(location);
  const navigationModeRef = useRef<"push" | "pop">("push");

  useEffect(() => {
    if (!("scrollRestoration" in window.history)) {
      return;
    }

    const previousValue = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previousValue;
    };
  }, []);

  useEffect(() => {
    function handlePopState() {
      positionsRef.current.set(
        getRouteKey(previousLocationRef.current),
        window.scrollY
      );
      navigationModeRef.current = "pop";
    }

    function handleDocumentClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) {
        return;
      }

      if (
        (anchor.target && anchor.target !== "_self") ||
        anchor.hasAttribute("download") ||
        anchor.getAttribute("rel") === "external"
      ) {
        return;
      }

      const url = new URL(anchor.href, window.location.href);
      if (
        url.origin !== window.location.origin ||
        url.pathname.startsWith("/api/")
      ) {
        return;
      }

      const nextPath = `${url.pathname}${url.search}${url.hash}`;
      const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (nextPath === currentPath) {
        if (url.hash) {
          event.preventDefault();
          void scrollToHash(url.hash);
        }
        return;
      }

      positionsRef.current.set(
        getRouteKey(previousLocationRef.current),
        window.scrollY
      );
      navigationModeRef.current = "push";
      event.preventDefault();
      navigate(nextPath);
    }

    window.addEventListener("popstate", handlePopState);
    document.addEventListener("click", handleDocumentClick);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [navigate]);

  useEffect(() => {
    const routeKey = getRouteKey(location);
    const previousRouteKey = getRouteKey(previousLocationRef.current);
    const hashIndex = location.indexOf("#");
    const hash = hashIndex >= 0 ? location.slice(hashIndex) : "";

    if (previousRouteKey !== routeKey) {
      positionsRef.current.set(previousRouteKey, window.scrollY);
    }

    const handle = window.requestAnimationFrame(() => {
      if (hash && scrollToHash(hash)) {
        previousLocationRef.current = location;
        navigationModeRef.current = "push";
        return;
      }

      if (navigationModeRef.current === "pop") {
        window.scrollTo({
          top: positionsRef.current.get(routeKey) ?? 0,
          behavior: "auto",
        });
      } else {
        window.scrollTo({ top: 0, behavior: "auto" });
      }

      previousLocationRef.current = location;
      navigationModeRef.current = "push";
    });

    return () => {
      window.cancelAnimationFrame(handle);
    };
  }, [location]);

  return null;
}
