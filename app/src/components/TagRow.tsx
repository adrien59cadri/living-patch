import { Link } from 'react-router-dom';
import type { Species } from '../types';
import {
  formLabel,
  habitatLabel,
  dietLabel,
  behaviorLabel,
  activeMonthsLabel,
} from '../lib/labels';
import { KeystoneBadge } from './KeystoneBadge';

function TagLink({ to, children }: { to?: string; children: React.ReactNode }) {
  if (!to) return <>{children}</>;
  return (
    <Link to={to} className="hover:opacity-75 transition-opacity rounded-full">
      {children}
    </Link>
  );
}

interface TagProps {
  label: string;
  variant?: 'form' | 'habitat' | 'diet' | 'behavior' | 'season';
}

function Tag({ label, variant = 'season' }: TagProps) {
  const variantStyles = {
    form: 'bg-amber-100 text-amber-800',
    habitat: 'bg-emerald-100 text-emerald-700',
    diet: 'bg-orange-100 text-orange-700',
    behavior: 'bg-cyan-100 text-cyan-700',
    season: 'bg-stone-100 text-stone-600',
  };

  return (
    <span className={`inline-block text-xs ${variantStyles[variant]} px-2 py-0.5 rounded-full`}>
      {label}
    </span>
  );
}

interface FormTagProps {
  form: string;
}

export function FormTag({ form }: FormTagProps) {
  return <Tag label={formLabel(form)} variant="form" />;
}

interface TagRowProps {
  species: Species;
  linkable?: boolean;
}

export function TagRow({ species, linkable }: TagRowProps) {
  const seasonChip = activeMonthsLabel(species.active_months);

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      <TagLink to={linkable ? `/?form=${species.form}` : undefined}>
        <FormTag form={species.form} />
      </TagLink>
      {species.is_keystone && (
        <TagLink
          to={linkable && species.keystone_type ? `/?keystone_type=${species.keystone_type}` : undefined}
        >
          <KeystoneBadge type={species.keystone_type} />
        </TagLink>
      )}
      {(species.habitat ?? []).map(h => (
        <TagLink key={h} to={linkable ? `/?habitat=${h}` : undefined}>
          <Tag label={habitatLabel(h)} variant="habitat" />
        </TagLink>
      ))}
      {(species.diet ?? []).map(d => (
        <Tag key={d} label={dietLabel(d)} variant="diet" />
      ))}
      {(species.behavior ?? []).map(b => (
        <Tag key={b} label={behaviorLabel(b)} variant="behavior" />
      ))}
      {seasonChip && <Tag label={seasonChip} variant="season" />}
    </div>
  );
}
