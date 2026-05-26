import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  backHref?: string;
  right?: React.ReactNode;
};

export default function PageHeader({
  title,
  subtitle,
  backHref,
  right,
}: PageHeaderProps) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        {backHref && (
          <Link
            href={backHref}
            className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm"
          >
            <ArrowLeft size={18} />
          </Link>
        )}

        <div>
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          )}
        </div>
      </div>

      {right}
    </div>
  );
}