import { cn } from "@/lib/utils";

type ToastProps = {
  show: boolean;
  message: string;
};

export default function Toast({ show, message }: ToastProps) {
  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-800 px-4 py-2 text-sm text-white shadow-lg transition",
        show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      )}
    >
      {message}
    </div>
  );
}