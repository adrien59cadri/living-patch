interface Props {
  onClick: () => void;
}

export function LogSightingButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="w-full py-3 rounded-lg border-2 border-emerald-300 text-emerald-700 text-sm font-medium bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-400 transition-colors flex items-center justify-center gap-2"
    >
      ☐ Log sighting
    </button>
  );
}
