import { useState } from 'react';

/**
 * Custom hook for managing expanded/collapsed state of items.
 * Uses a Set for efficient lookups and supports toggle functionality.
 * 
 * @param initialValue - Initial expanded keys (optional)
 * @returns [expandedSet, toggle, set] for managing expanded state
 */
export function useExpandedState(initialValue?: Set<string>) {
  const [expanded, setExpanded] = useState<Set<string>>(initialValue ?? new Set());

  const toggle = (key: string) => {
    const newSet = new Set(expanded);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setExpanded(newSet);
  };

  return [expanded, toggle, setExpanded] as const;
}
