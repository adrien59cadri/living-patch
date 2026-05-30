import { useState, useMemo } from 'react';
import { useLifeList } from '../hooks/useLifeList';
import { useDataset } from '../hooks/useDataset';
import { groupSightingsByDate, TIER_COLORS } from '../lib/lifeListUtils';
import type { FamiliarityTier, Sighting } from '../types';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

interface DayDetailProps {
  date: string;
  sightings: Sighting[];
  speciesById: Map<string, { common_name: string }>;
  entries: { speciesId: string; tier: FamiliarityTier }[];
  onClose: () => void;
}

function DayDetail({ date, sightings, speciesById, entries, onClose }: DayDetailProps) {
  const [y, m, d] = date.split('-').map(Number);
  const displayDate = new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
  return (
    <div className="mt-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-stone-700">{displayDate}</span>
        <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-lg leading-none" aria-label="Close">×</button>
      </div>
      <ul className="space-y-2">
        {sightings.map(s => {
          const sp = speciesById.get(s.speciesId);
          const entry = entries.find(e => e.speciesId === s.speciesId);
          const tier = entry?.tier;
          const colors = tier ? TIER_COLORS[tier] : null;
          return (
            <li key={s.id} className="flex items-start gap-2 text-sm">
              {colors && (
                <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${colors.bg} border ${colors.border}`} />
              )}
              <div>
                <span className="font-medium text-stone-800">{sp?.common_name ?? s.speciesId}</span>
                {s.location && <span className="text-stone-500"> · {s.location}</span>}
                {s.notes && <p className="text-xs text-stone-400 mt-0.5">{s.notes}</p>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function CalendarView() {
  const { sightings, entries } = useLifeList();
  const { species } = useDataset();

  const speciesById = useMemo(
    () => new Map(species.map(s => [s.id, { common_name: s.common_name }])),
    [species]
  );

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-based
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const byDate = useMemo(() => groupSightingsByDate(sightings), [sightings]);

  // Calendar math
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDate(null);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDate(null);
  }

  const todayStr = today.toISOString().slice(0, 10);

  const selectedSightings = selectedDate ? (byDate[selectedDate] ?? []) : [];

  if (sightings.length === 0) {
    return (
      <div className="text-center py-12 text-stone-400">
        <div className="text-4xl mb-3">📅</div>
        <p className="text-sm">No sightings yet.</p>
        <p className="text-xs mt-1">Log a sighting to see it on the calendar.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors"
          aria-label="Previous month"
        >
          ‹
        </button>
        <h2 className="text-base font-semibold text-stone-700">
          {MONTH_NAMES[month]} {year}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map(d => (
          <div key={d} className="text-center text-xs font-medium text-stone-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-px bg-stone-100 rounded-lg overflow-hidden border border-stone-100">
        {/* Leading empty cells */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-stone-50 h-12" />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const daySightings = byDate[dateStr] ?? [];
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const hasSightings = daySightings.length > 0;

          // Get tier colors for dots
          const tierDots = daySightings
            .map(s => entries.find(e => e.speciesId === s.speciesId)?.tier)
            .filter((t): t is FamiliarityTier => t !== undefined)
            .filter((t, idx, arr) => arr.indexOf(t) === idx) // unique tiers
            .slice(0, 3);

          return (
            <button
              key={day}
              onClick={() => hasSightings ? setSelectedDate(isSelected ? null : dateStr) : undefined}
              disabled={!hasSightings}
              className={[
                'relative bg-white h-12 flex flex-col items-center justify-center gap-0.5 transition-colors text-sm',
                hasSightings ? 'hover:bg-emerald-50 cursor-pointer' : 'cursor-default',
                isSelected ? 'bg-emerald-50 ring-2 ring-inset ring-emerald-400' : '',
                isToday ? 'font-bold text-emerald-700' : 'text-stone-700',
              ].join(' ')}
              aria-label={`${dateStr}${hasSightings ? `, ${daySightings.length} sighting${daySightings.length > 1 ? 's' : ''}` : ''}`}
            >
              <span className={isToday ? 'w-6 h-6 flex items-center justify-center rounded-full bg-emerald-600 text-white text-xs' : 'text-xs'}>
                {day}
              </span>
              {tierDots.length > 0 && (
                <div className="flex gap-0.5">
                  {tierDots.map(tier => (
                    <span
                      key={tier}
                      className={`w-1.5 h-1.5 rounded-full ${TIER_COLORS[tier].bg} border ${TIER_COLORS[tier].border}`}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Day detail */}
      {selectedDate && selectedSightings.length > 0 && (
        <DayDetail
          date={selectedDate}
          sightings={selectedSightings}
          speciesById={speciesById}
          entries={entries}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}
