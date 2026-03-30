import { Link } from "wouter";
import { cn } from "@/lib/utils";

const BRAND_LOGO_SRC = "/assets/brand/datas-uteis.svg?v=20260311-2";

interface BrandProps {
  href?: string;
  className?: string;
  logoClassName?: string;
  onClick?: () => void;
}

export default function Brand({
  href = "/",
  className,
  logoClassName,
  onClick,
}: BrandProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "inline-flex h-[28px] w-[104px] shrink-0 items-center sm:h-10 sm:w-[148px]",
        className
      )}
      aria-label="Datas Úteis"
      title="Datas Úteis"
    >
      <img
        src={BRAND_LOGO_SRC}
        alt="Datas Úteis"
        width={148}
        height={40}
        loading="eager"
        fetchPriority="high"
        className={cn(
          "block h-[28px] w-[104px] sm:h-10 sm:w-[148px]",
          logoClassName
        )}
        style={{ aspectRatio: "148 / 40" }}
        decoding="async"
      />
    </Link>
  );
}
