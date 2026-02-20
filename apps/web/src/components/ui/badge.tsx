import { cn } from "@/lib/utils";
import {
  Flame,
  Candy,
  Leaf,
  Citrus,
  Beef,
  Sparkles,
  Scale,
  Search,
  Salad,
  Coffee,
  Heart,
  type LucideIcon,
} from "lucide-react";

// Map category labels to icons
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "HEAT SEEKER": Flame,
  "SWEET TOOTH": Candy,
  "HERB LOVER": Leaf,
  "CITRUS FAN": Citrus,
  "UMAMI HUNTER": Beef,
  "FLAVOR EXPLORER": Sparkles,
  "BALANCED PALATE": Scale,
  "STILL DISCOVERING": Search,
  "FRESH ENTHUSIAST": Salad,
  "BOLD & BITTER": Coffee,
  "COMFORT CRAVER": Heart,
};

// Fallback icon
const DEFAULT_ICON = Search;

interface BadgeProps {
  icon?: LucideIcon;
  label: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "selected" | "muted";
  className?: string;
}

export function Badge({
  icon: Icon,
  label,
  size = "md",
  variant = "default",
  className,
}: BadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-3 py-1.5 text-sm gap-1.5",
    lg: "px-4 py-2 text-base gap-2",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const variantClasses = {
    default: "bg-raised border-border text-text-primary",
    selected: "bg-accent-yellow border-accent-yellow text-black",
    muted: "bg-raised/50 border-border/50 text-text-secondary opacity-60",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {Icon && <Icon className={iconSizes[size]} />}
      <span>{label}</span>
    </span>
  );
}

interface CategoryBadgeProps {
  category: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CategoryBadge({ category, size = "md", className }: CategoryBadgeProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const iconSizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  // Get the icon for this category, or use the default
  const Icon = CATEGORY_ICONS[category.toUpperCase()] ?? DEFAULT_ICON;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="p-3 bg-accent-yellow/10 rounded-full">
        <Icon className={cn(iconSizeClasses[size], "text-accent-yellow")} strokeWidth={2} />
      </div>
      <span
        className={cn(
          "font-bold uppercase tracking-wider text-text-primary",
          sizeClasses[size]
        )}
      >
        {category}
      </span>
    </div>
  );
}

// Taste tag types and their icons
type TasteTag = "purist" | "heat" | "citrus" | "sweet" | "herby" | "savory";

const TASTE_TAG_CONFIG: Record<TasteTag, { icon: LucideIcon; label: string }> = {
  purist: { icon: Sparkles, label: "Purist" },
  heat: { icon: Flame, label: "Heat" },
  citrus: { icon: Citrus, label: "Citrus" },
  sweet: { icon: Candy, label: "Sweet" },
  herby: { icon: Leaf, label: "Herby" },
  savory: { icon: Beef, label: "Savory" },
};

interface TasteTagBadgeProps {
  tag: TasteTag;
  size?: "sm" | "md";
}

export function TasteTagBadge({ tag, size = "sm" }: TasteTagBadgeProps) {
  const config = TASTE_TAG_CONFIG[tag];
  return (
    <Badge
      icon={config.icon}
      label={config.label}
      size={size}
    />
  );
}

export { TASTE_TAG_CONFIG, type TasteTag };
