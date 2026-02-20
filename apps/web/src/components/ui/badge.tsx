import { cn } from "@/lib/utils";

interface BadgeProps {
  emoji?: string;
  label: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "selected" | "muted";
  className?: string;
}

export function Badge({
  emoji,
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
      {emoji && <span>{emoji}</span>}
      <span>{label}</span>
    </span>
  );
}

interface CategoryBadgeProps {
  emoji: string;
  label: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CategoryBadge({ emoji, label, size = "md", className }: CategoryBadgeProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const emojiSizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <span className={emojiSizeClasses[size]}>{emoji}</span>
      <span
        className={cn(
          "font-bold uppercase tracking-wider text-text-primary",
          sizeClasses[size]
        )}
      >
        {label}
      </span>
    </div>
  );
}
