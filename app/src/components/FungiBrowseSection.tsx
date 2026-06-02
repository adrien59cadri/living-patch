import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Species } from '../types';
import { buildFormTaxonomyTree } from '../lib/taxonomyUtils';
import { TaxonomyTree } from './TaxonomyTree';
import { formIcon } from '../lib/labels';
import { getCommonName } from '../lib/labels';

interface Props {
  form: string;
  speciesById: Map<string, Species>;
  taxonomicGroups: Species[];
}

/**
 * Generic taxonomy browser for any organism form with taxonomic groupings.
 * Currently used for fungi; can be extended to other forms with taxonomy data.
 */
export function FormTaxonomyBrowser({ form, speciesById, taxonomicGroups }: Props) {
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const speciesOfForm = Array.from(speciesById.values()).filter(s => s.form === form);
  const taxonomyNodes = buildFormTaxonomyTree(Array.from(speciesById.values()), taxonomicGroups, form);

  if (speciesOfForm.length === 0 || taxonomyNodes.length === 0) {
    return null;
  }

  const selectedSpeciesData = selectedSpecies ? speciesById.get(selectedSpecies) : null;

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-6">
      <div className="mb-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 w-full text-left"
        >
          <span className="text-2xl">{formIcon(form)}</span>
          <h2 className="text-xl font-semibold text-stone-800 flex-1">{form.charAt(0).toUpperCase() + form.slice(1)}</h2>
          <span className="text-sm text-stone-500">{speciesOfForm.length} species</span>
          <span className="text-stone-400">{expanded ? '▼' : '▶'}</span>
        </button>
      </div>

      {expanded && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Left: Taxonomy tree */}
            <div>
              <h3 className="text-sm font-semibold text-stone-700 mb-3">Taxonomy</h3>
              <TaxonomyTree
                nodes={taxonomyNodes}
                onSelectSpecies={setSelectedSpecies}
                expandedByDefault={false}
              />
            </div>

            {/* Right: Selected species details or all fungi list */}
            <div>
              <h3 className="text-sm font-semibold text-stone-700 mb-3">
                {selectedSpeciesData ? 'Selected Species' : `All ${form} Species`}
              </h3>
              {selectedSpeciesData ? (
                <div className="bg-stone-50 rounded-lg p-4 space-y-3">
                  <div>
                    <Link
                      to={`/species/${selectedSpeciesData.id}`}
                      className="text-base font-semibold text-emerald-600 hover:text-emerald-700 underline"
                    >
                      {getCommonName(selectedSpeciesData.common_name)}
                    </Link>
                    {selectedSpeciesData.latin_name && (
                      <p className="text-sm text-stone-500 italic mt-1">
                        {selectedSpeciesData.latin_name}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-stone-600">
                    {selectedSpeciesData.functional_description}
                  </p>
                  {selectedSpeciesData.habitat && selectedSpeciesData.habitat.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-stone-700 mb-1">Habitats:</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedSpeciesData.habitat.map(h => (
                          <span
                            key={h}
                            className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => setSelectedSpecies(null)}
                    className="text-sm text-stone-500 hover:text-stone-700 underline"
                  >
                    ← Back to all {form}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {speciesOfForm.map(f => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedSpecies(f.id)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-stone-100 transition-colors text-sm"
                    >
                      <p className="font-medium text-stone-800">{getCommonName(f.common_name)}</p>
                      {f.latin_name && (
                        <p className="text-xs text-stone-500 italic">{f.latin_name}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
