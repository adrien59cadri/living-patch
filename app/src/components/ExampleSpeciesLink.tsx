import { Link } from 'react-router';
import { getCommonName } from '../lib/labels';
import type { Species } from '../types';

interface ExampleSpeciesLinkProps {
  species: Species;
}

export default function ExampleSpeciesLink({ species }: ExampleSpeciesLinkProps) {
  return (
    <Link
      to={`/species/${species.id}`}
      className="text-emerald-600 hover:underline font-medium"
    >
      {getCommonName(species.common_name)}
    </Link>
  );
}
