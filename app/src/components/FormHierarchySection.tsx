import type { Species } from '../types';
import { FORM_DEFINITIONS, getFormExamples } from '../lib/learnContent';
import { formIcon } from '../lib/labels';
import ExampleSpeciesLink from './ExampleSpeciesLink';

interface FormHierarchySectionProps {
  expanded: string | null;
  onToggle: (form: string | null) => void;
  speciesById: Map<string, Species>;
}

export default function FormHierarchySection({
  expanded,
  onToggle,
  speciesById,
}: FormHierarchySectionProps) {
  const forms = Object.entries(FORM_DEFINITIONS);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-stone-800">Form Hierarchy</h2>
        <p className="text-sm text-stone-600 mt-1">
          Species are classified by their biological form. Click to learn what each means.
        </p>
      </div>

      <div className="space-y-2">
        {forms.map(([formKey, definition]) => {
          const examples = getFormExamples(formKey, speciesById);
          const isExpanded = expanded === formKey;
          const exampleCount = Array.from(speciesById.values()).filter(
            (s) => s.form === formKey && !s.is_group,
          ).length;

          return (
            <div
              key={formKey}
              className="border border-stone-200 rounded-lg p-4 bg-white"
            >
              <button
                onClick={() => onToggle(isExpanded ? null : formKey)}
                className="w-full flex items-start justify-between hover:bg-stone-50 rounded p-2 -m-2"
              >
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl">{formIcon(formKey)}</span>
                  <div className="text-left">
                    <h3 className="font-semibold text-stone-800">{definition.label}</h3>
                    <p className="text-xs text-stone-500">
                      {exampleCount} {exampleCount === 1 ? 'species' : 'species'}
                    </p>
                  </div>
                </div>
                <span className="text-stone-400 text-xl flex-shrink-0">
                  {isExpanded ? '−' : '+'}
                </span>
              </button>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-stone-100 space-y-3">
                  <p className="text-sm text-stone-600 leading-relaxed">
                    {definition.description}
                  </p>

                  {examples.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                        Examples
                      </p>
                      <div className="space-y-1">
                        {examples.map((species) => (
                          <div key={species.id} className="text-sm">
                            <ExampleSpeciesLink species={species} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
