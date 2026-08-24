import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors transition-transform duration-150 ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marker/40 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-ink text-paper hover:bg-ink-soft",
        marker: "bg-marker text-marker-fg hover:bg-marker/90",
        outline: "border border-line bg-elevated text-ink hover:bg-paper-deep",
        ghost: "text-ink-soft hover:bg-paper-deep",
        danger: "bg-danger text-paper hover:bg-danger/90",
      },
      size: {
        default: "h-10 rounded-md px-4 text-sm",
        sm: "h-8 rounded-sm px-3 text-sm",
        lg: "h-12 rounded-lg px-5 text-base",
        icon: "size-10 rounded-md",
        "icon-sm": "size-8 rounded-sm",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
