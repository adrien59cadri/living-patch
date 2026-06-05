import { CONSERVATION_STATUS_LABELS } from '../lib/designTokens';

const STATUS_STYLES: Record<string, string> = {
  EX: 'bg-stone-800 text-stone-100',
  EW: 'bg-purple-900 text-purple-100',
  CR: 'bg-red-100 text-red-800',
  EN: 'bg-orange-100 text-orange-800',
  VU: 'bg-yellow-100 text-yellow-800',
  NT: 'bg-teal-100 text-teal-800',
  LC: 'bg-green-100 text-green-800',
  DD: 'bg-stone-100 text-stone-600',
};

interface Props {
  status: string | null | undefined;
}

export function ConservationBadge({ status }: Props) {
  if (!status) return null;
  const label = CONSERVATION_STATUS_LABELS[status] ?? status;
  const styles = STATUS_STYLES[status] ?? 'bg-stone-100 text-stone-600';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${styles}`}>
      {label}
    </span>
  );
}
