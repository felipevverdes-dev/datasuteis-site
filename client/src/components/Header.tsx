import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Menu, Moon, Sun, X } from "lucide-react";
import Brand from "@/components/Brand";
import {
  HeaderInfoCluster,
  useHeaderInfoClusterData,
} from "@/components/header/HeaderInfoCluster";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useI18n } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  getHeaderNavigation,
  getNavigationLabels,
  type HeaderNavigationDropdown,
  type HeaderNavigationItem,
} from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

function normalizePath(path: string) {
  if (path === "/") {
    return "/";
  }

  const [pathname] = path.split("?");
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDesktopDropdownId, setOpenDesktopDropdownId] = useState<
    string | null
  >(null);
  const [openMobileDropdowns, setOpenMobileDropdowns] = useState<
    Record<string, boolean>
  >({});
  const navRef = useRef<HTMLElement | null>(null);
  const closeDropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const desktopItemRefs = useRef<Array<HTMLAnchorElement | HTMLButtonElement | null>>(
    []
  );
  const dropdownItemRefs = useRef<
    Record<string, Array<HTMLAnchorElement | null>>
  >({});
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { language } = useI18n();
  const labels = getNavigationLabels(language);
  const headerInfo = useHeaderInfoClusterData();
  const navItems = useMemo(() => getHeaderNavigation(language), [language]);
  const currentPath = normalizePath(location);
  const hideLanguageSwitcher =
    currentPath.startsWith("/jogos/") && currentPath !== "/jogos/";
  const themeButtonAriaLabel =
    theme === "dark" ? labels.openLightTheme : labels.openDarkTheme;
  const menuButtonAriaLabel = isMenuOpen
    ? labels.closeNavigation
    : labels.openNavigation;

  useEffect(() => {
    setIsMenuOpen(false);
    if (closeDropdownTimeoutRef.current) {
      clearTimeout(closeDropdownTimeoutRef.current);
      closeDropdownTimeoutRef.current = null;
    }
    setOpenDesktopDropdownId(null);
    setOpenMobileDropdowns({});
  }, [currentPath]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        navRef.current &&
        event.target instanceof Node &&
        !navRef.current.contains(event.target)
      ) {
        if (closeDropdownTimeoutRef.current) {
          clearTimeout(closeDropdownTimeoutRef.current);
          closeDropdownTimeoutRef.current = null;
        }
        setOpenDesktopDropdownId(null);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (closeDropdownTimeoutRef.current) {
          clearTimeout(closeDropdownTimeoutRef.current);
          closeDropdownTimeoutRef.current = null;
        }
        setOpenDesktopDropdownId(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (closeDropdownTimeoutRef.current) {
        clearTimeout(closeDropdownTimeoutRef.current);
      }
    };
  }, []);

  function isItemActive(item: HeaderNavigationItem) {
    return item.match(currentPath);
  }

  function setDesktopItemRef(
    index: number,
    element: HTMLAnchorElement | HTMLButtonElement | null
  ) {
    desktopItemRefs.current[index] = element;
  }

  function registerDropdownItemRef(
    dropdownId: string,
    index: number,
    element: HTMLAnchorElement | null
  ) {
    if (!dropdownItemRefs.current[dropdownId]) {
      dropdownItemRefs.current[dropdownId] = [];
    }

    dropdownItemRefs.current[dropdownId][index] = element;
  }

  function focusDesktopItem(index: number) {
    const targetIndex = (index + navItems.length) % navItems.length;
    desktopItemRefs.current[targetIndex]?.focus();
  }

  function focusDropdownItem(dropdownId: string, index: number) {
    const items = dropdownItemRefs.current[dropdownId] ?? [];
    if (!items.length) {
      return;
    }

    const targetIndex = (index + items.length) % items.length;
    items[targetIndex]?.focus();
  }

  function cancelDesktopDropdownClose() {
    if (closeDropdownTimeoutRef.current) {
      clearTimeout(closeDropdownTimeoutRef.current);
      closeDropdownTimeoutRef.current = null;
    }
  }

  function setDesktopDropdownState(dropdownId: string | null) {
    cancelDesktopDropdownClose();
    setOpenDesktopDropdownId(dropdownId);
  }

  function scheduleDesktopDropdownClose() {
    cancelDesktopDropdownClose();
    closeDropdownTimeoutRef.current = setTimeout(() => {
      setOpenDesktopDropdownId(null);
      closeDropdownTimeoutRef.current = null;
    }, 300);
  }

  function openDesktopDropdown(dropdownId: string, focusIndex?: number) {
    setDesktopDropdownState(dropdownId);
    if (typeof focusIndex === "number") {
      window.requestAnimationFrame(() => {
        focusDropdownItem(dropdownId, focusIndex);
      });
    }
  }

  function toggleMobileDropdown(dropdownId: string) {
    setOpenMobileDropdowns(current => ({
      ...current,
      [dropdownId]: !current[dropdownId],
    }));
  }

  function handleTopLevelKeyDown(
    event: React.KeyboardEvent<HTMLAnchorElement | HTMLButtonElement>,
    item: HeaderNavigationItem,
    index: number
  ) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusDesktopItem(index + 1);
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusDesktopItem(index - 1);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      focusDesktopItem(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      focusDesktopItem(navItems.length - 1);
      return;
    }

    if (item.type !== "dropdown") {
      return;
    }

    if (
      event.key === "Enter" ||
      event.key === " " ||
      event.key === "ArrowDown"
    ) {
      event.preventDefault();
      openDesktopDropdown(item.id, 0);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      openDesktopDropdown(item.id, item.items.length - 1);
    }
  }

  function handleDropdownKeyDown(
    event: React.KeyboardEvent<HTMLAnchorElement>,
    dropdown: HeaderNavigationDropdown,
    itemIndex: number,
    topLevelIndex: number
  ) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusDropdownItem(dropdown.id, itemIndex + 1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusDropdownItem(dropdown.id, itemIndex - 1);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      focusDropdownItem(dropdown.id, 0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      focusDropdownItem(dropdown.id, dropdown.items.length - 1);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      setDesktopDropdownState(null);
      focusDesktopItem(topLevelIndex + 1);
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setDesktopDropdownState(null);
      focusDesktopItem(topLevelIndex - 1);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setDesktopDropdownState(null);
      focusDesktopItem(topLevelIndex);
    }
  }

  return (
    <header
      role="banner"
      className="sticky top-0 z-50 border-b border-border/70 bg-background/95"
    >
      <div className="container mx-auto px-1 lg:px-2">
        <div className="grid min-h-20 min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1 py-3 sm:gap-2 lg:gap-4">
          <Brand href="/" className="min-w-0 justify-self-start" />

          <nav
            ref={navRef}
            role="navigation"
            aria-label={labels.primaryNavigation}
            className="hidden flex-nowrap items-center justify-center gap-1 px-2 xl:flex lg:gap-4"
          >
            {navItems.map((item, index) => {
              const active = isItemActive(item);
              const desktopItemClassName = cn(
                "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-secondary"
              );

              if (item.type === "link") {
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    ref={element => setDesktopItemRef(index, element)}
                    className={desktopItemClassName}
                    onKeyDown={event => handleTopLevelKeyDown(event, item, index)}
                    title={item.label}
                  >
                    <span>{item.label}</span>
                  </a>
                );
              }

              const isOpen = openDesktopDropdownId === item.id;

              return (
                <div
                  key={item.id}
                  className="group relative shrink-0"
                  onMouseEnter={() => setDesktopDropdownState(item.id)}
                  onMouseLeave={scheduleDesktopDropdownClose}
                >
                  <button
                    type="button"
                    ref={element => setDesktopItemRef(index, element)}
                    className={desktopItemClassName}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    aria-controls={`${item.id}-desktop-menu`}
                    onClick={() =>
                      setDesktopDropdownState(
                        openDesktopDropdownId === item.id ? null : item.id
                      )
                    }
                    onKeyDown={event => handleTopLevelKeyDown(event, item, index)}
                    title={item.label}
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform duration-200",
                        isOpen ? "rotate-180" : ""
                      )}
                    />
                  </button>

                  <div
                    className={cn(
                      "absolute left-0 top-full z-50 pt-2 transition-all duration-200",
                      isOpen
                        ? "pointer-events-auto opacity-100 translate-y-0"
                        : "pointer-events-none opacity-0 -translate-y-2 group-hover:pointer-events-auto group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0"
                    )}
                  >
                    <div
                      id={`${item.id}-desktop-menu`}
                      role="menu"
                      aria-label={item.label}
                      className="min-w-64 overflow-hidden rounded-2xl border border-border/70 bg-card p-2 shadow-xl"
                    >
                      {item.items.map((subItem, subIndex) => (
                        <a
                          key={subItem.id}
                          href={subItem.href}
                          ref={element =>
                            registerDropdownItemRef(item.id, subIndex, element)
                          }
                          role="menuitem"
                          className="block rounded-xl px-4 py-3 text-sm transition-colors hover:bg-secondary"
                          onKeyDown={event =>
                            handleDropdownKeyDown(event, item, subIndex, index)
                          }
                          title={subItem.label}
                        >
                          {subItem.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="flex min-w-0 max-w-full items-center justify-self-end gap-1 sm:gap-2">
            <div className="min-w-0">
              <HeaderInfoCluster 
                mode="desktop" 
                data={headerInfo} 
              />
            </div>

            {!hideLanguageSwitcher ? (
              <div className="min-w-0 shrink-0">
                <LanguageSwitcher />
              </div>
            ) : null}

            <button
              type="button"
              onClick={toggleTheme}
              className="min-w-0 shrink-0 rounded-full border border-border p-2 text-foreground transition-colors hover:bg-secondary sm:p-2.5"
              aria-label={themeButtonAriaLabel}
              title={labels.toggleTheme}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            <button
              type="button"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-background transition-colors hover:bg-secondary xl:hidden"
              onClick={() => setIsMenuOpen(current => !current)}
              aria-label={menuButtonAriaLabel}
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {isMenuOpen ? (
          <nav
            id="mobile-navigation"
            role="navigation"
            aria-label={labels.mobileNavigation}
            className="flex flex-col gap-2 border-t border-border py-4 xl:hidden"
          >
            {navItems.map(item => {
              const active = isItemActive(item);

              if (item.type === "link") {
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary"
                    )}
                    title={item.label}
                  >
                    {item.label}
                  </a>
                );
              }

              const isOpen = Boolean(openMobileDropdowns[item.id]);

              return (
                <div key={item.id} className="rounded-2xl border border-border/70">
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition-colors",
                      active || isOpen ? "bg-secondary" : "hover:bg-secondary"
                    )}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    aria-controls={`${item.id}-mobile-menu`}
                    onClick={() => toggleMobileDropdown(item.id)}
                    title={item.label}
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isOpen ? "rotate-180" : ""
                      )}
                    />
                  </button>

                  <div
                    id={`${item.id}-mobile-menu`}
                    role="menu"
                    aria-label={item.label}
                    className={cn(
                      "overflow-hidden transition-all duration-300 ease-in-out",
                      isOpen ? "max-h-96 pb-2 opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <div className="space-y-1 px-2">
                      {item.items.map(subItem => (
                        <a
                          key={subItem.id}
                          href={subItem.href}
                          role="menuitem"
                          className="block rounded-xl px-4 py-3 text-sm transition-colors hover:bg-secondary"
                          title={subItem.label}
                        >
                          {subItem.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>
        ) : null}
      </div>
    </header>
  );
}
