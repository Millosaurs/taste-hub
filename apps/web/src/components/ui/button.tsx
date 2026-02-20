import type { VariantProps } from "class-variance-authority";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "font-medium text-sm",
    "border border-border rounded-[14px]",
    "transition-all duration-75 ease-out",
    "shadow-[4px_4px_0px_#1A1A1A]",
    "hover:-translate-y-[1px] hover:shadow-[5px_5px_0px_#1A1A1A]",
    "active:translate-y-[3px] active:shadow-[0px_0px_0px_#1A1A1A]",
    "disabled:pointer-events-none disabled:opacity-50",
    "select-none outline-none",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "bg-accent-yellow text-white border-accent-yellow",
          "hover:bg-accent-yellow/90",
        ].join(" "),
        ghost: [
          "bg-transparent text-text-primary border-border",
          "hover:bg-raised",
        ].join(" "),
        danger: [
          "bg-accent-red text-white border-accent-red",
          "hover:bg-accent-red/90",
          "shadow-[0_0_24px_rgba(255,68,68,0.25)]",
        ].join(" "),
        success: [
          "bg-accent-green text-white border-accent-green",
          "hover:bg-accent-green/90",
        ].join(" "),
        outline: [
          "bg-transparent text-text-primary border-border",
          "hover:bg-raised hover:border-accent-yellow",
        ].join(" "),
        selected: [
          "bg-accent-yellow text-white border-accent-yellow",
          "shadow-[0px_0px_0px_#1A1A1A] translate-y-[3px]",
          "hover:translate-y-[3px] hover:shadow-[0px_0px_0px_#1A1A1A]",
        ].join(" "),
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ComponentProps<typeof ButtonPrimitive>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

function Button({
  className,
  variant = "ghost",
  size = "default",
  loading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="size-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants };
