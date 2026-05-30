import { useSpeciesSightings } from '../hooks/useLifeList';
import { formatDate } from '../lib/lifeListUtils';

interface Props {
  speciesId: string;
  limit?: number;
}

const WEATHER_ICONS: Record<string, string> = {
  sunny: '☀',
  cloudy: '☁',
  rainy: '🌧',
  snowy: '❄',
};

const TIME_ICONS: Record<string, string> = {
  morning: '🌅',
  afternoon: '☀',
  evening: '🌆',
  night: '🌙',
};

export function RecentSightings({ speciesId, limit = 3 }: Props) {
  const allSightings = useSpeciesSightings(speciesId);

  if (allSightings.length === 0) return null;

  const sightings = [...allSightings]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-2">
        Recent sightings
        <span className="ml-2 text-stone-300 normal-case font-normal">
          ({allSightings.length} total)
        </span>
      </div>
      <ul className="space-y-2">
        {sightings.map(s => (
          <li key={s.id} className="flex items-start gap-2 text-sm">
            <span className="text-stone-300 shrink-0 mt-0.5">•</span>
            <div className="min-w-0">
              <span className="font-medium text-stone-700">{formatDate(s.date)}</span>
              {s.location && (
                <span className="text-stone-500"> · {s.location}</span>
              )}
              {(s.conditions?.weather || s.conditions?.time) && (
                <span className="text-stone-400 ml-1">
                  {s.conditions.weather ? WEATHER_ICONS[s.conditions.weather] : ''}
                  {s.conditions.time ? TIME_ICONS[s.conditions.time] : ''}
                </span>
              )}
              {s.notes && (
                <p className="text-stone-500 text-xs mt-0.5 truncate">{s.notes}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
