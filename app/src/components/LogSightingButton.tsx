export function LogSightingButton() {
  return (
    <button
      disabled
      className="w-full py-3 rounded-lg border-2 border-stone-200 text-stone-400 text-sm font-medium cursor-not-allowed bg-stone-50 flex items-center justify-center gap-2"
      title="Sighting logs coming soon"
    >
      ☐ Log sighting
    </button>
  );
}
