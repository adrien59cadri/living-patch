import { useState } from 'react';
import { useDataset } from '../hooks/useDataset';
import FormHierarchySection from '../components/FormHierarchySection';
import HabitatHierarchySection from '../components/HabitatHierarchySection';
import KeystoneTypesSection from '../components/KeystoneTypesSection';
import SymbiosisSection from '../components/SymbiosisSection';
import ConservationStatusSection from '../components/ConservationStatusSection';
import EcologicalStatusSection from '../components/EcologicalStatusSection';
import SpecialistDependenciesSection from '../components/SpecialistDependenciesSection';

export default function LearnPage() {
  const { speciesById, symbiosis } = useDataset();
  const [expandedKeystoneType, setExpandedKeystoneType] = useState<string | null>(null);
  const [expandedSymbiosisType, setExpandedSymbiosisType] = useState<string | null>(null);
  const [expandedConservationStatus, setExpandedConservationStatus] = useState<string | null>(null);
  const [expandedEcologicalStatus, setExpandedEcologicalStatus] = useState<string | null>(null);
  const [expandedSpecialistKey, setExpandedSpecialistKey] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-800">Learn</h1>
          <p className="text-stone-600 mt-2">
            Understand the ecological relationships in our region and how species interact.
          </p>
        </div>

        <div className="space-y-8">
          <FormHierarchySection speciesById={speciesById} />

          <HabitatHierarchySection speciesById={speciesById} />

          <KeystoneTypesSection
            expanded={expandedKeystoneType}
            onToggle={setExpandedKeystoneType}
            speciesById={speciesById}
          />

          <SymbiosisSection
            expanded={expandedSymbiosisType}
            onToggle={setExpandedSymbiosisType}
            speciesById={speciesById}
            symbiosis={symbiosis}
          />

          <ConservationStatusSection
            expanded={expandedConservationStatus}
            onToggle={setExpandedConservationStatus}
            speciesById={speciesById}
          />

          <EcologicalStatusSection
            expanded={expandedEcologicalStatus}
            onToggle={setExpandedEcologicalStatus}
            speciesById={speciesById}
          />

          <SpecialistDependenciesSection
            expanded={expandedSpecialistKey}
            onToggle={setExpandedSpecialistKey}
            speciesById={speciesById}
          />
        </div>

        <p className="mt-10 text-xs text-stone-400 text-center">
          Your data stays on your device — life list and sightings are stored locally in your browser only. Species images load from Wikimedia Commons.
        </p>
      </div>
    </div>
  );
}
