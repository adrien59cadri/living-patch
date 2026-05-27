import { getKeystoneLabel } from '../lib/designTokens';

interface Props {
  type: string | null | undefined;
}

export function KeystoneBadge({ type }: Props) {
  if (!type) return null;
  const label = getKeystoneLabel(type);
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-medium whitespace-nowrap">
      {label}
    </span>
  );
}
