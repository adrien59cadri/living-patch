import { createContext, useContext } from 'react';
import type { EcologicalStatusMode } from '../types';

export interface UserPreferences {
  showThumbnailsInList: boolean;
  ecologicalStatusMode: EcologicalStatusMode;
}

export const defaultPreferences: UserPreferences = {
  showThumbnailsInList: false,
  ecologicalStatusMode: 'all',
};

export const STORAGE_KEY = 'living-patch-preferences';

export interface ContextValue {
  preferences: UserPreferences;
  setPreferences: (prefs: UserPreferences) => void;
}

export const UserPreferencesContext = createContext<ContextValue | null>(null);

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useUserPreferences must be used within UserPreferencesProvider');
  }
  return context;
}
