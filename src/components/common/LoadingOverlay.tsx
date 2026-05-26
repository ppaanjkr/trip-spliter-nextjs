export default function LoadingOverlay({
  block = true,
}: {
  block?: boolean;
}) {
  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 ${
        block ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <div className="rounded-lg px-4 py-2">
        <img src="/loading.svg" alt="loading" />
      </div>
    </div>
  );
}