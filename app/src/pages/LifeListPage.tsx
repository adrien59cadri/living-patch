import { useState } from 'react';
import { AllSpeciesTab } from '../components/LifeList/AllSpeciesTab';
import { ByTierTab } from '../components/LifeList/ByTierTab';
import { CalendarView } from '../components/CalendarView';
import { StatsPanel } from '../components/StatsPanel';

type Tab = 'all' | 'by-tier' | 'calendar' | 'stats';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: '🌿' },
  { id: 'by-tier', label: 'By Tier', icon: '🪜' },
  { id: 'calendar', label: 'Calendar', icon: '📅' },
  { id: 'stats', label: 'Stats', icon: '📊' },
];

export default function LifeListPage() {
  const [activeTab, setActiveTab] = useState<Tab>('all');

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-stone-800">My Life List</h1>

      {/* Tab bar */}
      <div className="flex border-b border-stone-200 sticky top-[57px] bg-stone-50 z-10 -mx-4 px-4">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
              activeTab === tab.id
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-stone-500 hover:text-stone-700',
            ].join(' ')}
            aria-selected={activeTab === tab.id}
            role="tab"
          >
            <span aria-hidden="true">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div role="tabpanel">
        {activeTab === 'all' && <AllSpeciesTab />}
        {activeTab === 'by-tier' && <ByTierTab />}
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'stats' && <StatsPanel />}
      </div>
    </div>
  );
}
