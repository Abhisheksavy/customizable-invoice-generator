import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const variants = {
  primary: "bg-ink text-white shadow-card hover:bg-ink-soft",
  accent: "bg-brand text-white shadow-card hover:bg-brand-strong",
  secondary: "border border-line-strong bg-surface text-ink shadow-card hover:bg-surface-muted",
  ghost: "text-ink-soft hover:bg-ink/5 hover:text-ink",
  danger: "bg-danger text-white shadow-card hover:bg-danger/90",
};

const sizes = {
  sm: "h-9 px-3 text-sm sm:h-8",
  md: "h-11 px-4 text-sm sm:h-10",
  lg: "h-12 px-5 text-base",
  icon: "size-11 sm:size-10",
  "icon-sm": "size-9 sm:size-8",
};

export interface ButtonStyleOptions {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
}

/** Button classes, shared by <Button> and links that should look like buttons. */
export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: ButtonStyleOptions = {}) {
  return cn(
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap transition-colors select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
    variants[variant],
    sizes[size],
    className,
  );
}

export type ButtonProps = ComponentProps<"button"> & ButtonStyleOptions;

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonStyles({ variant, size, className })} {...props} />;
}
