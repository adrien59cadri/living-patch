import { useState } from 'react';
import { useDataset } from '../hooks/useDataset';
import FormHierarchySection from '../components/FormHierarchySection';
import KeystoneTypesSection from '../components/KeystoneTypesSection';
import SymbiosisSection from '../components/SymbiosisSection';

export default function LearnPage() {
  const { speciesById, symbiosis } = useDataset();
  const [expandedForm, setExpandedForm] = useState<string | null>(null);
  const [expandedKeystoneType, setExpandedKeystoneType] = useState<string | null>(null);
  const [expandedSymbiosisType, setExpandedSymbiosisType] = useState<string | null>(null);

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
          <FormHierarchySection
            expanded={expandedForm}
            onToggle={setExpandedForm}
            speciesById={speciesById}
          />

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
        </div>
      </div>
    </div>
  );
}
