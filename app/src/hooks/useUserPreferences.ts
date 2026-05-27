import { createContext, useContext } from 'react';

export interface UserPreferences {
  showThumbnailsInList: boolean;
}

export const defaultPreferences: UserPreferences = {
  showThumbnailsInList: false,
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
