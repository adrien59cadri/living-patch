interface Props {
  type: string | null | undefined;
}

const keystone_labels: Record<string, string> = {
  ecosystem_engineer: '⚙️ Ecosystem Engineer',
  predator: '🦅 Keystone Predator',
  structural: '🌳 Structural Keystone',
  host_plant: '🌿 Host Plant',
  pollinator: '🐝 Keystone Pollinator',
  mutualist: '🤝 Keystone Mutualist',
  prey: '🍒 Keystone Prey',
};

export function KeystoneBadge({ type }: Props) {
  if (!type) return null;
  const label = keystone_labels[type] ?? '⭐ Keystone';
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-medium whitespace-nowrap">
      {label}
    </span>
  );
}
