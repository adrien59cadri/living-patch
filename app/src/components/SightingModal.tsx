import { useState } from 'react';
import type { Sighting } from '../types';
import { useLifeList } from '../hooks/useLifeList';
import { todayISO } from '../lib/lifeListUtils';

interface Props {
  speciesId: string;
  speciesName: string;
  onClose: () => void;
}

type WeatherCondition = NonNullable<Sighting['conditions']>['weather'];
type TimeOfDay = NonNullable<Sighting['conditions']>['time'];

export function SightingModal({ speciesId, speciesName, onClose }: Props) {
  const { addSighting } = useLifeList();
  const [date, setDate] = useState(todayISO());
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [weather, setWeather] = useState<WeatherCondition | ''>('');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay | ''>('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    const conditions: Sighting['conditions'] = {};
    if (weather) conditions.weather = weather;
    if (timeOfDay) conditions.time = timeOfDay;

    addSighting({
      speciesId,
      date,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      conditions: Object.keys(conditions).length > 0 ? conditions : undefined,
    });

    // Show confirmation, reset form for batch logging
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setDate(todayISO());
    setLocation('');
    setNotes('');
    setWeather('');
    setTimeOfDay('');
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={`Log sighting for ${speciesName}`}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl flex flex-col max-h-[90dvh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200">
          <div>
            <h2 className="font-semibold text-stone-800">Log sighting</h2>
            <p className="text-sm text-emerald-700 font-medium">{speciesName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 text-xl leading-none p-1"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {/* Date */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              max={todayISO()}
              onChange={e => setDate(e.target.value)}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500 mb-1">
              Location <span className="text-stone-400 normal-case font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. backyard, pond, trail"
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500 mb-1">
              Notes <span className="text-stone-400 normal-case font-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="What were they doing? Any interesting behavior?"
              rows={3}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          {/* Advanced toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(v => !v)}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
          >
            <span>{showAdvanced ? '▲' : '▼'}</span>
            Conditions
          </button>

          {showAdvanced && (
            <div className="grid grid-cols-2 gap-3">
              {/* Weather */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500 mb-1">
                  Weather
                </label>
                <select
                  value={weather}
                  onChange={e => setWeather(e.target.value as WeatherCondition | '')}
                  className="w-full border border-stone-300 rounded-lg px-2 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">—</option>
                  <option value="sunny">☀ Sunny</option>
                  <option value="cloudy">☁ Cloudy</option>
                  <option value="rainy">🌧 Rainy</option>
                  <option value="snowy">❄ Snowy</option>
                </select>
              </div>

              {/* Time of day */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500 mb-1">
                  Time
                </label>
                <select
                  value={timeOfDay}
                  onChange={e => setTimeOfDay(e.target.value as TimeOfDay | '')}
                  className="w-full border border-stone-300 rounded-lg px-2 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">—</option>
                  <option value="morning">🌅 Morning</option>
                  <option value="afternoon">☀ Afternoon</option>
                  <option value="evening">🌆 Evening</option>
                  <option value="night">🌙 Night</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={!date}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-200 disabled:text-stone-400 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            {saved ? '✓ Saved!' : 'Save sighting'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm text-stone-500 hover:text-stone-700 font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
