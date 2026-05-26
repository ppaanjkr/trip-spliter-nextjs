type LoadingProps = {
  text?: string;
};

export default function Loading({ text = "Loading..." }: LoadingProps) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-slate-500">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-100 border-t-pink-500" />
      <div className="text-sm">{text}</div>
    </div>
  );
}