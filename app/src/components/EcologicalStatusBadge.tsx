import type { EcologicalStatus } from '../types';
import { ECOLOGICAL_STATUS_COLORS, ECOLOGICAL_STATUS_LABELS } from '../lib/designTokens';

interface Props {
  status: EcologicalStatus | string | null | undefined;
}

export function EcologicalStatusBadge({ status }: Props) {
  if (!status) return null;
  const label = ECOLOGICAL_STATUS_LABELS[status] ?? status;
  const bg = ECOLOGICAL_STATUS_COLORS[status] ?? '#888888';
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap text-white"
      style={{ backgroundColor: bg }}
    >
      {label}
    </span>
  );
}
