import type { Species } from '../types';
import ExampleSpeciesLink from './ExampleSpeciesLink';

interface Props {
  expanded: string | null;
  onToggle: (key: string | null) => void;
  speciesById: Map<string, Species>;
}

interface DependencyRow {
  key: string;
  label: string;
  summary: string;
  detail: string;
  exampleSourceIds: string[];
  exampleTargetIds: string[];
}

const ROWS: DependencyRow[] = [
  {
    key: 'larval',
    label: 'Caterpillar Host Plants',
    summary: 'Many butterflies can only reproduce where one specific plant grows.',
    detail:
      'Butterfly caterpillars are often highly selective: they can only eat the leaves of specific host plants. If those plants disappear from a landscape, the butterfly disappears with them — no matter how many nectar flowers are available. This specialist dependency is the primary reason butterfly populations crash when native plants are cleared, even when the habitat looks "green." Restoring host plants is more important for butterfly conservation than planting nectar flowers.',
    exampleSourceIds: [
      'insect_monarch-butterfly',
      'insect_zebra-swallowtail',
      'insect_baltimore-checkerspot',
      'insect_spicebush-swallowtail',
      'insect_silver-bordered-fritillary',
      'insect_red-admiral',
    ],
    exampleTargetIds: [
      'plant_common-milkweed',
      'plant_pawpaw',
      'plant_white-turtlehead',
      'plant_spicebush',
      'plant_common-violet',
      'plant_stinging-nettle',
    ],
  },
  {
    key: 'mycorrhizal',
    label: 'Mycorrhizal Networks',
    summary: 'Most native plants depend on invisible soil fungi to survive.',
    detail:
      'Beneath every forest floor and meadow, a vast fungal network connects plant roots to soil nutrients. Arbuscular Mycorrhizal Fungi (AMF) partner with roughly 80% of land plants — wildflowers, shrubs, grasses — helping them absorb phosphorus and water in exchange for plant sugars. Ectomycorrhizal Fungi (EMF) form the backbone of forest tree networks, connecting oaks, beeches, and birches in shared nutrient webs. Oak and beech seedlings that cannot connect to EMF have dramatically reduced survival. This is why garlic mustard is so destructive: it doesn\'t just crowd out plants — it exudes chemicals that dissolve the fungal network all native plants depend on, collapsing the invisible infrastructure of the whole forest community.',
    exampleSourceIds: [
      'plant_white-oak',
      'plant_northern-red-oak',
      'plant_american-beech',
      'plant_common-milkweed',
      'plant_goldenrod',
      'plant_new-england-aster',
    ],
    exampleTargetIds: ['fungus_ectomycorrhizal', 'fungus_arbuscular-mycorrhizal'],
  },
  {
    key: 'invasive-advantage',
    label: 'Why Invasive Plants Win',
    summary: 'Invasive plants often succeed by being mutualist-independent or by destroying partner networks.',
    detail:
      'Native plants evolved in close partnership with local fungi, pollinators, and soil organisms. Many cannot grow without these partners — which makes them vulnerable when the partners disappear. Invasive plants often carry a key advantage: they are less dependent on specific mutualist partners, or they actively destroy the partnerships native plants need. Garlic mustard is the starkest example: its allelopathic root chemicals disrupt both AM and ectomycorrhizal fungal networks, starving native oaks, wildflowers, and shrubs of their fungal partners. As native plants weaken, garlic mustard expands — a self-reinforcing cycle that makes it one of the most ecologically destructive invasives in NE PA forests.',
    exampleSourceIds: ['plant_garlic-mustard'],
    exampleTargetIds: ['fungus_arbuscular-mycorrhizal', 'fungus_ectomycorrhizal'],
  },
];

function getSpecies(ids: string[], speciesById: Map<string, Species>): Species[] {
  return ids.flatMap(id => {
    const s = speciesById.get(id);
    return s ? [s] : [];
  });
}

export default function SpecialistDependenciesSection({ expanded, onToggle, speciesById }: Props) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-bold text-stone-800">Specialist Dependencies</h2>
        <p className="text-sm text-stone-600 mt-1">
          Many species cannot survive without a specific partner — a particular plant, fungus, or
          soil network. These invisible dependencies determine where species can live, why native
          communities are fragile, and why invasives can be so destructive.
        </p>
      </div>

      <div>
        {ROWS.map(row => {
          const isExpanded = expanded === row.key;
          const sources = getSpecies(row.exampleSourceIds, speciesById);
          const targets = getSpecies(row.exampleTargetIds, speciesById);

          return (
            <div key={row.key}>
              <button
                onClick={() => onToggle(isExpanded ? null : row.key)}
                className="w-full flex items-start gap-2 py-1.5 px-2 hover:bg-stone-100/70 rounded-md transition-colors text-left"
              >
                <span className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-stone-700">{row.label}</span>
                  <span className="block text-xs text-stone-500 italic mt-0.5">{row.summary}</span>
                </span>
                <span className="text-xs text-stone-300 flex-shrink-0 mt-1">
                  {isExpanded ? '▾' : '▸'}
                </span>
              </button>

              {isExpanded && (
                <div className="pl-4 pb-2">
                  <p className="text-xs text-stone-500 leading-relaxed px-2 pb-2">{row.detail}</p>
                  {sources.length > 0 && (
                    <div className="px-2 pb-1">
                      <span className="text-xs text-stone-400 font-medium">Dependents: </span>
                      <span className="text-xs text-stone-500">
                        {sources.map((s, idx) => (
                          <span key={s.id}>
                            <ExampleSpeciesLink species={s} />
                            {idx < sources.length - 1 && (
                              <span className="text-stone-400">, </span>
                            )}
                          </span>
                        ))}
                      </span>
                    </div>
                  )}
                  {targets.length > 0 && (
                    <div className="px-2 pb-1">
                      <span className="text-xs text-stone-400 font-medium">Partners: </span>
                      <span className="text-xs text-stone-500">
                        {targets.map((s, idx) => (
                          <span key={s.id}>
                            <ExampleSpeciesLink species={s} />
                            {idx < targets.length - 1 && (
                              <span className="text-stone-400">, </span>
                            )}
                          </span>
                        ))}
                      </span>
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
