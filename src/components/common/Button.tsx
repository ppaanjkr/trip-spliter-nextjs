import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  full?: boolean;
};

export default function Button({
  children,
  className,
  variant = "primary",
  full = false,
  disabled,
  ...props
}: ButtonProps) {
  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-pink-500 text-white shadow-sm hover:bg-pink-600 active:scale-[0.98]",
    secondary:
      "bg-white text-pink-600 border border-pink-100 hover:bg-pink-50 active:scale-[0.98]",
    danger:
      "bg-red-500 text-white shadow-sm hover:bg-red-600 active:scale-[0.98]",
    ghost:
      "bg-transparent text-slate-600 hover:bg-slate-100 active:scale-[0.98]",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        full && "w-full",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}