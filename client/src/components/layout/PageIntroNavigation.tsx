import PageBackButton from "@/components/layout/PageBackButton";
import PageBreadcrumbs from "@/components/layout/PageBreadcrumbs";
import type { BreadcrumbItem } from "@/lib/navigation";

interface PageIntroNavigationProps {
  breadcrumbs: BreadcrumbItem[];
  breadcrumbAriaLabel: string;
  backLabel: string;
  backAriaLabel: string;
}

export default function PageIntroNavigation({
  breadcrumbs,
  breadcrumbAriaLabel,
  backLabel,
  backAriaLabel,
}: PageIntroNavigationProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <PageBackButton label={backLabel} ariaLabel={backAriaLabel} />
      <PageBreadcrumbs items={breadcrumbs} ariaLabel={breadcrumbAriaLabel} />
    </div>
  );
}
