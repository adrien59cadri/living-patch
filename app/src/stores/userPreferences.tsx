import { useState } from 'react';
import {
  UserPreferencesContext,
  defaultPreferences,
  STORAGE_KEY,
  type UserPreferences,
} from '../hooks/useUserPreferences';

function getStoredPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultPreferences;
  } catch {
    return defaultPreferences;
  }
}

export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferencesState] = useState<UserPreferences>(getStoredPreferences);

  const setPreferences = (prefs: UserPreferences) => {
    setPreferencesState(prefs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  };

  return (
    <UserPreferencesContext.Provider value={{ preferences, setPreferences }}>
      {children}
    </UserPreferencesContext.Provider>
  );
}
