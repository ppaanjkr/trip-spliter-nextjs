import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export default function Input({
  label,
  error,
  className,
  ...props
}: InputProps) {
  return (
    <div>
      {label && <label className="form-label">{label}</label>}

      <input
        className={cn(
          "form-input",
          error && "border-red-300 focus:border-red-300 focus:ring-red-100",
          className
        )}
        {...props}
      />

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}