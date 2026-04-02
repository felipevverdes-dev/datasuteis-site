import { Link } from "wouter";
import type { BreadcrumbItem } from "@/lib/navigation";

interface PageBreadcrumbsProps {
  items: BreadcrumbItem[];
  ariaLabel: string;
}

export default function PageBreadcrumbs({
  items,
  ariaLabel,
}: PageBreadcrumbsProps) {
  return (
    <nav
      className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
      aria-label={ariaLabel}
    >
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isCurrentPage = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
              {item.href && !isCurrentPage ? (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-foreground"
                >
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  className={isCurrentPage ? "font-medium text-foreground" : undefined}
                  aria-current={isCurrentPage ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
              {index < items.length - 1 ? (
                <span aria-hidden="true" className="text-muted-foreground/50">
                  /
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
