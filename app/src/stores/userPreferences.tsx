import { createContext, useContext, useState, useEffect } from 'react';

interface UserPreferences {
  showThumbnailsInList: boolean;
}

const defaultPreferences: UserPreferences = {
  showThumbnailsInList: false,
};

const STORAGE_KEY = 'living-patch-preferences';

interface ContextValue {
  preferences: UserPreferences;
  setPreferences: (prefs: UserPreferences) => void;
}

const UserPreferencesContext = createContext<ContextValue | null>(null);

export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferencesState] = useState<UserPreferences>(defaultPreferences);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setPreferencesState(JSON.parse(stored));
      } catch {
        setPreferencesState(defaultPreferences);
      }
    }
    setIsHydrated(true);
  }, []);

  const setPreferences = (prefs: UserPreferences) => {
    setPreferencesState(prefs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  };

  if (!isHydrated) {
    return null;
  }

  return (
    <UserPreferencesContext.Provider value={{ preferences, setPreferences }}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useUserPreferences must be used within UserPreferencesProvider');
  }
  return context;
}
