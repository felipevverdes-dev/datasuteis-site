interface AdSlotProps {
  className?: string;
  minHeight?: number;
}

export default function AdSlot({ className: _className, minHeight: _minHeight = 120 }: AdSlotProps) {
  // Auto Ads is configured globally in the document head.
  // This component stays as a no-op to preserve page composition without
  // rendering manual ad blocks that would conflict with Auto Ads.
  return null;
}
